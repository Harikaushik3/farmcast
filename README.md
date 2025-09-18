# 🌾 FarmCast - AI-Powered Agricultural Intelligence Platform

FarmCast is a comprehensive full-stack application that uses machine learning to predict crop yields and provide intelligent agricultural insights. Built with React frontend and Python FastAPI backend featuring Random Forest ML model, location-based services, and intelligent crop recommendations.

## 🎯 Features

- **AI-Powered Predictions**: Random Forest regression model for accurate yield forecasting
- **Intelligent Crop Recommendations**: Get the best crop suggestions for your conditions
- **Location-Based Services**: Weather data and soil information based on geographic coordinates
- **Interactive Dashboard**: Real-time visualizations and model statistics
- **Smart Optimization Tips**: Personalized recommendations for farmers
- **Multi-language Support**: Internationalization with i18next
- **Modern UI**: Responsive design with TailwindCSS
- **Comprehensive API**: FastAPI backend with extensive endpoints
- **Data Visualization**: Interactive charts using Recharts

## 🏗️ Tech Stack

### Backend
- **Python 3.11+**
- **FastAPI** - Modern web framework for APIs
- **Random Forest** - Machine learning model for predictions
- **Pandas & NumPy** - Data processing
- **Scikit-learn** - Data preprocessing and evaluation
- **Google Generative AI** - Enhanced intelligence features
- **Uvicorn** - ASGI server
- **Intelligent Services**: Location, crop intelligence, caching, and historical analysis

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Recharts** - Data visualization library
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **Heroicons** - Icon library
- **i18next** - Internationalization framework

## 📁 Project Structure

```
farmcast/
├── backend/                    # Python FastAPI backend
│   ├── main.py                # Main FastAPI application
│   ├── services/              # Intelligent services
│   │   ├── location_service.py    # Location & weather data
│   │   ├── crop_intelligence.py   # Crop recommendations
│   │   ├── cache_service.py       # Caching system
│   │   └── historical_service.py  # Historical analysis
│   ├── requirements.txt       # Python dependencies
│   └── crop_yield.csv        # Training dataset
├── src/                       # React frontend
│   ├── components/            # Reusable components
│   ├── pages/                 # Page components
│   ├── services/              # API services
│   ├── App.jsx                # Main app component
│   └── index.css              # Global styles
├── public/                    # Static assets
├── Crop_data.csv             # Additional crop data
├── package.json              # Frontend dependencies
├── tailwind.config.js        # TailwindCSS configuration
├── vite.config.js            # Vite configuration
├── start_farmcast.bat        # Windows startup script
├── start_backend.bat         # Backend startup script
├── FARMER_SUPPORT_GUIDE.md   # Farmer support documentation
├── PORT_CONFIGURATION.md     # Port configuration guide
├── QUICK_START.md            # Quick start guide
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **Python 3.11+** and pip
- **Git**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd farmcast
```

### 2. Backend Setup

#### Using Python Virtual Environment
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Using Batch Scripts (Windows)
```bash
# Start backend only
start_backend.bat

# Start complete application (backend + frontend)
start_farmcast.bat
```

The backend API will be available at `http://localhost:8000`

### 3. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📊 API Endpoints

### Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API health check |
| GET | `/health` | Detailed health status |
| POST | `/train` | Train the Random Forest model |
| POST | `/predict` | Make yield predictions |
| POST | `/suggest-crops` | Get best crop recommendations |
| GET | `/feature-importance` | Get feature importance scores |
| GET | `/model-stats` | Get dataset and model statistics |
| GET | `/crop-options` | Get available crop types |
| GET | `/state-options` | Get available states |
| GET | `/season-options` | Get available seasons |

### Intelligent Services Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/location/weather` | Get weather data by coordinates |
| POST | `/location/soil` | Get soil data by coordinates |
| POST | `/crop-intelligence/recommend` | Get intelligent crop recommendations |
| POST | `/historical/analysis` | Get historical yield analysis |
| POST | `/weather/forecast` | Get weather forecast |

### Example API Usage

#### Train Model
```bash
curl -X POST "http://localhost:8000/train"
```

#### Make Prediction
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "State": "Punjab",
    "Crop": "Rice",
    "Crop_Year": 2024,
    "Season": "Kharif",
    "Area": 10.5,
    "Annual_Rainfall": 1200,
    "Fertilizer": 150,
    "Pesticide": 25
  }'
```

#### Get Crop Suggestions
```bash
curl -X POST "http://localhost:8000/suggest-crops" \
  -H "Content-Type: application/json" \
  -d '{
    "State": "Punjab",
    "Crop_Year": 2024,
    "Season": "Kharif",
    "Area": 10.5,
    "Annual_Rainfall": 1200,
    "Fertilizer": 150,
    "Pesticide": 25
  }'
