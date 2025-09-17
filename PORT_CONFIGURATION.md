# FarmCast Port Configuration

## Port Assignments

To resolve port conflicts, the following ports have been assigned to different services:

### Backend Services
- **main.py** (Primary Backend): Port **8001**
- **server_v2.py** (Enhanced Backend): Port **8000** (with auto-detection)
- **simple_server.py** (Simple Backend): Port **8002**

### Frontend Service
- **Vite Development Server**: Port **5173** (default)

## Which Backend to Use?

### Recommended: main.py (Port 8001)
- **File**: `backend/main.py`
- **Port**: 8001
- **Features**: Complete ML model, crop predictions, chat functionality
- **Start Command**: `python backend/main.py`
- **API URL**: `http://localhost:8001`

### Alternative: server_v2.py (Port 8000)
- **File**: `backend/server_v2.py`
- **Port**: 8000 (with intelligent port detection)
- **Features**: Enhanced farmer support, location services, weather forecasting
- **Start Command**: `python backend/server_v2.py`
- **API URL**: `http://localhost:8000` (or auto-detected port)

### Testing: simple_server.py (Port 8002)
- **File**: `backend/simple_server.py`
- **Port**: 8002
- **Features**: Basic functionality for testing
- **Start Command**: `python backend/simple_server.py`
- **API URL**: `http://localhost:8002`

## Frontend Configuration

The frontend is configured to connect to **main.py** on port **8001**:
- `src/services/api.js`: `API_BASE_URL = 'http://127.0.0.1:8001'`
- All component files updated to use port 8001

## Quick Start

### Option 1: Use the Startup Script
```bash
# Double-click or run:
start_farmcast.bat
```

### Option 2: Manual Start
```bash
# Terminal 1 - Start Backend
cd backend
python main.py

# Terminal 2 - Start Frontend
npm run dev
```

## Troubleshooting

### Port Already in Use
If you get "port already in use" errors:

1. **Check running processes**:
   ```bash
   netstat -ano | findstr :8001
   ```

2. **Kill conflicting processes**:
   ```bash
   taskkill /PID <process_id> /F
   ```

3. **Use different backend**:
   - Try `server_v2.py` (auto-detects free port)
   - Or use `simple_server.py` on port 8002

### Switch Backend Services
To use a different backend:

1. **Stop current backend** (Ctrl+C)
2. **Update frontend API URL** in `src/services/api.js`
3. **Start desired backend**
4. **Restart frontend** if needed

## Docker Configuration

Docker services use port 8001:
- `backend/Dockerfile`: EXPOSE 8001
- `backend/docker-compose.yml`: "8001:8001"

## Summary

✅ **Port conflicts resolved**
✅ **Frontend configured for main.py (port 8001)**
✅ **All services can run simultaneously**
✅ **Startup script created for easy deployment**
