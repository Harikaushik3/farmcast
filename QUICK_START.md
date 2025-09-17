# 🚀 Quick Start Guide - Farm Cast Visualizations

## Problem: Only seeing one chart instead of all 7 new visualizations

## Solution: Start the Backend Server

### Option 1: Simple Server (Recommended)
```bash
cd backend
python simple_server.py
```

### Option 2: Original Server
```bash
cd backend
python main.py
```

### Option 3: Install Dependencies First
```bash
cd backend
pip install fastapi uvicorn pandas scikit-learn numpy joblib python-multipart pydantic python-dotenv
python simple_server.py
```

## What to Look For

**✅ Success Messages:**
```
✅ Data loaded from: ../crop_yield.csv
✅ Model trained successfully
🎉 Backend ready!
INFO:     Uvicorn running on http://127.0.0.1:8001
```

**🌐 Then refresh your browser at:** http://localhost:5173/visualization

## Expected Visualizations (7 total)

1. **Feature Importance Chart** - Bar chart showing which factors matter most
2. **Feature Correlation Chart** - Positive/negative correlations with yield
3. **Crop Distribution Chart** - Bar chart of different crop types
4. **Area Distribution Chart** - Top 10 countries/regions
5. **Crop Distribution Pie Chart** - Proportional view of crops
6. **Yield Trends Over Time** - Line chart from 1990-2013
7. **Rainfall vs Yield Scatter Plot** - Relationship analysis
8. **Correlation Analysis Table** - Detailed correlation matrix

## Debug Steps

1. **Check Browser Console** (F12 → Console tab) for:
   - `Model Stats Data:` - Shows backend response
   - `Debug - modelStats:` - Shows frontend data
   - Any error messages

2. **Test Backend Directly:**
   - Visit: http://localhost:8001/model-stats
   - Should show JSON data with crop_distribution, feature_correlations, etc.

3. **Common Issues:**
   - Backend not running → Start simple_server.py
   - Missing dependencies → Run pip install command above
   - Data file missing → Ensure crop_yield.csv is in project root

## Files Created/Modified

- ✅ Enhanced Visualization.jsx with 7 new chart types
- ✅ Updated backend main.py with additional data endpoints
- ✅ Added debug logging and error handling
- ✅ Created simple_server.py as backup solution
