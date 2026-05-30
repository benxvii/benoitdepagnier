#!/usr/bin/env bash
# Envoie les dossiers médias (public/) vers Infomaniak depuis TON Mac.
# (Les secrets GitHub ne sont pas accessibles en local — uniquement dans Actions.)
#
# Prérequis : lftp → brew install lftp
# Identifiants : les mêmes que dans GitHub → Settings → Secrets (FTP_HOST, etc.)
#
# Exemple sans fichier .env :
#   FTP_HOST=xxx FTP_USER=xxx FTP_PASSWORD=xxx ./scripts/sync-media-to-infomaniak.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

: "${FTP_HOST:?FTP_HOST manquant (même valeur que le secret GitHub)}"
: "${FTP_USER:?FTP_USER manquant}"
: "${FTP_PASSWORD:?FTP_PASSWORD manquant}"

if [[ "$FTP_HOST" == *"ton-host"* || "$FTP_USER" == *"ton-user"* || "$FTP_PASSWORD" == *"ton-mot"* ]]; then
  echo "Erreur : tu as encore les valeurs d'exemple (ton-host-ftp, ton-user…)."
  echo "Remplace-les par tes vrais identifiants Infomaniak / GitHub Secrets."
  echo "Ex. FTP_HOST='abc123.ftp.infomaniak.com' FTP_USER='u123456' FTP_PASSWORD='…' $0"
  exit 1
fi

if ! command -v lftp >/dev/null 2>&1; then
  echo "lftp introuvable. Installe-le : brew install lftp"
  exit 1
fi

REMOTE_DIR="sites/benoitdepagnier.ch"

for dir in portfolio downloads about musique projets; do
  if [[ ! -d "public/$dir" ]]; then
    echo "Ignoré (absent) : public/$dir"
    continue
  fi
  echo "→ Upload public/$dir …"
done

# Infomaniak : FTPS explicite si le host ne commence pas par ftp://
LFTP_TARGET="$FTP_HOST"
if [[ "$FTP_HOST" != ftp://* && "$FTP_HOST" != ftps://* ]]; then
  LFTP_TARGET="ftps://$FTP_HOST"
fi

lftp -u "$FTP_USER","$FTP_PASSWORD" "$LFTP_TARGET" <<EOF
set ftp:ssl-force true
set ftp:passive-mode true
set cmd:fail-exit true
set net:timeout 30
set net:max-retries 2
cd $REMOTE_DIR
lcd $ROOT/public
mirror -R --parallel=4 --verbose portfolio portfolio
mirror -R --parallel=4 --verbose downloads downloads
mirror -R --parallel=4 --verbose about about
mirror -R --parallel=4 --verbose musique musique
mirror -R --parallel=4 --verbose projets projets
bye
EOF

echo "Terminé. Vérifie par ex. :"
echo "  curl -sI https://benoitdepagnier.ch/portfolio/flous-de-mouvements/flous-urbains/L1000870.jpg | grep -i content-type"
echo "  (doit afficher image/jpeg, pas text/html)"
