#!/bin/bash
# ============================================
# DÉPLOIEMENT AUTOMATIQUE COMPLET
# ============================================
set -e # Arrêter le script en cas d'erreur

# Charger la configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$SCRIPT_DIR/deploy.config.sh"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_step() { echo -e "\n${CYAN}═══ ÉTAPE $1: $2 ═══${NC}\n"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_info() { echo -e "${BLUE}ℹ️ $1${NC}"; }

# Génération des secrets si vides
if [ -z "$JWT_SECRET" ]; then
  JWT_SECRET=$(openssl rand -hex 32)
  log_info "JWT_SECRET généré automatiquement."
fi

if [ -z "$DB_PASSWORD" ]; then
  DB_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=' | head -c 20)
  log_info "Mot de passe DB généré : $DB_PASSWORD (Notez-le !)"
fi

log_step "1" "PRÉPARATION GIT"
git add .
git commit -m "chore: préparation déploiement production" || true
git push -u origin main || log_info "Push ignoré si pas de modifications."
log_success "Code synchronisé avec GitHub"

log_step "2" "CRÉATION SUPABASE (PostgreSQL)"
log_info "Création du projet Supabase en arrière-plan..."
# Note : Si cette commande échoue, créez le projet manuellement sur supabase.com
SUPABASE_OUTPUT=$(supabase projects create "$PROJECT_NAME" --region "$SUPABASE_REGION" --db-password "$DB_PASSWORD" --output json 2>/dev/null || echo '{"id":"MANUEL"}')
SUPABASE_PROJECT_ID=$(echo "$SUPABASE_OUTPUT" | jq -r '.id' 2>/dev/null || echo "MANUEL")

if [ "$SUPABASE_PROJECT_ID" == "MANUEL" ]; then
  log_info "Veuillez créer le projet manuellement sur https://supabase.com si le CLI a échoué."
  log_info "Région : $SUPABASE_REGION | Mot de passe : $DB_PASSWORD"
  read -p "Appuyez sur Entrée une fois le projet créé et l'URL de connexion copiée..."
  read -p "Collez l'URL de connexion Supabase (avec pgbouncer) : " SUPABASE_DB_URL
  read -p "Collez l'URL de connexion Supabase (SANS pgbouncer) : " SUPABASE_DIRECT_URL
else
  SUPABASE_DB_URL="postgresql://postgres.$SUPABASE_PROJECT_ID:$DB_PASSWORD@db.$SUPABASE_PROJECT_ID.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
  SUPABASE_DIRECT_URL="postgresql://postgres.$SUPABASE_PROJECT_ID:$DB_PASSWORD@db.$SUPABASE_PROJECT_ID.supabase.co:5432/postgres"
  log_success "Projet Supabase créé : $SUPABASE_PROJECT_ID"
fi

log_step "3" "CRÉATION UPSTASH (Redis)"
log_info "Création de la base Redis..."
UPSTASH_OUTPUT=$(upstash redis create "$REDIS_NAME" --region "$UPSTASH_REGION" --output json 2>/dev/null || echo '{"endpoint":"MANUEL","password":"MANUEL"}')
UPSTASH_ENDPOINT=$(echo "$UPSTASH_OUTPUT" | jq -r '.endpoint' 2>/dev/null)
UPSTASH_TOKEN=$(echo "$UPSTASH_OUTPUT" | jq -r '.password' 2>/dev/null)

if [ "$UPSTASH_ENDPOINT" == "MANUEL" ]; then
  log_info "Veuillez créer la base Redis manuellement sur https://upstash.com"
  read -p "Appuyez sur Entrée une fois créée, puis collez l'URL Redis complète (redis://...) : " UPSTASH_REDIS_URL
else
  UPSTASH_REDIS_URL="redis://default:$UPSTASH_TOKEN@$UPSTASH_ENDPOINT:6379"
  log_success "Base Redis Upstash créée"
fi

log_step "4" "CONFIGURATION VERCEL"
log_info "Configuration des variables d'environnement sur Vercel..."
vercel env add DATABASE_URL production <<< "$SUPABASE_DB_URL"
vercel env add DIRECT_URL production <<< "$SUPABASE_DIRECT_URL"
vercel env add REDIS_URL production <<< "$UPSTASH_REDIS_URL"
vercel env add JWT_SECRET production <<< "$JWT_SECRET"
vercel env add NODE_ENV production <<< "production"
log_success "Variables d'environnement injectées"

log_step "5" "DÉPLOIEMENT SUR VERCEL"
log_info "Lancement du déploiement (cela peut prendre 2-3 minutes)..."
VERCEL_OUTPUT=$(vercel --prod --yes --output json 2>/dev/null)
VERCEL_URL=$(echo "$VERCEL_OUTPUT" | jq -r '.url' 2>/dev/null)

if [ -z "$VERCEL_URL" ] || [ "$VERCEL_URL" == "null" ]; then
  log_info "Déploiement via CLI échoué ou déjà fait. Utilisation de vercel --prod..."
  vercel --prod --yes
  log_info "Récupération de l'URL via le dashboard Vercel..."
else
  log_success "Déployé sur : https://$VERCEL_URL"
  vercel env add NEXT_PUBLIC_APP_URL production <<< "https://$VERCEL_URL"
  vercel --prod --yes # Redéploiement pour prendre en compte NEXT_PUBLIC_APP_URL
fi

log_step "6" "MIGRATION ET SEED DE LA BASE DE DONNÉES"
log_info "Application des migrations Prisma sur la base de production..."
export DATABASE_URL="$SUPABASE_DB_URL"
npx prisma migrate deploy
log_success "Migrations appliquées"

log_info "Insertion des données de test (Seed)..."
npm run seed
log_success "Données insérées"

echo -e "\n${GREEN}============================================"
echo "  🎉 DÉPLOIEMENT RÉUSSI !"
echo "============================================${NC}"
echo -e "🌐 Application : ${BLUE}https://$VERCEL_URL${NC}"
echo -e "🗄️  Supabase   : ${BLUE}https://app.supabase.com/project/$SUPABASE_PROJECT_ID${NC}"
echo -e "\n${YELLOW}⚠️  SAUVEGARDEZ CES IDENTIFIANTS :${NC}"
echo "Mot de passe DB : $DB_PASSWORD"
echo "JWT Secret      : $JWT_SECRET"
echo -e "${GREEN}============================================${NC}\n"