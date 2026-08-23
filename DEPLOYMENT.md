# 🚀 Guide de Déploiement — Vercel + Supabase + Upstash

## Prérequis
- Compte GitHub · Vercel (gratuit) · Supabase (gratuit) · Upstash (gratuit)

## Étape 1 : Supabase (PostgreSQL)
1. https://supabase.com → "New Project" → nom : `billetterie-maroc`
2. Mot de passe DB fort, région **West Europe (Ireland)** ou **Frankfurt** (proche du Maroc)
3. Settings → Database → copier la "Connection string" (URI)
4. Format : `postgresql://postgres.[project]:[password]@db.[project].supabase.co:5432/postgres`
5. Ajouter `?pgbouncer=true&connection_limit=1` pour `DATABASE_URL` (Vercel) ; garder une version sans pgbouncer pour `DIRECT_URL`

## Étape 2 : Upstash (Redis)
1. https://upstash.com → "Create Database" → nom : `billetterie-redis`
2. Région **AWS eu-central-1 (Frankfurt)**
3. Copier l'URL Redis : format `redis://default:[TOKEN]@[HOST].upstash.io:6379`
4. La détection Upstash (TLS + retry) est **automatique** dans `src/lib/redis.ts`

## Étape 3 : GitHub
```bash
git init
git add .
git commit -m "feat: initial commit"
git remote add origin https://github.com/votre-user/billetterie-maroc.git
git push -u origin main
```

## Étape 4 : Vercel
1. https://vercel.com → "Add New Project" → importer le repo GitHub
2. Framework Preset : **Next.js**
3. Variables d'environnement :
   - `DATABASE_URL` (Supabase avec pgbouncer)
   - `DIRECT_URL` (Supabase sans pgbouncer)
   - `REDIS_URL` (Upstash)
   - `JWT_SECRET` — générer : `openssl rand -hex 32`
   - `TWILIO_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE` (optionnel, SMS OTP)
   - `NEXT_PUBLIC_APP_URL` (à compléter après le 1er déploiement)
4. "Deploy" (2-3 min) — `postinstall` exécute `prisma generate` automatiquement

## Étape 5 : Post-Déploiement
1. Copier l'URL Vercel (ex : `billetterie-maroc.vercel.app`)
2. Vercel → Settings → Environment Variables → mettre à jour `NEXT_PUBLIC_APP_URL`
3. Redéployer

## Étape 6 : Migrations + Seed
```bash
npm i -g vercel
vercel link
vercel env pull .env.production.local
npx prisma migrate deploy
npm run seed
```

## Ou : préparation locale
```bash
npm run deploy:prepare   # vérifie les variables, applique les migrations, build
```

## Variables d'Environnement Requises

| Variable | Source | Exemple |
|---|---|---|
| DATABASE_URL | Supabase | `postgresql://...?pgbouncer=true&connection_limit=1` |
| DIRECT_URL | Supabase | `postgresql://...` (sans pgbouncer) |
| REDIS_URL | Upstash | `redis://default:xxx@xxx.upstash.io:6379` |
| JWT_SECRET | Générer | `openssl rand -hex 32` |
| NEXT_PUBLIC_APP_URL | Vercel | `https://xxx.vercel.app` |
| TWILIO_* | Twilio | optionnel (sinon OTP en console) |

## Coûts

| Service | Gratuit | Payant |
|---|---|---|
| Vercel | 100 GB/mois | $20/mois |
| Supabase | 500 MB | $25/mois (8 GB) |
| Upstash | 10k cmd/jour | $0.20/1M cmd |
| **Total** | **$0** | **~$50/mois** |

## Monitoring
- Vercel Analytics · Supabase Dashboard · Upstash Dashboard

## Notes
- Le fallback mémoire Redis reste actif si Upstash est momentanément injoignable, mais configurez bien `REDIS_URL` pour la persistance des sessions.
- L'OTP passe automatiquement par Twilio quand `NODE_ENV=production` **et** `TWILIO_SID` sont définis ; sinon `[FALLBACK]` en logs.
