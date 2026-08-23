#!/bin/bash
# ============================================
# SETUP INITIAL DES COMPTES
# ============================================

# Couleurs pour le terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== SETUP DES COMPTES DE DÉPLOIEMENT ===${NC}"

# Fonction pour vérifier et installer un outil
check_tool() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${YELLOW}⚠️ $1 n'est pas installé. Installation...${NC}"
    eval $2
  else
    echo -e "${GREEN}✅ $1 est installé${NC}"
  fi
}

# 1. Vérifier les outils de base
check_tool "git" "brew install git"
check_tool "node" "brew install node"
check_tool "jq" "brew install jq"

# 2. Vérifier les CLI de déploiement
check_tool "vercel" "npm i -g vercel"
check_tool "supabase" "npm i -g supabase"
check_tool "upstash" "npm i -g @upstash/cli"
check_tool "gh" "brew install gh"

echo -e "\n${BLUE}=== VÉRIFICATION DES CONNEXIONS ===${NC}"

# GitHub
if gh auth status &> /dev/null; then
  echo -e "${GREEN}✅ GitHub CLI authentifié${NC}"
else
  echo -e "${YELLOW}⚠️ Connexion à GitHub requise...${NC}"
  gh auth login --web
fi

# Vercel
if vercel whoami &> /dev/null; then
  echo -e "${GREEN}✅ Vercel authentifié${NC}"
else
  echo -e "${YELLOW}⚠️ Connexion à Vercel requise...${NC}"
  vercel login
fi

# Supabase
if supabase projects list &> /dev/null 2>&1; then
  echo -e "${GREEN}✅ Supabase authentifié${NC}"
else
  echo -e "${YELLOW}⚠️ Connexion à Supabase requise...${NC}"
  supabase login
fi

echo -e "\n${GREEN}🎉 Setup terminé ! Vous pouvez maintenant lancer ./scripts/deploy.sh${NC}"