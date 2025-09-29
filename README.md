# Help Center Individual SLA Tracker Dashboard

A comprehensive dashboard for tracking individual and team SLA performance in help center operations.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-green)
![Tech Stack](https://img.shields.io/badge/Tech-React%20%7C%20FastAPI%20%7C%20MongoDB-blue)

## 📊 Features

- **Real-time SLA Tracking**: Monitor response and resolution SLA performance
- **Individual Agent Performance**: Detailed metrics for each support agent
- **Team Performance Analysis**: Aggregated team-level insights
- **Excel Data Import**: Easy upload and processing of SLA data
- **Interactive Dashboard**: Modern UI with visual performance indicators
- **Search & Filtering**: Quick agent and team lookup functionality

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v20.18.0 or higher) - *Recommended: Use Node.js 20.18.0 LTS*
- **Python** (v3.9 or higher)
- **MongoDB** (v5.0 or higher)
- **Git**

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd sla-tracker-dashboard
```

### 1.1. Setup Node.js Version (Recommended)

**Using NVM (Node Version Manager):**
```bash
# Install/use Node.js 20.18.0
nvm install 20.18.0
nvm use 20.18.0

# Verify version
node --version  # Should show v20.18.0
npm --version   # Should show 10.x.x or higher
```

**Alternative: Direct Installation**
- Download Node.js 20.18.0 LTS from [nodejs.org](https://nodejs.org/)
- The project includes `.nvmrc` files for automatic version detection

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install Node.js dependencies
npm install
# or if you prefer yarn:
yarn install

# Start the React development server
npm start
```

### 4. Database Setup

**Start MongoDB:**

**Option A: Using MongoDB Community Server**
```bash
# Start MongoDB service
# On Windows:
net start MongoDB
# On macOS:
brew services start mongodb-community
# On Linux:
sudo systemctl start mongod
```

**Option B: Using Docker**
```bash
docker run -d -p 27017:27017 --name sla-mongodb mongo:latest
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs

## 📁 Project Structure

```
sla-tracker-dashboard/
├── backend/                    # FastAPI backend
│   ├── server.py              # Main application file
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Backend environment variables
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Dashboard.js   # Main dashboard
│   │   │   ├── AgentPerformance.js
│   │   │   ├── TeamPerformance.js
│   │   │   ├── FileUpload.js
│   │   │   └── Navigation.js
│   │   ├── App.js            # Main App component
│   │   └── App.css           # Global styles
│   ├── package.json          # Node.js dependencies
│   └── .env                  # Frontend environment variables
└── README.md                 # This file
```

## 📤 Using the Dashboard

### 1. Upload Excel Data

1. Click on **"Upload Data"** in the navigation
2. Drag and drop your Excel file or click to browse
3. Wait for processing confirmation
4. Navigate back to **"Dashboard"** to view metrics

### 2. Expected Excel Format

Your Excel file should contain these columns:

**Required Columns:**
- `SR Number` - Ticket ID
- `Resolved By` - Agent who resolved the ticket
- `Updated Resolved By Team` - Team assignment
- `Response SLA Status` - "Met" or "Breached"
- `Resolution SLA Status` - "Met" or "Breached"

**Optional Columns:**
- `Created` - Ticket creation date
- `Area` / `Sub Area` - Ticket categorization
- `Status` - Current ticket status
- `Response Time (hh:mm)` - Time to first response
- `Resolution Time (hh:mm)` - Time to resolution

### 3. Dashboard Navigation

- **Dashboard**: Overview of all SLA metrics and KPIs
- **Upload Data**: Import new Excel files
- **Agent Performance**: Individual agent detailed metrics
- **Team Performance**: Team-level analysis and comparisons

## 🔧 Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=sla_tracker_db
CORS_ORIGINS=*
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 📊 API Endpoints

### Main Endpoints:

- `GET /api/dashboard-summary` - Overall dashboard metrics
- `POST /api/upload-excel` - Upload Excel file
- `GET /api/agents` - List all agents
- `GET /api/agent-performance/{agent_name}` - Individual agent metrics
- `GET /api/team-performance` - Team performance data
- `GET /api/tickets` - List tickets with filtering
- `DELETE /api/clear-data` - Clear all data (development)

Full API documentation available at: http://localhost:8001/docs

## 🐛 Troubleshooting

### Common Issues:

**1. MongoDB Connection Error**
```bash
# Check if MongoDB is running
mongosh
# Start MongoDB if not running
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

**2. Python Dependencies Error**
```bash
# Make sure virtual environment is activated
source venv/bin/activate
# Reinstall dependencies
pip install -r requirements.txt
```

**3. Node.js Dependencies Error**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**4. CORS Error**
- Check that `CORS_ORIGINS` in backend/.env includes your frontend URL
- Ensure frontend `REACT_APP_BACKEND_URL` points to correct backend address

## 🚀 Production Deployment

### Using Docker (Recommended - Node.js 20.18.0)

The project includes production-ready Docker configurations:

**Production Deployment:**
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Development with Hot Reload:**
```bash
# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View development logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f frontend
```

**Services:**
- **Frontend**: http://localhost:3000 (Node.js 20.18.0)
- **Backend**: http://localhost:8001 (Python 3.11)
- **MongoDB**: localhost:27017

### Manual Production Setup

**Frontend (Node.js 20.18.0):**
```bash
cd frontend
npm ci --only=production
npm run build
# Serve with nginx or serve -s build
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

## 📝 Sample Data

The dashboard works with Excel files containing SLA data. A sample format is included in the `/sample-data/` directory.

## 🔄 Development

### Adding New Features

1. **Backend**: Add new endpoints in `backend/server.py`
2. **Frontend**: Create new components in `frontend/src/components/`
3. **Database**: Use MongoDB collections via the existing connection

## 📞 Support

For issues and questions:

1. Check the troubleshooting section above
2. Review API documentation at `/docs` endpoint
3. Check browser console for frontend errors
4. Check backend logs for API errors

---

**Happy SLA Tracking! 📊**
