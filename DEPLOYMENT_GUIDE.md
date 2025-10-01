# 🚀 SLA Tracker Dashboard - Deployment Guide & Architecture

## 📋 Table of Contents
1. [Tech Stack Overview](#tech-stack-overview)
2. [System Architecture](#system-architecture)
3. [Server Deployment Options](#server-deployment-options)
4. [Production Configuration](#production-configuration)
5. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 🛠️ Tech Stack Overview

### **Frontend Stack**
- **Framework**: React 18.3.1 (Latest LTS)
- **Language**: JavaScript ES2023
- **UI Library**: Shadcn/UI Components (Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS 3.4.15 + PostCSS
- **HTTP Client**: Axios 1.7.9
- **Routing**: React Router DOM 6.28.0
- **Build Tool**: Create React App (CRA) with React Scripts
- **Node.js**: 20.18.0 LTS (No CRACO dependencies)

### **Backend Stack**
- **Framework**: FastAPI 0.110.1 (Python)
- **Language**: Python 3.11+
- **Database**: MongoDB 7.0 (Document Database)
- **ODM**: Motor 3.3.1 (Async MongoDB driver)
- **Authentication**: JWT + Pydantic models
- **API Documentation**: OpenAPI/Swagger (auto-generated)
- **File Processing**: Pandas + OpenPyXL (Excel parsing)
- **Server**: Uvicorn ASGI server

### **Database & Storage**
- **Primary Database**: MongoDB (Document-oriented)
- **Collections**: `tickets`, `agents`
- **Indexing**: Performance-optimized queries
- **Data Processing**: Real-time aggregation pipelines

### **DevOps & Deployment**
- **Containerization**: Docker + Docker Compose
- **Process Management**: Supervisor (development)
- **Reverse Proxy**: Nginx (production)
- **Environment Management**: Environment variables
- **Version Control**: Git-based deployment

---

## 🏗️ System Architecture

### **High-Level Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   React App     │◄──►│   FastAPI       │◄──►│    MongoDB      │
│   Port: 3000    │    │   Port: 8001    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Detailed Component Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  React Components:                                          │
│  ├── Dashboard.js (Main KPIs & Metrics)                   │
│  ├── AgentPerformance.js (Individual tracking)            │
│  ├── TeamPerformance.js (Team analytics)                  │
│  ├── FileUpload.js (Excel data import)                    │
│  └── Navigation.js (Mobile responsive menu)               │
└─────────────────────────────────────────────────────────────┘
                                │
                        HTTP/REST API
                                │
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (FastAPI)                     │
├─────────────────────────────────────────────────────────────┤
│  Endpoints:                                                 │
│  ├── /api/dashboard-summary (Overall metrics)              │
│  ├── /api/upload-excel (File processing)                   │
│  ├── /api/agent-performance/{name} (Individual stats)      │
│  ├── /api/team-performance (Team aggregations)             │
│  └── /api/tickets (CRUD operations)                        │
├─────────────────────────────────────────────────────────────┤
│  Business Logic:                                            │
│  ├── Excel Processing (Pandas + OpenPyXL)                  │
│  ├── SLA Calculations (Performance scoring)                │
│  ├── Team Normalization (L1/L2/Business mapping)          │
│  └── Data Aggregation (MongoDB pipelines)                  │
└─────────────────────────────────────────────────────────────┘
                                │
                        Motor (Async ODM)
                                │
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER (MongoDB)                     │
├─────────────────────────────────────────────────────────────┤
│  Collections:                                               │
│  ├── tickets (SLA data, response times, teams)             │
│  └── agents (Individual profiles, team assignments)        │
├─────────────────────────────────────────────────────────────┤
│  Aggregation Pipelines:                                     │
│  ├── Top Performers (Score + volume tiebreaker)            │
│  ├── Team Performance (L1/L2/Business segregation)         │
│  ├── Pending Tickets (Status-based team breakdown)         │
│  └── SLA Metrics (Response/Resolution percentages)         │
└─────────────────────────────────────────────────────────────┘
```

### **Data Flow Architecture**

```
Excel Upload → Pandas Processing → Team Normalization → MongoDB Storage
     │                                                         │
     │                                                         ▼
     └─────────► Time Parsing ────────────────────► Aggregation Pipelines
                      │                                        │
                      ▼                                        ▼
              (hh:mm format to decimal hours)        Dashboard Metrics Display
```

---

## 🚀 Server Deployment Options

### **Option 1: Docker Deployment (Recommended)**

#### **1.1 Prerequisites**
```bash
# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### **1.2 Production Docker Compose**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:7.0
    container_name: sla-mongodb-prod
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
    volumes:
      - mongodb_prod_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d
    networks:
      - sla-network
    command: mongod --auth

  # FastAPI Backend
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    container_name: sla-backend-prod
    restart: unless-stopped
    ports:
      - "8001:8001"
    depends_on:
      - mongodb
    environment:
      - MONGO_URL=mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASSWORD}@mongodb:27017
      - DB_NAME=sla_tracker_prod
      - CORS_ORIGINS=${FRONTEND_URL}
    volumes:
      - ./backend/logs:/app/logs
    networks:
      - sla-network

  # React Frontend  
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: sla-frontend-prod
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - REACT_APP_BACKEND_URL=${BACKEND_URL}
      - NODE_ENV=production
    networks:
      - sla-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: sla-nginx-prod
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - sla-network

networks:
  sla-network:
    driver: bridge

volumes:
  mongodb_prod_data:
    driver: local
```

#### **1.3 Production Environment File**
```bash
# .env.prod
MONGO_ROOT_USER=sla_admin
MONGO_ROOT_PASSWORD=your_secure_password_here
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://your-domain.com/api
```

#### **1.4 Deployment Commands**
```bash
# Clone your repository
git clone https://github.com/your-username/sla-tracker-dashboard.git
cd sla-tracker-dashboard

# Create production environment file
cp .env.example .env.prod
# Edit .env.prod with your production values

# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### **Option 2: Manual Server Deployment**

#### **2.1 Server Requirements**
```
CPU: 2+ cores
RAM: 4GB+ (8GB recommended)
Storage: 20GB+ SSD
OS: Ubuntu 20.04 LTS / CentOS 8 / Amazon Linux 2
Network: Public IP with ports 80, 443, 22 open
```

#### **2.2 Server Setup Script**
```bash
#!/bin/bash
# server-setup.sh

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.18.0
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python 3.11
sudo apt install -y python3.11 python3.11-pip python3.11-venv

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install Nginx
sudo apt install -y nginx

# Install PM2 for process management
sudo npm install -g pm2

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

#### **2.3 Application Deployment**
```bash
# Clone and setup application
git clone https://github.com/your-username/sla-tracker-dashboard.git
cd sla-tracker-dashboard

# Backend Setup
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend Setup  
cd ../frontend
npm ci --only=production
npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'sla-backend',
      script: 'uvicorn',
      args: 'server:app --host 0.0.0.0 --port 8001 --workers 4',
      cwd: './backend',
      interpreter: './backend/venv/bin/python',
      env: {
        MONGO_URL: 'mongodb://localhost:27017',
        DB_NAME: 'sla_tracker_prod',
        CORS_ORIGINS: 'https://your-domain.com'
      }
    },
    {
      name: 'sla-frontend',
      script: 'serve',
      args: '-s build -l 3000',
      cwd: './frontend'
    }
  ]
};
EOF

# Start applications
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### **Option 3: Cloud Platform Deployment**

#### **3.1 AWS EC2 Deployment**
```bash
# Launch EC2 instance (t3.medium recommended)
# Security Groups: HTTP (80), HTTPS (443), SSH (22)
# Use Ubuntu 20.04 LTS AMI

# Connect and run setup
ssh -i your-key.pem ubuntu@your-ec2-ip
wget https://raw.githubusercontent.com/your-username/sla-tracker/main/scripts/aws-setup.sh
chmod +x aws-setup.sh
./aws-setup.sh
```

#### **3.2 Digital Ocean Droplet**
```bash
# Create droplet (4GB RAM, 2 CPU recommended)
# One-click MongoDB app or manual installation

# Deploy using Docker
git clone https://github.com/your-username/sla-tracker-dashboard.git
cd sla-tracker-dashboard
docker-compose -f docker-compose.prod.yml up -d
```

#### **3.3 Heroku Deployment**
```bash
# Install Heroku CLI
# Create Procfile for each service

# Procfile (backend)
web: uvicorn server:app --host 0.0.0.0 --port $PORT

# Deploy backend
heroku create sla-tracker-backend
heroku addons:create mongolab:sandbox
git subtree push --prefix backend heroku main

# Deploy frontend  
heroku create sla-tracker-frontend
heroku buildpacks:set https://github.com/mars/create-react-app-buildpack.git
git subtree push --prefix frontend heroku main
```

---

## ⚙️ Production Configuration

### **4.1 Nginx Configuration**
```nginx
# /etc/nginx/sites-available/sla-tracker
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/nginx/ssl/your-domain.crt;
    ssl_certificate_key /etc/nginx/ssl/your-domain.key;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### **4.2 MongoDB Production Setup**
```bash
# MongoDB production configuration
sudo nano /etc/mongod.conf

# Add authentication and security
security:
  authorization: enabled
  
# Network configuration  
net:
  port: 27017
  bindIp: 127.0.0.1

# Storage engine
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

# Create admin user
mongosh
use admin
db.createUser({
  user: "sla_admin",
  pwd: "your_secure_password",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" }
  ]
})
```

### **4.3 SSL Certificate Setup**
```bash
# Using Let's Encrypt (free)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **4.4 Performance Optimization**
```bash
# Backend optimizations
export WORKERS=4  # Based on CPU cores
export WORKER_CONNECTIONS=1000
export KEEPALIVE_TIMEOUT=65

# Frontend optimizations (build time)
export GENERATE_SOURCEMAP=false
export INLINE_RUNTIME_CHUNK=false
npm run build

# MongoDB optimizations
# Enable compression and indexing
use sla_tracker_prod
db.tickets.createIndex({"resolved_by": 1})
db.tickets.createIndex({"updated_team": 1})  
db.tickets.createIndex({"status": 1})
db.tickets.createIndex({"sr_number": 1}, {"unique": true})
```

