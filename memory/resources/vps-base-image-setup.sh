#!/bin/bash
# VPS Base Image Setup Script
# Run as root on a fresh Hetzner Ubuntu 24.04 VPS
# Usage: bash vps-base-image-setup.sh <PROJECT_NAME> <DISCORD_WEBHOOK_URL> <GITHUB_PAT>
# Happy reviews before first use — see builder-playbook.md Section 3

set -euo pipefail

PROJECT_NAME="${1:?Usage: $0 <project-name> <discord-webhook-url> <github-pat>}"
DISCORD_WEBHOOK="${2:?Missing discord webhook URL}"
GITHUB_PAT="${3:?Missing GitHub PAT}"

echo "=== VPS Setup: $PROJECT_NAME ==="

# --- System update ---
apt-get update -qq && apt-get upgrade -y -qq

# --- Core tools ---
apt-get install -y -qq \
  curl wget git unzip build-essential \
  ca-certificates gnupg lsb-release \
  ufw fail2ban

# --- Node.js 20 LTS ---
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node --version && npm --version

# --- Python 3 + pip ---
apt-get install -y python3 python3-pip python3-venv
python3 --version

# --- GitHub CLI ---
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
  | tee /etc/apt/sources.list.d/github-cli.list > /dev/null
apt-get update -qq && apt-get install -y gh
echo "$GITHUB_PAT" | gh auth login --with-token
gh auth status

# --- Tailscale ---
curl -fsSL https://tailscale.com/install.sh | sh
# NOTE: After script, run: tailscale up --authkey=<TAILSCALE_AUTHKEY> --advertise-tags=tag:vps
echo "⚠️  Tailscale installed but NOT activated. Run tailscale up manually with authkey."

# --- Claude Code (claude CLI) ---
npm install -g @anthropic-ai/claude-code
claude --version

# --- Project directory ---
mkdir -p /opt/project
cd /opt/project

# --- Git config ---
git config --global user.email "vps-agent@happysagents.com"
git config --global user.name "$PROJECT_NAME VPS Agent"

# --- Store Discord webhook for agent use ---
mkdir -p /opt/project/.config
cat > /opt/project/.config/discord-webhook.env << EOF
DISCORD_WEBHOOK_URL=$DISCORD_WEBHOOK
PROJECT_NAME=$PROJECT_NAME
EOF
chmod 600 /opt/project/.config/discord-webhook.env

# --- Helper: send Discord notification ---
cat > /usr/local/bin/notify-discord << 'NOTIFY'
#!/bin/bash
# Usage: notify-discord "message"
source /opt/project/.config/discord-webhook.env
curl -s -X POST "$DISCORD_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"[$PROJECT_NAME] $1\"}"
NOTIFY
chmod +x /usr/local/bin/notify-discord

# --- UFW firewall ---
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw --force enable

# --- fail2ban ---
systemctl enable fail2ban
systemctl start fail2ban

# --- Disable root password login ---
sed -i 's/^PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/^PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl reload sshd

# --- Add Happy's SSH public key ---
mkdir -p /root/.ssh
cat >> /root/.ssh/authorized_keys << 'PUBKEY'
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFkFcpqtbyB1tBALtvuMyt4mYWhYKg18NzujnflRUyt/ happy-agent@vps-access-20260306
PUBKEY
chmod 700 /root/.ssh && chmod 600 /root/.ssh/authorized_keys

notify-discord "✅ VPS base image setup complete for $PROJECT_NAME"
echo "=== Setup complete. Next: run 'tailscale up' with your authkey ==="
