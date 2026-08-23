#!/bin/bash
# ============================================
# CONFIGURATION DU DÉPLOIEMENT
# ============================================

# Nom du projet et utilisateur GitHub
PROJECT_NAME="billetterie-maroc"
GITHUB_USERNAME="votre-username" # ⚠️ REMPLACEZ CECI PAR VOTRE VRAI PSEUDO GITHUB

# Régions (Frankfurt est le plus proche du Maroc pour une bonne latence)
SUPABASE_REGION="westeurope"
UPSTASH_REGION="eu-central-1"

# Noms des bases de données
DB_NAME="billetterie"
REDIS_NAME="billetterie-redis"

# Variables qui seront générées automatiquement si vides
DB_PASSWORD=""
JWT_SECRET=""

# Domaine personnalisé (laisser vide pour utiliser .vercel.app)
CUSTOM_DOMAIN=""

# Export des variables pour les autres scripts
export PROJECT_NAME GITHUB_USERNAME SUPABASE_REGION UPSTASH_REGION DB_NAME REDIS_NAME DB_PASSWORD JWT_SECRET CUSTOM_DOMAIN