---

## 📊 Monitoring & Maintenance

### **5.1 Application Monitoring**
```bash
# PM2 monitoring
pm2 monit
pm2 logs sla-backend
pm2 logs sla-frontend

# Docker monitoring
docker-compose -f docker-compose.prod.yml logs -f
docker stats

# System monitoring
htop
df -h
free -h
```

### **5.2 Database Backup**
```bash
# Automated MongoDB backup script
#!/bin/bash
# backup-mongodb.sh

DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups/mongodb"
DB_NAME="sla_tracker_prod"

mkdir -p $BACKUP_DIR

mongodump --host localhost --port 27017 \
  --username sla_admin --password your_password \
  --db $DB_NAME \
  --out $BACKUP_DIR/backup_$DATE

# Compress backup
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/backup_$DATE
rm -rf $BACKUP_DIR/backup_$DATE

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

# Schedule with cron
# 0 2 * * * /path/to/backup-mongodb.sh
```

### **5.3 Health Checks**
```bash
# Health check script
#!/bin/bash
# health-check.sh

# Check frontend
if curl -f -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: FAILED"
    pm2 restart sla-frontend
fi

# Check backend  
if curl -f -s http://localhost:8001/api/dashboard-summary > /dev/null; then
    echo "✅ Backend: OK"
else
    echo "❌ Backend: FAILED"
    pm2 restart sla-backend
fi

# Check MongoDB
if mongosh --eval "db.adminCommand('ping')" > /dev/null; then
    echo "✅ MongoDB: OK"
else
    echo "❌ MongoDB: FAILED"
    sudo systemctl restart mongod
fi
```

