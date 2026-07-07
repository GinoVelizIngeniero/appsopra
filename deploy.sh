#!/usr/bin/env bash
# ============================================================================
#  Despliegue Portal Mantenimiento Sopraval → Vercel
#  Ejecutar DESDE TU MÁQUINA (tiene red hacia Vercel; el entorno cloud no).
#  Uso:  bash deploy.sh
# ============================================================================
set -e

echo "🔧 Portal Mantenimiento — Despliegue a Vercel"
echo "=============================================="

# --- 0. Requisitos ----------------------------------------------------------
command -v pnpm >/dev/null || { echo "Instalando pnpm..."; npm i -g pnpm; }
command -v vercel >/dev/null || { echo "Instalando Vercel CLI..."; npm i -g vercel; }

# --- 1. Token de Vercel -----------------------------------------------------
if [ -z "$VERCEL_TOKEN" ]; then
  read -rp "Pega tu VERCEL_TOKEN (vercel.com/account/tokens): " VERCEL_TOKEN
  export VERCEL_TOKEN
fi

# --- 2. Connection string de Neon (usa la conexión DIRECTA, sin -pooler) ----
if [ -z "$DATABASE_URL" ]; then
  read -rp "Pega el DATABASE_URL directo de Neon: " DATABASE_URL
fi
JWT_SECRET="${JWT_SECRET:-sopraval-jwt-2026-$(openssl rand -hex 8)}"

# --- 3. Instalar dependencias ----------------------------------------------
echo "📦 Instalando dependencias..."
pnpm install

# --- 4. Desplegar BACKEND ---------------------------------------------------
echo "🚀 Desplegando BACKEND..."
cd packages/backend
vercel link --yes --project sopraval-backend --token "$VERCEL_TOKEN"
printf '%s' "$DATABASE_URL" | vercel env add DATABASE_URL production --token "$VERCEL_TOKEN" --force || true
printf '%s' "$JWT_SECRET"   | vercel env add JWT_SECRET   production --token "$VERCEL_TOKEN" --force || true
printf 'production'         | vercel env add NODE_ENV     production --token "$VERCEL_TOKEN" --force || true
BACKEND_URL=$(vercel deploy --prod --token "$VERCEL_TOKEN" | tail -1)
echo "✅ Backend: $BACKEND_URL"
cd ../..

# --- 5. Desplegar FRONTEND --------------------------------------------------
echo "🚀 Desplegando FRONTEND..."
cd packages/frontend
vercel link --yes --project sopraval --token "$VERCEL_TOKEN"
printf '%s/api' "$BACKEND_URL" | vercel env add VITE_API_URL production --token "$VERCEL_TOKEN" --force || true
FRONTEND_URL=$(vercel deploy --prod --token "$VERCEL_TOKEN" | tail -1)
cd ../..

echo ""
echo "=============================================="
echo "🎉 LISTO"
echo "   App:     $FRONTEND_URL"
echo "   API:     $BACKEND_URL"
echo "   Login:   gvelizm@sopraval.cl / Admin2026!"
echo "=============================================="
echo "⚠️  Revoca el VERCEL_TOKEN cuando termines: vercel.com/account/tokens"
