# Connect to Afrihost Server & Deploy

## 1. Connect via SSH

From Windows PowerShell or your terminal:

```powershell
# Replace with your Afrihost server details
ssh username@your-server-ip
# Or with custom port:
ssh -p 2211 username@your-server-ip
# Or with SSH key:
ssh -i C:\path\to\your-key.pem username@your-server-ip
```

**Where to get credentials:**
- **Afrihost ClientZone** → Hosting → Your VPS/cPanel → Connection details
- Usually: IP address, username (e.g. cpaneluser), password or SSH key
- SSH port is often 22 (default) or a custom port like 2211

## 2. One-time server setup (if fresh VPS)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Git (if not present)
sudo apt install -y git
```

## 3. Clone your project

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/safety_system_v2.git
cd safety_system_v2
```

Or upload via **cPanel File Manager** / **FTP** if you use shared hosting.

## 4. Create .env on the server

```bash
nano .env
# Or use cPanel "Environment Variables" if available
```

Add (replace with your real values):

```
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
NEXT_PUBLIC_BASE_URL=https://yourdomain.co.za
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud
RESEND_API_KEY=re_xxx
RESEND_FROM=noreply@yourdomain.co.za
PORT=3000
```

Save (Ctrl+O, Enter, Ctrl+X in nano).

## 5. Run deploy script

```bash
cd ~/safety_system_v2
chmod +x scripts/afrihost-deploy.sh
bash scripts/afrihost-deploy.sh
```

## 6. Start the app

```bash
pm2 start npm --name "safety-system" -- start
pm2 save
pm2 startup
```

Check status: `pm2 status`

## 7. Optional: Nginx reverse proxy

If you have root/WHM access:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo nano /etc/nginx/sites-available/safety-system
```

Add:

```nginx
server {
  listen 80;
  server_name yourdomain.co.za;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/safety-system /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.co.za
```

---

## Quick reference

| What | Command |
|------|---------|
| SSH in | `ssh username@ip` |
| Pull latest | `cd ~/safety_system_v2 && git pull` |
| Redeploy | `bash scripts/afrihost-deploy.sh` |
| Restart app | `pm2 restart safety-system` |
| View logs | `pm2 logs safety-system` |