### **5.4 Log Management**
```bash
# Logrotate configuration
sudo nano /etc/logrotate.d/sla-tracker

/var/log/sla-tracker/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reload sla-backend
        pm2 reload sla-frontend
    endscript
}
```

---

## 🔒 Security Considerations

### **Production Security Checklist**
- [ ] Enable MongoDB authentication
- [ ] Use strong passwords and API keys
- [ ] Configure firewall (ufw/iptables)
- [ ] Enable SSL/TLS certificates
- [ ] Regular security updates
- [ ] Database backup encryption
- [ ] API rate limiting
- [ ] Input validation and sanitization
- [ ] Environment variables for secrets
- [ ] Regular vulnerability scans

### **Environment Variables Security**
```bash
# Never commit these to version control
MONGO_URL=mongodb://username:password@localhost:27017
DB_NAME=sla_tracker_prod
JWT_SECRET_KEY=your-super-secret-jwt-key
CORS_ORIGINS=https://your-domain.com
```

---

## 📈 Scaling Considerations

### **Horizontal Scaling**
- **Load Balancer**: Nginx/HAProxy for multiple frontend instances
- **Database Clustering**: MongoDB replica sets
- **Microservices**: Split backend into separate services
- **CDN**: CloudFlare/AWS CloudFront for static assets

### **Performance Metrics**
- **Target Response Time**: < 2 seconds
- **Concurrent Users**: 100+ simultaneous users
- **Database Query Time**: < 100ms average
- **Uptime**: 99.9% availability

---

This deployment guide provides multiple options based on your infrastructure preferences and requirements. Choose the option that best fits your technical expertise and infrastructure setup.