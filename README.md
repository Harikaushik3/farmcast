# 🌾 Farm Cast - AI-Powered Crop Yield Prediction

Farm Cast is a comprehensive full-stack application that uses machine learning to predict crop yields based on weather conditions, soil parameters, and crop types. Built with React frontend and Python FastAPI backend with XGBoost ML model.

## 🎯 Features

- **AI-Powered Predictions**: XGBoost regression model for accurate yield forecasting
- **Interactive Dashboard**: Real-time visualizations and model statistics
- **Smart Recommendations**: Personalized optimization tips for farmers
- **Modern UI**: Responsive design with TailwindCSS
- **REST API**: FastAPI backend with comprehensive endpoints
- **Data Visualization**: Interactive charts using Recharts

## 🏗️ Tech Stack

### Backend
- **Python 3.11+**
- **FastAPI** - Modern web framework for APIs
- **XGBoost** - Machine learning model for predictions
- **Pandas & NumPy** - Data processing
- **Scikit-learn** - Data preprocessing and evaluation
- **SHAP** - Feature importance analysis
- **Uvicorn** - ASGI server

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Recharts** - Data visualization library
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **Heroicons** - Icon library

## 📁 Project Structure

```
farmcast/
├── backend/                 # Python FastAPI backend
│   ├── main.py             # FastAPI application
│   ├── crop_yield.csv      # Training dataset
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Docker configuration
│   └── docker-compose.yml  # Docker Compose setup
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   │   └── Navbar.jsx      # Navigation component
│   ├── pages/              # Page components
│   │   ├── Home.jsx        # Dashboard page
│   │   ├── Prediction.jsx  # Prediction form page
│   │   └── Visualization.jsx # Charts and analytics
│   ├── services/           # API services
│   │   └── api.js          # API client
│   ├── App.jsx             # Main app component
│   └── index.css           # Global styles
├── package.json            # Frontend dependencies
├── tailwind.config.js      # TailwindCSS configuration
└── README.md               # This file
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

#### Option A: Using Python Virtual Environment
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
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

#### Option B: Using Docker
```bash
# Navigate to backend directory
cd backend

# Build and run with Docker Compose
docker-compose up --build

# Or build and run manually
docker build -t farmcast-api .
docker run -p 8001:8001 farmcast-api
```

The backend API will be available at `http://localhost:8001`

### 3. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📊 API Endpoints

### Base URL: `http://localhost:8001`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API health check |
| POST | `/train` | Train the XGBoost model |
| POST | `/predict` | Make yield predictions |
| GET | `/feature-importance` | Get feature importance scores |
| GET | `/model-stats` | Get dataset and model statistics |

### Example API Usage

#### Train Model
```bash
curl -X POST "http://localhost:8001/train"
```

#### Make Prediction
```bash
curl -X POST "http://localhost:8001/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "Temperature": 25.5,
    "Rainfall": 800,
    "pH": 6.2,
    "Nitrogen": 40,
    "Phosphorus": 35,
    "Potassium": 20,
    "Crop": "Rice"
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
  - **Weather**: Temperature (°C), Rainfall (mm)
  - **Soil**: pH level, Nitrogen, Phosphorus, Potassium (kg/ha)
  - **Crop**: Select from Rice, Wheat, or Corn
- Get AI-powered yield predictions
- Receive personalized optimization tips

### 3. Visualization Page
- Interactive feature importance charts
- Correlation analysis with yield
- Crop distribution in dataset
- Key insights and statistics

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8001

# Model Configuration
MODEL_PATH=./models/
DATA_PATH=./crop_yield.csv
```

### Frontend Configuration
Update API base URL in `src/services/api.js` if needed:
```javascript
const API_BASE_URL = 'http://localhost:8001'
```

## 📈 Model Information

### Dataset Features
- **Temperature**: Air temperature in Celsius
- **Rainfall**: Annual rainfall in millimeters
- **pH**: Soil pH level (3.0-9.0)
- **Nitrogen**: Nitrogen content in kg/ha
- **Phosphorus**: Phosphorus content in kg/ha
- **Potassium**: Potassium content in kg/ha
- **Crop**: Crop type (Rice, Wheat, Corn)

### Model Performance
- **Algorithm**: XGBoost Regressor
- **Evaluation Metric**: RMSE (Root Mean Square Error)
- **Train/Test Split**: 80/20
- **Feature Scaling**: StandardScaler for numerical features
- **Encoding**: LabelEncoder for categorical features

## 🚢 Deployment

### Backend Deployment (Docker)
```bash
# Build production image
docker build -t farmcast-api:prod .

# Run in production mode
docker run -d -p 8001:8001 --name farmcast-api farmcast-api:prod
```

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

## 🛠️ Development

### Adding New Features
1. **Backend**: Add endpoints in `backend/main.py`
2. **Frontend**: Create components in `src/components/`
3. **API Integration**: Update `src/services/api.js`

### Code Style
- **Backend**: Follow PEP 8 Python style guide
- **Frontend**: Use ESLint configuration
- **Commits**: Use conventional commit messages

### Testing
```bash
# Backend testing
cd backend
python -m pytest

# Frontend testing
npm test
```

## 📝 Sample Data

### Input Example
```json
{
  "Temperature": 28.3,
  "Rainfall": 1200,
  "pH": 6.8,
  "Nitrogen": 45,
  "Phosphorus": 40,
  "Potassium": 25,
  "Crop": "Rice"
}
```

### Expected Output
```json
{
  "predicted_yield": 5.1,
  "confidence_score": 0.85,
  "optimization_tips": [
    "Current conditions are well-balanced for good crop yield.",
    "Consider maintaining current nutrient levels for optimal growth."
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
- Ensure port 8001 is not in use

**Frontend build errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version (18+ required)
- Verify all dependencies: `npm install`

**CORS errors:**
- Ensure backend is running on `http://localhost:8001`
- Check API base URL in `src/services/api.js`

**Model prediction errors:**
- Train the model first using `/train` endpoint
- Verify input data format matches API schema
- Check that all required fields are provided

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review API endpoints at `http://localhost:8001/docs`

---

**Built with ❤️ for sustainable agriculture and data-driven farming decisions.**
