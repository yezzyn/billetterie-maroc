# Changelog

## 2026-08-22 — Préparation déploiement production (Vercel + Supabase + Upstash)
- `.env.example` (template complet) et `.env.local` (dev) ; `.gitignore` : exception `!.env.example`
- `redis.ts` : détection automatique Upstash/`rediss://` en production (TLS, retry assoupli)
- OTP : helper partagé `sendOtpSms()` — Twilio en production (import dynamique, fallback logs), console.log en dev ; utilisé par register/login/otp.ts ; `twilio` installé
- `scripts/deploy.sh` (vérif variables + migrations + build, exécutable) et `npm run deploy:prepare`
- `postinstall: prisma generate` pour Vercel
- `DEPLOYMENT.md` : guide complet Supabase/Upstash/Vercel avec coûts
- Fix build : `useSearchParams` de la waiting-room enveloppé dans `<Suspense>` — `npm run build` passe

## 2026-08-22 — Sécurisation file d'attente + documentation complète
- `GET /api/auth/me` : profil de l'utilisateur connecté (session Redis + Prisma)
- Page waiting-room : vérification d'authentification au montage — redirection `/login?callbackUrl=…` et écran « Accès refusé » traduit (3 langues)
- Documentation : `README.md` (vue d'ensemble, démarrage, comptes de test, flux), `ARCHITECTURE.md` (diagramme, flux, sécurité, coûts), `docs/API.md` (tous les endpoints avec exemples), `docs/GUIDE_DEVELOPPEMENT.md` (roadmap priorisée, debugging, conventions)

## 2026-08-22 — Système de stade paramétrable (configurateur visuel)
- Modèles `StadiumConfig` (forme ovale/rectangulaire, dimensions terrain, capacité) et `StadiumZoneConfig` (catégorie, forme, position JSON, couleur, rangées, adressage) + migration
- `POST /api/admin/stadium-config` : sauvegarde transactionnelle (ADMIN uniquement) ; `GET` : liste des lieux
- `StadiumConfigurator` : 3 templates préchargés (Tanger, Marrakech, Mohammed V), aperçu SVG live (terrain à l'échelle des mètres + zones cliquables), édition des zones (nom, catégorie, block, couleur, prix, rangées), capacité calculée
- Page admin `/[locale]/(admin)/events/new` avec sélecteur de lieu
- `StadiumMap` : prop `shape` (bol ovale ou rectangulaire selon la config enregistrée)

## 2026-08-22 — Tribunes incurvées professionnelles
- `StadiumMap` : les zones sont maintenant des **paths SVG incurvés** (arc externe + arc interne inversé) qui épousent la forme ovale du stade et restent **collées au terrain** (pas d'espace mort)
- Chaque demi-cercle (nord/sud/est/ouest) est réparti entre ses zones ; sièges disposés sur des **arcs concentriques** (5 rangées × 12, écartement 14px)
- Terrain : ellipse horizontale rayée avec surfaces de réparation gauche/droite et points de penalty
- Labels Block + CAT positionnés à l'extérieur de chaque courbe (coordonnées polaires)
- Code unifié : un seul helper de placement contre les 4 blocs dupliqués du spec (qui référençait aussi `seat.id` hors de portée)

## 2026-08-22 — Refonte standard Maroc (adressage complet + PDF FRMF)
- Schéma : `StadiumZone` (entrance/gate/access/block/category CAT1-3/prix/couleur) remplace `StadiumSection` ; `StadiumSeat` avec `rowLetter` (A, B, BB) et `seatNumber` alphanumérique ; champs d'adressage ajoutés à `Seat` et `Reservation` (snapshot au moment de la réservation)
- Seed : 6 zones FRMF (blocks 305/313 CAT1, 201/225 CAT2, 139/105 CAT3) + remappage des 1850 places avec adressage complet
- API `/api/events/[id]/seats` : zones avec sièges adressés ; réservation : snapshot entrance/gate/access/block/row/seat
- `StadiumMap` : SVG paysage, terrain horizontal, zones colorées par catégorie (rouge CAT1 / bleu CAT2 / vert CAT3), labels Block + CAT, rangées lettrées, légende CAT1/CAT2/CAT3 avec prix
- `TicketPDF` : en-tête FRMF, section match dorée, bloc SEAT LOCATION (Entrance/Gate/Access/Block/Row/Seat), badge CAT, prix MAD, ouverture des portes (H-2), QR Code — bilingue AR/FR
- Page select-seats : récapitulatif avec adresse complète par place

## 2026-08-22 — Plan de stade professionnel (anneau continu numéroté)
- `StadiumMap` entièrement en SVG : bol ovale continu, terrain rayé avec marquages précis, **14 sections numérotées** (101-104 sud, 201-204 nord, 301-303 est, 401-403 ouest) disposées en arcs de cercle
- Bandes de section dessinées en arcs elliptiques colorés ; sièges = cercles placés sur des rangées concentriques (5 rangées × 20 sièges affichés par section)
- Sélection : cercle vert agrandi avec anneau ; vendu/verrouillé en transparence ; tooltips « n° section · Rang - Siège · prix »
- Numéros de section dérivés côté page par groupe dans l'ordre de création
- Seed : 14 sections numérotées avec couleurs par zone + remappage des 1850 places de l'événement vers les nouvelles sections (catégories/prix inchangés)

## 2026-08-22 — Plan de stade ultra-réaliste
- Vue d'ensemble ovale : conteneur arrondi `3rem` avec bordure, tribunes nord/sud larges et tribunes est/ouest verticales (hautes et étroites) flanquant le terrain
- Terrain dessiné en SVG aux proportions réelles : 20 bandes de tonte alternées, bordures, médiane, cercle central, surfaces de réparation + surfaces de but, points de penalty, arcs de corner et arcs de surface
- Sièges 16px avec dégradés : sélection verte ×1.25 avec anneau lumineux, vendu rouge atténué, verrouillé orange, disponible bleu avec zoom ×1.5 au survol ; gris quand la limite de sélection est atteinte
- Légende avec échantillons sur fonds pastel par statut
- Fix hydration : minuteur de paiement initialisé côté client uniquement

## 2026-08-22 — Design premium du plan de stade
- `StadiumMap` refondu : terrain réaliste (pelouse dégradée + texture rayée, surfaces de réparation, rond central, corners), tribunes en croix autour du terrain, badges de section en dégradé aux couleurs du lieu
- Sièges avec dégradés et ombres : bleu (disponible, zoom + brillance au survol), vert agrandi (sélectionné), rouge atténué (vendu), orange (verrouillé)
- Look-up des sièges en O(1) via Map (au lieu de `find` par siège), limites 8 rangées × 15 sièges par section
- Panneau récapitulatif : en-tête avec icône Ticket + compteur n/max, dégradé blanc→bleu, état vide illustré
- Légende en grille 2 colonnes avec échantillons visuels

## 2026-08-22 — Phase 8 : plan de stade interactif + sécurisation admin
- Lien « Admin » retiré du header public (accès par URL directe uniquement)
- Modèles `StadiumSection` / `StadiumSeat` + migration `add_stadium_layout`
- Seed : plan du Stade Mohammed V (4 sections : Honneur/nord, A/est, B/ouest, Virage Sud)
- Composant `StadiumMap` : terrain central, tribunes positionnées, sièges cliquables (bleu disponible, vert sélectionné, rouge vendu, orange verrouillé), légende traduite
- `GET /api/events/[id]/seats` : places de l'événement + sections du lieu
- Page `/[locale]/events/[id]/select-seats` : carte interactive + récapitulatif (max 4 places, total dynamique) → file d'attente avec `seats=`
- Bouton « Choisir vos places sur le plan » sur la page détail

## 2026-08-22 — Phase 7 : final polish (middleware + gestion événements)
- Middleware : redirection immédiate de `/dashboard` et `/validator` vers `/login?callbackUrl=...` sans cookie d'auth
- `PATCH /api/admin/events/[id]/status` : changement de statut (ADMIN uniquement, statuts validés)
- Dashboard : section « Gestion Rapide des Événements » avec badge de statut et bascule Ouvrir/Fermer (mise à jour locale sans rechargement)
- Traductions `admin.quickManagement/close/open/soldTickets` (ar/fr/en)

## 2026-08-22 — Phase 6 : rôles, dashboard admin & statistiques
- Seed : utilisateurs de test — admin `+212600000000` / `Admin123!`, validator `+212600000001` / `Valid123!`
- `requireRole()` (`src/lib/role-guard.ts`) : garde d'accès par rôle pour les routes API
- `/api/tickets/validate` sécurisé : ADMIN et VALIDATOR uniquement (USER → 403)
- `/api/admin/stats` : revenu total, billets vendus/validés, ventes par événement (ADMIN uniquement)
- Page `/[locale]/(admin)/dashboard` : KPIs + graphique Recharts, traduite (namespace `admin`)
- Lien « Admin » dans le header

## 2026-08-22 — Phase 5 : PDF & validation QR (scanner agent)
- `TicketPDF` (@react-pdf/renderer) : billet A4 avec QR Code, titulaire/CIN, polices Cairo/Inter, RTL
- Bouton « Télécharger PDF » fonctionnel sur la page billet (import dynamique de react-pdf)
- `POST /api/tickets/validate` : vérification du QR (hash+eventId+seatId), marquage `USED` transactionnel, détection « déjà utilisé » (409), rejet des QR falsifiés
- Page `/[locale]/validator` : scanner caméra (html5-qrcode), écrans succès/échec animés, namespace `validator` dans les 3 langues
- API réservation : inclusion du `user` (nom, CIN) pour le PDF et la validation

## 2026-08-22 — Audit multilingue, design premium et robustesse

### i18n total
- Ajout des namespaces `home`, `footer`, `events`, `waiting`, `payment`, `ticket` complets dans `messages/{ar,fr,en}.json`
- Internationalisation de toutes les pages et composants qui contenaient du français en dur : accueil, événements (liste + détail), salle d'attente, paiement, billet, formulaires login/register, footer
- Interpolation next-intl pour les valeurs dynamiques (`otpSentTo`, `position`, `maxTickets`, `pay`, `rowSeat`, `id`…)

### Pages d'erreur
- `src/app/[locale]/error.tsx` : capture des erreurs React avec bouton de retry
- `src/app/[locale]/not-found.tsx` : page 404 traduite
- Nouveau composant `LocaleLink` (préfixe automatique de la locale)

### Améliorations UX / performance
- Page événements : barre de recherche, filtre par ville, tri par date/prix, **skeletons de chargement**, état vide illustré
- `next/image` (optimisé + lazy) sur les cartes événements et la bannière du détail ; `remotePatterns` configurés pour images.unsplash.com
- `inputMode="tel"/"email"` sur les formulaires (clavier mobile adapté)
- `aria-label` sur les boutons icônes et les selects/filtres

### Nettoyage
- `console.log` OTP réservés au développement (guard `NODE_ENV`)
- Zéro `any` TypeScript dans les pages refaites (interfaces typées)

## 2026-08-22 — Phase 4 : réservation, paiement, billet
- `POST /api/reservations` : allocation d'une place, verrouillage transactionnel, QR Code unique (10 min pour payer)
- `POST /api/reservations/[id]/pay` : confirmation (simulée), expiration → libération de la place
- `GET /api/reservations/[id]` : billet (contrôle propriétaire)
- Pages paiement (récapitulatif + moyens CMI/CashPlus/Wafacash/BaridCash + minuteur) et billet (QR Code, perforations)
- File d'attente : création automatique de réservation quand la position atteint 1

## 2026-08-22 — Phase 3 : événements dynamiques
- Seed : Stade Mohammed V, Finale Coupe du Trône, 1850 places (`npm run seed`)
- `GET /api/events` et `GET /api/events/[id]` (catégories/prix)
- Pages liste et détail événement, salle d'attente connectée à `eventId`/`category`

## 2026-08-22 — Phase 1-2 : authentification et design bleu/cyan
- Prisma 7 + PostgreSQL (Postgres.app local, docker-compose fourni)
- Auth : register/login/OTP/logout, JWT + sessions Redis (fallback mémoire en dev)
- Redis : service docker-compose + fallback automatique si injoignable
- Design premium bleu/cyan : palette, glassmorphism, animations Framer Motion, composants Button/Input/Card/Progress/QRCode
