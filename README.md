# 🎫 Billetterie Maroc — Plateforme de Billetterie Professionnelle

## 📋 Vue d'ensemble

Plateforme de billetterie complète aux standards marocains (FRMF/Caf), permettant la vente de billets pour des événements sportifs et culturels avec :

- Authentification sécurisée (CIN + OTP)
- File d'attente virtuelle équitable (protégée par authentification)
- Plan de stade interactif paramétrable (adressage Entrance/Gate/Access/Block/Row/Seat)
- Paiement multi-canaux (CMI, CashPlus, Wafacash, BaridCash — simulation)
- Billets PDF standard FRMF avec QR Code unique
- Validation anti-fraude par scan (usage unique)
- Dashboard admin avec statistiques (Recharts)
- Multilingue complet : Arabe (RTL, défaut), Français, Anglais

## 🛠️ Stack Technique

### Frontend
- **Framework** : Next.js 16 (App Router)
- **Langage** : TypeScript (strict mode)
- **Styling** : Tailwind CSS v4
- **Animations** : Framer Motion
- **i18n** : next-intl (ar RTL / fr / en)
- **Charts** : Recharts · **PDF** : @react-pdf/renderer · **QR** : qrcode + html5-qrcode

### Backend
- **Runtime** : Node.js (Next.js API Routes)
- **Base de données** : PostgreSQL 16
- **ORM** : Prisma 7
- **Cache/Sessions** : Redis (avec fallback mémoire automatique en dev)
- **Auth** : JWT + bcrypt (12 rounds) + OTP 6 chiffres

## 🚀 Démarrage Rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env   # puis éditer DATABASE_URL, JWT_SECRET, REDIS_URL

# 3. Services locaux (optionnel — sinon PostgreSQL/Redis locaux)
docker-compose up -d

# 4. Appliquer les migrations
npx prisma migrate deploy
npx prisma generate

# 5. Seeder la base (stade, événement, 1850 places, comptes de test)
npm run seed

# 6. Lancer le serveur de développement
npm run dev
```

Application : http://localhost:3000 (redirige vers `/ar`).

## 👥 Comptes de Test

| Rôle | Téléphone | Mot de passe | Accès |
|---|---|---|---|
| Admin | `+212600000000` | `Admin123!` | Dashboard, gestion événements, configurateur |
| Validateur | `+212600000001` | `Valid123!` | Scanner QR |
| Utilisateur | `+212612345678` | `password123` | Achat de billets |

**Note** : en développement, l'OTP s'affiche dans les logs du serveur (`[DEV] OTP for +212...: 123456`).

## 📊 Modèles de Données Principaux

- **User** — CIN, téléphone, rôle (USER/ADMIN/VALIDATOR)
- **Venue / Event** — lieux, événements, statuts, prix min/max
- **StadiumConfig / StadiumZoneConfig** — configuration paramétrable (forme, zones, adressage)
- **StadiumZone / StadiumSeat** — zones matérialisées, sièges avec lettres de rangée
- **Seat** — places réservables par événement avec adressage dénormalisé
- **Reservation** — snapshot d'adressage, QR Code unique, statut (PENDING → PAYMENT_PENDING → PAID → USED / EXPIRED)
- **WaitingQueue** — file d'attente (position, token)
- **AuditLog** — journalisation

## 🔁 Flux Principaux

**Authentification** : Inscription (CIN + téléphone) → OTP → JWT en cookie httpOnly + session Redis (7 jours).

**Réservation** : Plan interactif → file d'attente (auth requise) → allocation + verrouillage place (10 min) → paiement → billet PDF/QR → scan à l'entrée (PAID → USED, anti-rejeu).

## 📱 API (résumé)

- `POST /api/auth/{register,login,verify-otp,logout}` · `GET /api/auth/me`
- `GET /api/events` · `GET /api/events/[id]` · `GET /api/events/[id]/seats`
- `POST /api/reservations` · `POST /api/reservations/[id]/pay` · `GET /api/reservations/[id]`
- `POST /api/tickets/validate` (ADMIN/VALIDATOR)
- `GET /api/admin/stats` · `PATCH /api/admin/events/[id]/status` · `POST|GET /api/admin/stadium-config`

Documentation détaillée : [`docs/API.md`](docs/API.md)

## 🌍 Internationalisation

`messages/{ar,fr,en}.json` — namespaces : common, home, footer, auth, events, waiting, payment, ticket, stadium, admin, validator. L'arabe est la langue par défaut avec RTL complet.

## 🏟️ Système de Stades Paramétrable

Configurateur admin (`/[locale]/events/new`) avec 3 templates (Tanger, Marrakech, Mohammed V), aperçu SVG live, zones personnalisables (catégorie CAT1/2/3, couleur, prix, adressage) et sauvegarde en base.

## ⚠️ Limitations Connues

1. **SMS OTP** : simulé (console.log en dev)
2. **Paiement CMI** : simulation (webhook à implémenter)
3. **Matérialisation configs** : les configs sauvegardées ne génèrent pas encore les places automatiquement
4. **Emails** : non implémentés · **Tests automatisés** : non écrits

Voir [`docs/GUIDE_DEVELOPPEMENT.md`](docs/GUIDE_DEVELOPPEMENT.md) pour la roadmap détaillée.

## Guide de Déploiement (Production)

```bash
vercel --prod                          # Frontend + API
npx prisma migrate deploy              # DB (Supabase/Neon)
# Redis : Upstash → REDIS_URL
```

Variables requises : `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET` (fort), `NODE_ENV=production`.

---

**Développé avec ❤️ au Maroc** 🇲🇦
