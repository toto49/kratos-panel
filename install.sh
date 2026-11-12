#!/usr/bin/env bash
set -euo pipefail

GITHUB_REPO="toto49/kratos-panel"
INSTALL_BIN="/usr/local/bin/kratos-agent"
CONFIG_DIR="/etc/kratos-agent"
SERVICE_FILE="/etc/systemd/system/kratos-agent.service"

PANEL_URL=""
AGENT_TOKEN=""


for arg in "$@"; do
  case "$arg" in
    --url=*)
      PANEL_URL="${arg#*=}"
      ;;
    --token=*)
      AGENT_TOKEN="${arg#*=}"
      ;;
    *)
      echo "[WARN] Argument ignoré : $arg"
      ;;
  esac
done

if [ -z "$PANEL_URL" ] || [ -z "$AGENT_TOKEN" ]; then
  echo "[ERREUR] Les paramètres --url et --token sont obligatoires."
  echo "Exemple : curl -fsSL https://raw.githubusercontent.com/${GITHUB_REPO}/main/install.sh | sudo bash -s -- --url=\"https://panel.domaine.fr\" --token=\"kr_node_...\""
  exit 1
fi

if [ "$EUID" -ne 0 ]; then
  echo "[ERREUR] Ce script doit être exécuté en tant que root (utilisez sudo)."
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "[ERREUR] 'curl' est requis mais n'est pas installé."
  exit 1
fi


ARCH=$(uname -m)
case "$ARCH" in
  x86_64|amd64)
    BINARY_NAME="kratos-agent-linux-amd64"
    ;;
  aarch64|arm64)
    BINARY_NAME="kratos-agent-linux-arm64"
    ;;
  *)
    echo "[ERREUR] Architecture non supportée : $ARCH"
    exit 1
    ;;
esac

echo "[INFO] Installation de Kratos-Agent ($ARCH)..."


echo "[INFO] Recherche de la dernière version de l'agent sur GitHub..."
LATEST_TAG=$(curl -fsSL "https://api.github.com/repos/${GITHUB_REPO}/releases" \
  | grep -oE '"tag_name":\s*"agent-v[^"]+"' \
  | head -n 1 \
  | cut -d'"' -f4)

if [ -z "$LATEST_TAG" ]; then
  echo "[ERREUR] Aucune release 'agent-v*' trouvée sur https://github.com/${GITHUB_REPO}/releases"
  exit 1
fi

DOWNLOAD_URL="https://github.com/${GITHUB_REPO}/releases/download/${LATEST_TAG}/${BINARY_NAME}"


if systemctl is-active --quiet kratos-agent; then
  echo "[INFO] Arrêt du service kratos-agent existant..."
  systemctl stop kratos-agent
fi


echo "[INFO] Téléchargement de ${BINARY_NAME} (${LATEST_TAG})..."
TMP_BIN=$(mktemp)
curl -fsSL "$DOWNLOAD_URL" -o "$TMP_BIN"
install -m 0755 "$TMP_BIN" "$INSTALL_BIN"
rm -f "$TMP_BIN"


mkdir -p "$CONFIG_DIR"
cat <<EOF > "${CONFIG_DIR}/agent.env"
KRATOS_URL=${PANEL_URL%/}
KRATOS_TOKEN=${AGENT_TOKEN}
EOF
chmod 600 "${CONFIG_DIR}/agent.env"


cat <<EOF > "$SERVICE_FILE"
[Unit]
Description=Kratos Panel Node Agent
After=network-online.target docker.service
Wants=network-online.target

[Service]
Type=simple
User=root
EnvironmentFile=${CONFIG_DIR}/agent.env
ExecStart=${INSTALL_BIN}
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable kratos-agent >/dev/null
systemctl restart kratos-agent

echo "[OK] Kratos-Agent (${LATEST_TAG}) est installé et actif !"
echo "[INFO] Logs en direct : journalctl -u kratos-agent -f"