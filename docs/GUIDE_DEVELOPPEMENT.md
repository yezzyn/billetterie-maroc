# 🛠️ Guide de Développement

Ce document est destiné aux développeurs qui reprennent le projet.

## 📋 Checklist de Prise en Main

### 1. Environnement

```bash
npm install
cp .env.example .env          # éditer DATABASE_URL, JWT_SECRET, REDIS_URL
docker-compose up -d           # optionnel (PostgreSQL + Redis)
npx prisma migrate deploy && npx prisma generate
npm run seed
npm run dev
```

### 2. Lire dans l'ordre
1. `README.md` — vue d'ensemble
2. `ARCHITECTURE.md` — architecture technique
3. `docs/API.md` — documentation API
4. `prisma/schema.prisma` — schéma de base de données

### 3. Tester le Flux Complet

1. Inscription : `/fr/register`
2. Connexion : `/fr/login`
3. Événements : `/fr/events`
4. Détail + sélection places : `/fr/events/[id]` et `/select-seats`
5. File d'attente (auth requise) : `/fr/waiting-room`
6. Paiement : `/fr/payment`
7. Billet + PDF : `/fr/ticket/[id]`
8. Scanner : `/fr/validator` (ADMIN/VALIDATOR)
9. Dashboard : `/fr/dashboard` (ADMIN) · Configurateur : `/fr/events/new` (ADMIN)

## 🚧 Fonctionnalités à Implémenter

### Priorité Haute

#### 1. Matérialisation des Configs de Stade
Générer les `StadiumZone`/`StadiumSeat` (et les `Seat` d'événement) à partir d'une `StadiumConfig` sauvegardée.

- Créer : `src/app/api/admin/stadium-config/[id]/materialize/route.ts`
- Ajouter un bouton « Générer les places » dans `StadiumConfigurator.tsx`

```typescript
for (const zoneConfig of config.zones) {
  const zone = await prisma.stadiumZone.create({
    data: {
      venueId: config.venueId,
      name: zoneConfig.name,
      entrance: zoneConfig.entrance ?? 'E01',
      gate: zoneConfig.gate ?? '10',
      access: zoneConfig.access ?? '02',
      block: zoneConfig.block,
      category: zoneConfig.category,
      price: zoneConfig.price,
      color: zoneConfig.color,
      rows: zoneConfig.rows,
      seatsPerRow: zoneConfig.seatsPerRow
    }
  });

  const seats = [];
  for (let row = 0; row < zoneConfig.rows; row++) {
    const rowLetter = String.fromCharCode(65 + row);
    for (let seat = 1; seat <= zoneConfig.seatsPerRow; seat++) {
      seats.push({ zoneId: zone.id, rowLetter, seatNumber: String(seat), status: 'active' });
    }
  }
  await prisma.stadiumSeat.createMany({ data: seats });
}
```

#### 2. Intégration SMS Réelle
Remplacer le `console.log` dans `src/app/api/auth/{register,login}/route.ts` et `src/lib/otp.ts` par un provider (Twilio, Infobip, agrégateur marocain).

#### 3. Intégration Paiement CMI
Créer `src/app/api/payment/cmi/route.ts` (redirection) et `src/app/api/webhooks/cmi/route.ts` (confirmation → PAID). Documentation : https://www.cmi.ma

### Priorité Moyenne
4. **Email de confirmation** avec PDF attaché (nodemailer, dans `pay/route.ts`)
5. **Page « Mes billets »** : `src/app/[locale]/(main)/my-tickets/page.tsx` (liste des réservations de l'utilisateur)
6. **Notifications push** (web-push)

### Priorité Basse
7. Marketplace de revente · 8. Abonnements saison · 9. Analytics avancés

## 🐛 Debugging

| Problème | Solution |
|---|---|
| Migration Prisma bloque | `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`, placer le SQL dans `prisma/migrations/<nom>/migration.sql`, puis `npx prisma migrate deploy` |
| Redis indisponible | Fallback mémoire automatique ; forcer Redis : `docker-compose up -d redis` |
| OTP invisible | Logs du serveur : `[DEV] OTP for +212…: 123456` (gardé hors production via guard NODE_ENV) |
| Erreur d'hydratation | Causée par `Date.now()`/`Math.random()` au rendu → `useState` + `useEffect` |
| Sessions perdues | Normal sans Redis persistant — se reconnecter |
| Client Prisma obsolète après migration | `npx prisma generate` puis redémarrer `npm run dev` |

## 📝 Conventions de Code

- **TypeScript strict, zéro `any`** — interfaces pour les props
- **Nommage** : composants PascalCase, utilitaires camelCase, routes kebab-case
- **Styles** : Tailwind uniquement, classes RTL logiques (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`)
- **i18n** : tout texte visible passe par `messages/{ar,fr,en}.json`
- **Commits** : `type(scope): description` (feat, fix, docs, style, refactor, test, chore)

## 🧪 Tests

Manuels : flux complet (inscription → billet), rôles (USER ≠ admin), i18n (3 langues), RTL arabe, responsive.

À implémenter :
```bash
npm install -D jest @types/jest ts-jest          # unitaires
npm install -D @playwright/test && npx playwright install  # E2E
```

## 📚 Ressources

- Next.js / Prisma / Tailwind / Framer Motion : documentations officielles
- Inspiration design : Ticketmaster, Eventbrite, Webook.ma
- Outils : Postman (API), Figma (maquettes), Vercel/Supabase (déploiement)

---

**Bon développement !** 🚀
