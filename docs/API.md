# 📡 Documentation API

## Base URL

```
http://localhost:3000/api   (développement)
https://billetterie.ma/api  (production)
```

## Authentification

Toutes les routes protégées nécessitent un cookie `auth-token` contenant un JWT valide.

```
Content-Type: application/json
Cookie: auth-token=<JWT>
```

### Codes de Statut
- `200` : Succès · `400` : Requête invalide · `401` : Non authentifié
- `403` : Accès refusé (rôle insuffisant) · `404` : Non trouvé
- `409` : Conflit (déjà utilisé, place indisponible) · `410` : Délai expiré · `500` : Erreur serveur

---

## 🔐 Authentification

### POST /api/auth/register
**Body** : `{ "cin": "AB123456", "firstNameAr": "يوسف", "lastNameAr": "زين", "phone": "+212612345678", "email": "…", "password": "password123" }`

**200** : `{ "success": true, "user": { "id", "cin", "phone", "email", "isVerified" }, "message": "Inscription réussie. Un code OTP a été envoyé…" }`
**400** : `{ "error": "CIN ou numéro de téléphone déjà enregistré" }`

### POST /api/auth/login
**Body** : `{ "phone": "+212612345678", "password": "…" }`

**200** : `{ "success": true, "requiresOTP": true }` · **401** : identifiants incorrects

### POST /api/auth/verify-otp
**Body** : `{ "phone": "+212612345678", "otp": "123456" }`

**200** : `{ "success": true, "user": { "id", "cin", "role", … } }` + cookie `auth-token` httpOnly
**400** : `{ "error": "Code OTP invalide ou expiré" }`

### POST /api/auth/logout
**200** : `{ "success": true }` (session Redis + cookie supprimés)

### GET /api/auth/me
**200** : `{ "user": { "id", "cin", "phone", "email", "firstNameAr", "lastNameAr", "role", "isVerified" } }` · **401** sans session

---

## 🎫 Événements

### GET /api/events
Événements PUBLISHED/OPEN/WAITING_ROOM avec leur lieu, triés par date.

**200** : `[{ "id", "nameFr", "nameAr", "nameEn", "eventDate", "venue": {…}, "priceMin", "priceMax", "status" }]`

### GET /api/events/[id]
**200** : événement + `categories` regroupées : `{ "CAT1": { "min": 500, "max": 500 }, … }` · **404** si introuvable

### GET /api/events/[id]/seats
**200** :
```json
{
  "venue": { "nameFr": "Stade Mohammed V" },
  "zones": [
    {
      "name": "Tribune Honneur", "block": "305", "category": "CAT1",
      "color": "#ef4444", "entrance": "E01", "gate": "10",
      "seats": [{ "id", "rowNumber": "A", "seatNumber": "1", "status": "available", "price": 500 }]
    }
  ],
  "seats": [ … ]
}
```

---

## 🎟️ Réservations (auth requise)

### POST /api/reservations
**Body** : `{ "eventId": "…", "category": "CAT1" }`

**200** : `{ "success": true, "reservation": { "id", "status": "PAYMENT_PENDING", "entrance", "gate", "access", "block", "rowLetter", "seatLabel", "totalPrice", "reservedUntil", … }, "message": "Place réservée temporairement…" }`
**409** : plus de places dans la catégorie

### POST /api/reservations/[id]/pay
**Body** : `{ "paymentMethod": "CMI" | "CASHPLUS" | "WAFACASH" | "BARIDCASH" }`

**200** : `{ "success": true, "reservation": { "status": "PAID", … } }`
**410** : délai expiré (place libérée) · **409** : ne peut pas être payée

### GET /api/reservations/[id]
**200** : réservation complète (seat avec adressage, user, event) — uniquement si propriétaire · **404** sinon

---

## 🔍 Validation

### POST /api/tickets/validate (ADMIN/VALIDATOR)
**Body** : `{ "qrCodeData": "{\"eventId\":\"…\",\"seatId\":\"…\",\"hash\":\"…\"}" }`

**200** : `{ "success": true, "data": { "eventName", "userName", "cin", "seat": "Tribune Honneur - R1 S1", "usedAt" } }`
**409** : `{ "success": false, "error": "BILLET_DEJA_UTILISE", "isAlreadyUsed": true }` · **404** : falsifié

---

## 📊 Admin

### GET /api/admin/stats (ADMIN)
**200** : `{ "revenue", "ticketsSold", "ticketsUsed", "events": [{ "id", "name", "status", "sold" }] }`

### PATCH /api/admin/events/[id]/status (ADMIN)
**Body** : `{ "status": "OPEN" | "CLOSED" | "DRAFT" | "PUBLISHED" | "WAITING_ROOM" | "CANCELLED" }`
**200** : `{ "success": true, "event": {…} }` · **400** statut invalide

### POST /api/admin/stadium-config (ADMIN)
**Body** : `{ "venueId", "name", "shape": "oval|rectangular", "fieldWidth", "fieldLength", "zones": [{ "name", "category", "shape", "position", "color", "rows", "seatsPerRow", "block", "price", … }] }`
**200** : `{ "success": true, "config": { "id", "name", "totalCapacity" } }`

### GET /api/admin/stadium-config (ADMIN)
**200** : `{ "venues": [{ "id", "nameFr", "city" }] }`

---

## Exemple de Flux Complet (curl)

```bash
# 1. Login (OTP dans les logs serveur)
curl -X POST localhost:3000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"phone":"+212612345678","password":"password123"}'
curl -c cookies.txt -X POST localhost:3000/api/auth/verify-otp -H 'Content-Type: application/json' \
  -d '{"phone":"+212612345678","otp":"123456"}'

# 2. Réservation + paiement + billet
curl -b cookies.txt -X POST localhost:3000/api/reservations -H 'Content-Type: application/json' \
  -d '{"eventId":"event-finale-coupe-du-trone","category":"CAT1"}'
curl -b cookies.txt -X POST localhost:3000/api/reservations/<ID>/pay -H 'Content-Type: application/json' \
  -d '{"paymentMethod":"CMI"}'
curl -b cookies.txt localhost:3000/api/reservations/<ID>
```

## Webhooks (à implémenter)

`POST /api/webhooks/cmi` — notification de paiement CMI : `{ "transactionId", "reservationId", "status", "amount", "currency" }`
