# Deployment (Deploy Key + GitHub Actions)

This guide sets up a secure, automated deployment from GitHub to your server using:
- A Deploy Key on the server for read-only GitHub access
- A GitHub Actions workflow that SSHes into your server and pulls/builds

Prerequisites
- Docker + Docker Compose installed on the server
- A user on the server with SSH access and permission to run Docker
- DNS and TLS handled by Nginx Proxy Manager (optional, see docker-compose.yml)

1) Create a Deploy Key on the server (GitHub read-only)
```
ssh root@178.156.185.16
mkdir -p ~/.ssh && chmod 700 ~/.ssh
ssh-keygen -t ed25519 -C "deploy@gastro-crowd-fund" -f ~/.ssh/id_ed25519_gcf_deploy

# Print the public key; copy it
cat ~/.ssh/id_ed25519_gcf_deploy.pub
```
- GitHub → Repo → Settings → Deploy keys → Add deploy key
  - Title: server-deploy
  - Key: paste the public key content
  - Allow write access: OFF (read-only)

- Optional SSH config on server to force using this key for GitHub:
```
cat >> ~/.ssh/config <<'CFG'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_gcf_deploy
  IdentitiesOnly yes
CFG
```
- Test from server:
```
ssh -T git@github.com
```
You should see a success message.

2) Prepare app directory on the server
```
sudo mkdir -p /opt/gastro-crowd-fund
sudo chown -R $USER:$USER /opt/gastro-crowd-fund
cd /opt/gastro-crowd-fund

# First-time clone
git clone git@github.com:sven-divico/gastro-crowd-fund.git .
# Create .env with your server values
cp .env.example .env
# Edit .env:
# DEMO_PASSWORD="eat_good#"
# DEMO_TOKEN=a_nice_token_for_a_demo
# API_PORT=8000
# FRONTEND_PORT=8080
# PUBLIC_BASE_URL=https://api.demo.divico-gmbh.de
# ASSETS_DIR=/data/assets
# DB_PATH=/data/db/app.db
# ALLOWED_ORIGIN=https://frontend.demo.divico-gmbh.de

# Prepare shared folders and seed content
mkdir -p shared/assets/media shared/assets/menus shared/assets/content shared/db
```

3) Allow GitHub Actions to SSH into your server
- Generate a new SSH key (locally or in a safe machine):
```
ssh-keygen -t ed25519 -C "actions@deploy" -f ./id_ed25519_actions
```
- Add the public key to your server user's `~/.ssh/authorized_keys`:
```
cat id_ed25519_actions.pub | ssh <user>@<server> 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'
```
- Add the private key and connection details to GitHub repo Secrets:
  - SSH_HOST = your.server.hostname
  - SSH_USER = your-ssh-user
  - SSH_PORT = 22 (or custom)
  - SSH_KEY = contents of id_ed25519_actions (private key)

4) Automatic deployment on push
- The workflow `.github/workflows/deploy.yml` connects to your server and runs:
  - git fetch/reset to `origin/main`
  - docker compose build --pull
  - docker compose up -d
  - Ensures shared folders exist

5) First start and NPM
- Start once to pull/build images:
```
cd /opt/gastro-crowd-fund
docker compose up -d --build
```
- Visit NPM admin (http://server:81) to add proxy hosts for your domains.

6) Notes
- The server keeps `.env` and `shared/` persistent; Git pulls only code/config.
- To re-seed the DB (demo only), stop backend and remove `shared/db/app.db` then start.
- Frontend proxies `/api`, `/config.json`, and `/static` to the backend internally.

Troubleshooting
- SSH auth errors from Actions: verify SSH_KEY secret and the server authorized_keys.
- GitHub access from server: confirm Deploy Key is added and `ssh -T git@github.com` succeeds.
- Compose not found: install docker compose plugin or use `docker-compose` in the workflow and on server.
