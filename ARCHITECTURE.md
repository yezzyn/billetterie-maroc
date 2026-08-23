# 🏗️ Architecture Technique

## Vue d'Ensemble

```
┌──────────────────────────────────────────────────────────────┐
│                    CLIENT (Navigateur)                        │
│  Next.js 16 + React 19 + TypeScript + Tailwind CSS v4        │
│  next-intl (ar RTL / fr / en) · Framer Motion · Recharts     │
└──────────────────────────────────────────────────────────────┘
                              │ HTTPS
                              ▼
┌──────────────────────────────────────────────────────────────┐
│              NEXT.JS (SSR + API Routes)                       │
│  - Pages [locale] : (auth) (main) (admin)                     │
│  - Middleware : i18n + protection dashboard/validator         │
│  - API Routes : auth, events, reservations, tickets, admin    │
└──────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
        ┌─────────────┐ ┌──────────┐ ┌──────────────┐
        │ PostgreSQL  │ │  Redis   │ │ SMS/Paiement │
        │ (Prisma 7)  │ │ Sessions │ │ (simulés)    │
        │             │ │ + OTP    │ │              │
        └─────────────┘ └──────────┘ └──────────────┘
```

## Flux de Données

### Authentification
```
Client → POST /api/auth/register → Prisma → PostgreSQL (User, bcrypt)
                                → Redis (otp:phone, TTL 10 min)
Client → POST /api/auth/verify-otp → Redis (vérif + suppression)
                                   → JWT signé → cookie httpOnly
                                   → Redis (session:token, TTL 7 j)
```

### Réservation
```
Client → GET /api/events/[id]/seats → zones + sièges adressés
Client → (file d'attente, auth requise) → POST /api/reservations
        → transaction : re-vérification AVAILABLE → LOCKED
        → Reservation (snapshot adressage + QR unique, 10 min)
Client → POST /api/reservations/[id]/pay → PAID + seat SOLD
        (expiration → place libérée + réservation EXPIRED)
```

### Validation (entrée stade)
```
Agent → scanner caméra (html5-qrcode) → POST /api/tickets/validate
      → requireRole(ADMIN|VALIDATOR)
      → transaction : PAID → USED + usedAt (anti-rejeu)
```

## Sécurité

- **JWT** en cookie httpOnly (sameSite lax, secure en prod)
- **Sessions Redis** TTL 7 jours · **OTP** TTL 10 min, usage unique
- **Mots de passe** bcrypt 12 rounds
- **Rôles** : `requireRole()` côté API + middleware (redirection login) pour `/dashboard` et `/validator`
- **Propriété des ressources** : toute réservation n'est lisible/modifiable que par son propriétaire
- **Anti-fraude QR** : hash + eventId + seatId vérifiés en transaction, usage unique

## Performance

- Lazy loading : `next/image` (cartes événements), import dynamique de @react-pdf/renderer
- Look-up O(1) des sièges dans le plan SVG (Map indexée)
- Index PostgreSQL sur les champs de requête fréquents (cin, phone, status, block…)
- Fallback mémoire Redis transparent en développement

## Environnement Développement (cette machine)

- Node.js 22 installé localement (`~/.local/node`)
- PostgreSQL via Postgres.app (port 5432) — `docker-compose.yml` fourni pour Docker
- Redis : fallback mémoire automatique si injoignable

## Coûts Estimés (Production)

| Service | Offre | Prix |
|---|---|---|
| Vercel | Pro | $20/mois |
| Supabase | Pro (8 GB) | $25/mois |
| Upstash Redis | Pay-as-you-go | ~$1-5/mois |
| SMS (Twilio MA) | $0.0079/SMS | ~$8/1000 SMS |

**Total estimé** : ~$50-100/mois pour 10 000 utilisateurs.