```

## 🎮 Usage Guide

### 1. Home Dashboard
- View model status and dataset statistics
- See feature importance rankings
- Quick navigation to other sections
- Train the model if not already trained

### 2. Prediction Page
- Enter farming conditions:
  - **Location**: State selection
  - **Crop Details**: Crop type, year, season
  - **Area**: Cultivation area in hectares
  - **Weather**: Annual rainfall in mm
  - **Inputs**: Fertilizer and pesticide usage
- Get AI-powered yield predictions with confidence scores
- Receive personalized optimization tips

### 3. Crop Recommendation
- Input your farming conditions
- Get top 3 crop recommendations
- Compare predicted yields across different crops
- View historical performance data

### 4. Visualization Page
- Interactive feature importance charts
- Correlation analysis with yield
- Crop and state distribution in dataset
- Yield trends over years
- Key insights and statistics

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Google AI Configuration (optional)
GOOGLE_API_KEY=your_google_api_key_here

# Model Configuration
MODEL_PATH=./models/
DATA_PATH=./crop_yield.csv
```

### Frontend Configuration
Update API base URL in `src/services/api.js` if needed:
```javascript
const API_BASE_URL = 'http://localhost:8000'
```

## 📈 Model Information

### Dataset Features
- **State**: Indian state where crop is grown
- **Crop**: Crop type (Rice, Wheat, Maize, Cotton, etc.)
- **Crop_Year**: Year of cultivation
- **Season**: Growing season (Kharif, Rabi, Summer, Whole Year)
- **Area**: Cultivation area in hectares
- **Annual_Rainfall**: Annual rainfall in millimeters
- **Fertilizer**: Fertilizer usage in kg/ha
- **Pesticide**: Pesticide usage in kg/ha

### Model Performance
- **Algorithm**: Random Forest Regressor
- **Evaluation Metric**: RMSE (Root Mean Square Error)
- **Train/Test Split**: 80/20
- **Feature Scaling**: StandardScaler for numerical features
- **Encoding**: LabelEncoder for categorical features
- **Confidence Scoring**: Based on prediction variance across trees

## 🚢 Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Deploy the `dist/` folder to platforms like:
- **Vercel**: Connect GitHub repository
- **Netlify**: Drag and drop `dist/` folder
- **AWS S3 + CloudFront**
- **GitHub Pages**

### Backend Deployment
The FastAPI backend can be deployed to:
- **Heroku**: Using Procfile
- **AWS EC2**: Using Docker or direct deployment
- **Google Cloud Run**: Using containerization
- **DigitalOcean**: App Platform or Droplets

## 🛠️ Development

### Adding New Features
1. **Backend**: Add endpoints in `backend/main.py` or create new services
2. **Frontend**: Create components in `src/components/` or pages in `src/pages/`
3. **API Integration**: Update `src/services/api.js`
4. **Services**: Add intelligent services in `backend/services/`

### Code Style
- **Backend**: Follow PEP 8 Python style guide
- **Frontend**: Use ESLint configuration with React best practices
- **Commits**: Use conventional commit messages

### Available Scripts
```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Backend
uvicorn main:app --reload    # Start development server
python -m pytest            # Run tests (if available)
```

## 📝 Sample Data

### Prediction Input Example
```json
{
  "State": "Punjab",
  "Crop": "Rice",
  "Crop_Year": 2024,
  "Season": "Kharif",
  "Area": 15.5,
  "Annual_Rainfall": 1200,
  "Fertilizer": 180,
  "Pesticide": 30
}
```

### Expected Output
```json
{
  "predicted_yield": 6.2,
  "confidence_score": 0.87,
  "optimization_tips": [
    "Monsoon season crop. Ensure proper drainage and pest management during humid conditions.",
    "Maintain proper water management and monitor for blast disease.",
    "Current conditions are well-balanced for good crop yield."
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Backend not starting:**
- Check Python version (3.11+ required)
- Verify all dependencies installed: `pip install -r requirements.txt`
- Ensure port 8000 is not in use
- Check if virtual environment is activated

**Frontend build errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version (18+ required)
- Verify all dependencies: `npm install`

**CORS errors:**
- Ensure backend is running on `http://localhost:8000`
- Check API base URL in `src/services/api.js`
- Verify CORS middleware configuration in backend

**Model prediction errors:**
- Train the model first using `/train` endpoint
- Verify input data format matches API schema
- Check that all required fields are provided
- Ensure CSV data file is accessible

**Service import warnings:**
- Services are optional; basic functionality works without them
- Check if service files exist in `backend/services/`
- Verify Google API key if using AI features

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the [FARMER_SUPPORT_GUIDE.md](FARMER_SUPPORT_GUIDE.md) for detailed guidance
- Review [QUICK_START.md](QUICK_START.md) for setup instructions
- Check [PORT_CONFIGURATION.md](PORT_CONFIGURATION.md) for port setup
- Review API documentation at `http://localhost:8000/docs`

## 📚 Additional Resources

- **Farmer Support Guide**: Comprehensive guide for farmers using the platform
- **Quick Start Guide**: Fast setup instructions
- **Port Configuration**: Network setup and troubleshooting
- **API Documentation**: Interactive docs available at `/docs` endpoint

---

**Built with ❤️ for sustainable agriculture and data-driven farming decisions.**