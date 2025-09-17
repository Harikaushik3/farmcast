#!/usr/bin/env python3
"""
Simplified backend server for Farm Cast
Run this if main.py has issues
"""
import os
import sys
import json
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime
import asyncio
import logging
from contextlib import asynccontextmanager

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

try:
    from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    from pydantic import BaseModel
    import pandas as pd
    import numpy as np
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.preprocessing import LabelEncoder
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_squared_error, r2_score
    import joblib
    import uvicorn
    
    # Import our intelligent farmer services
    from services.location_service import location_service, LocationData, WeatherData, SoilData
    from services.crop_intelligence import crop_intelligence, CropRecommendation
    from services.cache_service import cache_service
    from services.historical_service import historical_service, SeasonalInsight, YieldTrend, ClimatePattern
    from services.market_service import market_service, MarketPrice, MarketTrend
    from services.pest_service import pest_service, PestAlert, DiseaseAlert
    from services.calendar_service import calendar_service, PlantingWindow, CropCalendar
    
    print("All imports successful")
except ImportError as e:
    print(f"Import error: {e}")
    print("Please install required packages or check service imports")
    sys.exit(1)

app = FastAPI(title="Farm Cast API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
model = None
label_encoders = {}
df = None

# Pydantic models for API requests
class LocationRequest(BaseModel):
    latitude: float
    longitude: float

class CropRecommendationRequest(BaseModel):
    latitude: float
    longitude: float
    season: Optional[str] = None

class HistoricalAnalysisRequest(BaseModel):
    latitude: float
    longitude: float
    years_back: Optional[int] = 5

class WeatherForecastRequest(BaseModel):
    latitude: float
    longitude: float
    days: Optional[int] = 7

def load_data():
    """Load the crop data"""
    global df
    
    # Try multiple paths
    paths = [
        "../crop_yield.csv",
        "crop_yield.csv", 
        Path(__file__).parent.parent / "crop_yield.csv"
    ]
    
    for path in paths:
        try:
            df = pd.read_csv(path)
            print(f"Data loaded from: {path}")
            print(f"Dataset shape: {df.shape}")
            return True
        except FileNotFoundError:
            continue
    
    print("Could not find crop_yield.csv")
    return False

def train_model():
    """Train the model"""
    global model, label_encoders, df
    
    if df is None:
        return False
    
    try:
        # Prepare data
        df_clean = df.dropna()
        
        # Encode categorical variables
        categorical_cols = ['Crop', 'Season', 'State']
        for col in categorical_cols:
            if col in df_clean.columns:
                le = LabelEncoder()
                df_clean[col] = le.fit_transform(df_clean[col].astype(str))
                label_encoders[col] = le
        
        # Features and target
        X = df_clean.drop('Yield', axis=1)
        y = df_clean['Yield']
        
        # Train model
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X, y)
        
        print("Model trained successfully")
        return True
        
    except Exception as e:
        print(f"Training error: {e}")
        return False

@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    print("Starting Farm Cast Backend...")
    
    if load_data():
        if train_model():
            print("Backend ready!")
        else:
            print("Model training failed")
    else:
        print("Data loading failed")

@app.get("/")
async def root():
    return {"message": "Farm Cast API is running!"}

@app.get("/model-stats")
async def get_model_stats():
    """Get model statistics"""
    if df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    try:
        import json
        
        # Safe data conversion functions
        def safe_float(val):
            try:
                return float(val)
            except:
                return 0.0
        
        def safe_int(val):
            try:
                return int(val)
            except:
                return 0
        
        # Basic stats with safe conversion
        stats = {
            "dataset_size": len(df),
            "features": len(df.columns) - 1,
            "target_stats": {
                "mean_yield": safe_float(df['Yield'].mean()),
                "min_yield": safe_float(df['Yield'].min()),
                "max_yield": safe_float(df['Yield'].max()),
                "std_yield": safe_float(df['Yield'].std())
            }
        }
        
        # Crop distribution - safe conversion
        crop_counts = df['Crop'].value_counts().head(10)
        stats["crop_distribution"] = {}
        for crop, count in crop_counts.items():
            stats["crop_distribution"][str(crop)] = safe_int(count)
        
        # State distribution - safe conversion  
        state_counts = df['State'].value_counts().head(10)
        stats["state_distribution"] = {}
        for state, count in state_counts.items():
            stats["state_distribution"][str(state)] = safe_int(count)
        
        # Feature correlations - safe conversion (only numeric columns)
        numeric_df = df.select_dtypes(include=[np.number])
        if 'Yield' in numeric_df.columns:
            correlations = numeric_df.corr()['Yield'].drop('Yield')
            stats["feature_correlations"] = {}
            for feature, corr in correlations.items():
                if not pd.isna(corr):
                    stats["feature_correlations"][str(feature)] = safe_float(corr)
        else:
            stats["feature_correlations"] = {}
        
        # Year range
        stats["year_range"] = f"{safe_int(df['Crop_Year'].min())}-{safe_int(df['Crop_Year'].max())}"
        
        # Yield by year - safe conversion
        yield_by_year = df.groupby('Crop_Year')['Yield'].mean()
        stats["yield_by_year"] = {}
        for year, yield_val in yield_by_year.items():
            stats["yield_by_year"][str(safe_int(year))] = safe_float(yield_val)
        
        # Sample data for scatter plot - safe conversion
        sample_df = df.sample(min(200, len(df)), random_state=42)
        scatter_data = []
        for _, row in sample_df.iterrows():
            try:
                data_point = {
                    "rainfall": safe_float(row['Annual_Rainfall']),
                    "yield": safe_float(row['Yield']),
                    "fertilizer": safe_float(row['Fertilizer']),
                    "pesticides": safe_float(row['Pesticide'])
                }
                # Only add if all values are valid
                if all(isinstance(v, (int, float)) and not pd.isna(v) for v in data_point.values()):
                    scatter_data.append(data_point)
            except:
                continue
        
        stats["scatter_data"] = scatter_data[:100]  # Limit to 100 points
        
        # Test JSON serialization
        json.dumps(stats)
        
        return stats
        
    except Exception as e:
        import traceback
        print(f"Model stats error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error getting stats: {str(e)}")

@app.get("/feature-importance")
async def get_feature_importance():
    """Get feature importance"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not trained")
    
    try:
        # Get feature names (excluding target)
        feature_names = [col for col in df.columns if col != 'Yield']
        importances = model.feature_importances_
        
        # Create feature importance data
        importance_data = [
            {"feature": name, "importance": float(imp)}
            for name, imp in zip(feature_names, importances)
        ]
        
        # Sort by importance
        importance_data.sort(key=lambda x: x['importance'], reverse=True)
        
        return importance_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting feature importance: {str(e)}")

@app.get("/crop-options")
async def get_crop_options():
    """Get available crop options"""
    if df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    try:
        crops = sorted(df['Crop'].unique().tolist())
        return crops
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting crop options: {str(e)}")

@app.get("/area-options")
async def get_area_options():
    """Get available state/area options"""
    if df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    try:
        states = sorted(df['State'].unique().tolist())
        return states
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting area options: {str(e)}")

# ==================== INTELLIGENT FARMER SUPPORT ENDPOINTS ====================

@app.post("/farmer-support/location-data")
async def get_location_data(request: LocationRequest):
    """Get comprehensive location-based data"""
    try:
        # Check cache first
        cached_location = cache_service.get_location_data(request.latitude, request.longitude)
        cached_weather = cache_service.get_weather_data(request.latitude, request.longitude)
        cached_soil = cache_service.get_soil_data(request.latitude, request.longitude)
        
        # Get fresh data if not cached
        if not cached_location:
            location_data = await location_service.get_location_from_coordinates(
                request.latitude, request.longitude
            )
            cache_service.store_location_data(location_data)
        else:
            location_data = cached_location
            
        if not cached_weather:
            weather_data = await location_service.get_current_weather(
                request.latitude, request.longitude
            )
            cache_service.store_weather_data(request.latitude, request.longitude, weather_data)
        else:
            weather_data = cached_weather
            
        if not cached_soil:
            soil_data = await location_service.get_soil_data(
                request.latitude, request.longitude
            )
            cache_service.store_soil_data(request.latitude, request.longitude, soil_data)
        else:
            soil_data = cached_soil
        
        # Get climatic zone
        climatic_zone = location_service.get_climatic_zone(location_data.state)
        
        return {
            "location": {
                "latitude": location_data.latitude,
                "longitude": location_data.longitude,
                "address": location_data.address,
                "district": location_data.district,
                "state": location_data.state,
                "country": location_data.country,
                "climatic_zone": climatic_zone
            },
            "weather": {
                "temperature": weather_data.temperature,
                "humidity": weather_data.humidity,
                "rainfall": weather_data.rainfall,
                "evapotranspiration": weather_data.evapotranspiration,
                "wind_speed": weather_data.wind_speed,
                "pressure": weather_data.pressure,
                "timestamp": weather_data.timestamp.isoformat()
            },
            "soil": {
                "ph": soil_data.ph,
                "moisture": soil_data.moisture,
                "organic_carbon": soil_data.organic_carbon,
                "nitrogen": soil_data.nitrogen,
                "phosphorus": soil_data.phosphorus,
                "potassium": soil_data.potassium,
                "sand_content": soil_data.sand_content,
                "clay_content": soil_data.clay_content,
                "silt_content": soil_data.silt_content
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting location data: {str(e)}")

@app.post("/farmer-support/crop-recommendations")
async def get_crop_recommendations(request: CropRecommendationRequest):
    """Get intelligent crop recommendations"""
    try:
        # Check cache first
        cached_recommendations = cache_service.get_crop_recommendations(
            request.latitude, request.longitude, request.season or ""
        )
        
        if cached_recommendations:
            recommendations = cached_recommendations
        else:
            # Get location and environmental data
            location_data = await location_service.get_location_from_coordinates(
                request.latitude, request.longitude
            )
            weather_data = await location_service.get_current_weather(
                request.latitude, request.longitude
            )
            soil_data = await location_service.get_soil_data(
                request.latitude, request.longitude
            )
            weather_forecast = await location_service.get_weather_forecast(
                request.latitude, request.longitude, 7
            )
            
            # Get climatic zone
            climatic_zone = location_service.get_climatic_zone(location_data.state)
            
            # Generate recommendations
            recommendations = crop_intelligence.get_crop_recommendations(
                location_data, weather_data, soil_data, climatic_zone,
                weather_forecast, request.season
            )
            
            # Cache the results
            cache_service.store_crop_recommendations(
                request.latitude, request.longitude, recommendations, request.season or ""
            )
        
        # Convert to JSON-serializable format
        recommendations_data = []
        for rec in recommendations:
            recommendations_data.append({
                "crop_name": rec.crop_name,
                "expected_yield": rec.expected_yield,
                "profit_margin": rec.profit_margin,
                "sustainability_score": rec.sustainability_score,
                "water_requirement": rec.water_requirement,
                "growth_duration": rec.growth_duration,
                "best_planting_time": rec.best_planting_time,
                "risk_factors": rec.risk_factors,
                "care_instructions": rec.care_instructions
            })
        
        return {
            "recommendations": recommendations_data,
            "location": f"{location_data.district}, {location_data.state}",
            "season": request.season,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting crop recommendations: {str(e)}")

@app.post("/farmer-support/weather-forecast")
async def get_weather_forecast(request: WeatherForecastRequest):
    """Get multi-day weather forecast"""
    try:
        forecast_data = await location_service.get_weather_forecast(
            request.latitude, request.longitude, request.days
        )
        
        # Convert to JSON-serializable format
        forecast_list = []
        for weather in forecast_data:
            forecast_list.append({
                "temperature": weather.temperature,
                "humidity": weather.humidity,
                "rainfall": weather.rainfall,
                "evapotranspiration": weather.evapotranspiration,
                "wind_speed": weather.wind_speed,
                "pressure": weather.pressure,
                "timestamp": weather.timestamp.isoformat()
            })
        
        return {
            "forecast": forecast_list,
            "location": {"latitude": request.latitude, "longitude": request.longitude},
            "days_requested": request.days,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting weather forecast: {str(e)}")

@app.post("/farmer-support/historical-analysis")
async def get_historical_analysis(request: HistoricalAnalysisRequest):
    """Get historical crop patterns and insights"""
    try:
        # Get location data
        location_data = await location_service.get_location_from_coordinates(
            request.latitude, request.longitude
        )
        
        # Check cache first
        cached_historical = cache_service.get_historical_data(request.latitude, request.longitude)
        
        if cached_historical:
            historical_patterns = cached_historical
        else:
            # Generate historical analysis
            historical_patterns = historical_service.analyze_historical_patterns(
                location_data, request.years_back
            )
            
            # Cache the results
            cache_service.store_historical_data(request.latitude, request.longitude, historical_patterns)
        
        # Get seasonal insights
        seasonal_insights = historical_service.get_seasonal_insights(location_data)
        
        # Get yield trends
        yield_trends = historical_service.analyze_yield_trends(location_data)
        
        # Get climate patterns
        climate_patterns = historical_service.get_climate_patterns(location_data)
        
        # Convert to JSON-serializable format
        historical_data = []
        for pattern in historical_patterns:
            historical_data.append({
                "crop": pattern.crop,
                "year": pattern.year,
                "yield_per_hectare": pattern.yield_per_hectare,
                "profit_margin": pattern.profit_margin,
                "weather_conditions": pattern.weather_conditions,
                "success_rate": pattern.success_rate
            })
        
        seasonal_data = []
        for insight in seasonal_insights:
            seasonal_data.append({
                "season": insight.season,
                "recommended_crops": insight.recommended_crops,
                "average_yield": insight.average_yield,
                "success_rate": insight.success_rate,
                "risk_factors": insight.risk_factors,
                "optimal_planting_window": insight.optimal_planting_window
            })
        
        trends_data = []
        for trend in yield_trends:
            trends_data.append({
                "crop": trend.crop,
                "years": trend.years,
                "yields": trend.yields,
                "trend_direction": trend.trend_direction,
                "trend_percentage": trend.trend_percentage,
                "prediction_next_year": trend.prediction_next_year
            })
        
        climate_data = {
            "location": climate_patterns.location,
            "temperature_trend": climate_patterns.temperature_trend,
            "rainfall_pattern": climate_patterns.rainfall_pattern,
            "extreme_events": climate_patterns.extreme_events,
            "climate_zone_shift": climate_patterns.climate_zone_shift
        }
        
        return {
            "historical_patterns": historical_data,
            "seasonal_insights": seasonal_data,
            "yield_trends": trends_data,
            "climate_patterns": climate_data,
            "location": f"{location_data.district}, {location_data.state}",
            "years_analyzed": request.years_back,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting historical analysis: {str(e)}")

@app.get("/farmer-support/cache-stats")
async def get_cache_stats():
    """Get cache statistics for monitoring"""
    try:
        stats = cache_service.get_cache_stats()
        return {
            "cache_stats": stats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting cache stats: {str(e)}")

@app.post("/farmer-support/clear-cache")
async def clear_cache(data_type: Optional[str] = None):
    """Clear cache entries"""
    try:
        cache_service.clear_cache(data_type=data_type)
        return {
            "message": f"Cache cleared for type: {data_type or 'all'}",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing cache: {str(e)}")

# ==================== QUICK ACTIONS ENDPOINTS ====================

@app.post("/farmer-support/extended-forecast")
async def get_extended_forecast(request: WeatherForecastRequest):
    """Get extended 7-day weather forecast with detailed analysis"""
    try:
        # Get location data for context
        location_data = await location_service.get_location_from_coordinates(
            request.latitude, request.longitude
        )
        
        # Generate mock forecast data for now (replace with real API later)
        from datetime import datetime, timedelta
        import random
        
        daily_forecasts = []
        base_date = datetime.now()
        
        for day in range(request.days or 7):
            forecast_date = base_date + timedelta(days=day)
            
            # Generate realistic weather data
            base_temp = 25 + random.uniform(-8, 10)
            min_temp = base_temp + random.uniform(-5, 0)
            max_temp = base_temp + random.uniform(5, 15)
            humidity = random.uniform(40, 90)
            rainfall = random.uniform(0, 20) if random.random() > 0.6 else 0
            wind_speed = random.uniform(5, 25)
            
            # Determine conditions
            if rainfall > 10:
                conditions = "Heavy Rain"
            elif rainfall > 2:
                conditions = "Light Rain"
            elif humidity > 80:
                conditions = "Cloudy"
            else:
                conditions = "Clear"
            
            # Generate farming advice
            farming_advice = []
            if rainfall > 10:
                farming_advice.extend([
                    "Heavy rain expected - avoid field operations",
                    "Ensure proper drainage in fields",
                    "Postpone harvesting activities"
                ])
            elif rainfall > 2:
                farming_advice.append("Light rain expected - good for irrigation savings")
            
            if max_temp > 35:
                farming_advice.extend([
                    "High temperature - increase irrigation frequency",
                    "Provide shade for livestock"
                ])
            elif min_temp < 10:
                farming_advice.extend([
                    "Low temperature - protect sensitive crops",
                    "Cover young plants during night"
                ])
            
            if wind_speed > 20:
                farming_advice.append("High winds expected - secure loose structures")
            
            if not farming_advice:
                farming_advice.append("Good conditions for regular farming activities")
            
            daily_summary = {
                "date": forecast_date.strftime("%Y-%m-%d"),
                "day_name": forecast_date.strftime("%A"),
                "min_temp": round(min_temp, 1),
                "max_temp": round(max_temp, 1),
                "avg_humidity": round(humidity, 1),
                "total_rainfall": round(rainfall, 1),
                "avg_wind_speed": round(wind_speed, 1),
                "conditions": conditions,
                "farming_advice": farming_advice
            }
            
            daily_forecasts.append(daily_summary)
        
        return {
            "location": f"{location_data.district}, {location_data.state}",
            "forecast_period": f"{request.days or 7} days",
            "daily_forecasts": daily_forecasts,
            "summary": {
                "avg_temperature": round(sum(f["max_temp"] + f["min_temp"] for f in daily_forecasts) / (2 * len(daily_forecasts)), 1) if daily_forecasts else 0,
                "total_expected_rainfall": round(sum(f["total_rainfall"] for f in daily_forecasts), 1),
                "rainy_days": len([f for f in daily_forecasts if f["total_rainfall"] > 1]),
                "general_advice": "Monitor weather conditions daily and adjust farming activities accordingly"
            },
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Extended forecast error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting extended forecast: {str(e)}")

@app.post("/farmer-support/market-prices")
async def get_market_prices(request: LocationRequest):
    """Get current market prices and trends"""
    try:
        # Get location data
        location_data = await location_service.get_location_from_coordinates(
            request.latitude, request.longitude
        )
        
        # Get available crops
        available_crops = market_service.get_available_crops()
        
        # Get current prices for major crops
        major_crops = ["Rice", "Wheat", "Maize", "Cotton", "Tomato", "Onion"]
        current_prices = await market_service.get_current_prices(major_crops, location_data.state)
        
        # Get price alerts
        price_alerts = await market_service.get_price_alerts(major_crops, threshold_percentage=3.0)
        
        # Get market trends for top crops
        market_trends = {}
        for crop in major_crops[:4]:  # Top 4 crops
            trend = await market_service.get_market_trends(crop)
            if trend:
                market_trends[crop] = {
                    "weekly_prices": trend.weekly_prices,
                    "monthly_average": trend.monthly_average,
                    "seasonal_high": trend.seasonal_high,
                    "seasonal_low": trend.seasonal_low,
                    "forecast_next_week": trend.forecast_next_week
                }
        
        # Convert prices to JSON-serializable format
        prices_data = []
        for price in current_prices:
            prices_data.append({
                "crop_name": price.crop_name,
                "price_per_kg": price.price_per_kg,
                "currency": price.currency,
                "market_name": price.market_name,
                "date": price.date.isoformat(),
                "trend": price.trend,
                "change_percentage": price.change_percentage
            })
        
        return {
            "location": f"{location_data.district}, {location_data.state}",
            "current_prices": prices_data,
            "market_trends": market_trends,
            "price_alerts": price_alerts,
            "available_crops": available_crops,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting market prices: {str(e)}")

@app.post("/farmer-support/pest-alerts")
async def get_pest_alerts(request: LocationRequest):
    """Get pest and disease alerts for the location"""
    try:
        # Get location and weather data
        location_data = await location_service.get_location_from_coordinates(
            request.latitude, request.longitude
        )
        weather_data = await location_service.get_current_weather(
            request.latitude, request.longitude
        )
        
        # Convert weather data to dict
        weather_dict = {
            "temperature": weather_data.temperature,
            "humidity": weather_data.humidity,
            "rainfall": weather_data.rainfall
        }
        
        location_dict = {
            "district": location_data.district,
            "state": location_data.state
        }
        
        # Get alerts for major crops
        major_crops = ["Rice", "Wheat", "Cotton", "Tomato"]
        all_pest_alerts = []
        all_disease_alerts = []
        
        for crop in major_crops:
            # Get pest alerts
            pest_alerts = await pest_service.get_pest_alerts(crop, location_dict, weather_dict)
            for alert in pest_alerts:
                all_pest_alerts.append({
                    "pest_name": alert.pest_name,
                    "crop_affected": alert.crop_affected,
                    "severity": alert.severity,
                    "location": alert.location,
                    "description": alert.description,
                    "symptoms": alert.symptoms,
                    "prevention_methods": alert.prevention_methods,
                    "treatment_options": alert.treatment_options,
                    "alert_date": alert.alert_date.isoformat(),
                    "weather_conditions": alert.weather_conditions
                })
            
            # Get disease alerts
            disease_alerts = await pest_service.get_disease_alerts(crop, location_dict, weather_dict)
            for alert in disease_alerts:
                all_disease_alerts.append({
                    "disease_name": alert.disease_name,
                    "crop_affected": alert.crop_affected,
                    "severity": alert.severity,
                    "probability": alert.probability,
                    "symptoms": alert.symptoms,
                    "causes": alert.causes,
                    "prevention": alert.prevention,
                    "treatment": alert.treatment,
                    "alert_date": alert.alert_date.isoformat()
                })
        
        # Get prevention calendar
        prevention_calendar = pest_service.get_prevention_calendar("Rice", location_data.state)
        current_month = datetime.now().strftime("%B")
        current_month_activities = prevention_calendar.get(current_month, [])
        
        return {
            "location": f"{location_data.district}, {location_data.state}",
            "weather_conditions": weather_dict,
            "pest_alerts": all_pest_alerts,
            "disease_alerts": all_disease_alerts,
            "current_month_prevention": {
                "month": current_month,
                "activities": current_month_activities
            },
            "alert_summary": {
                "total_pest_alerts": len(all_pest_alerts),
                "total_disease_alerts": len(all_disease_alerts),
                "high_severity_count": len([a for a in all_pest_alerts + all_disease_alerts if a.get("severity") == "high"]),
                "crops_at_risk": list(set([a.get("crop_affected") for a in all_pest_alerts + all_disease_alerts]))
            },
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting pest alerts: {str(e)}")

@app.post("/farmer-support/planting-calendar")
async def get_planting_calendar(request: LocationRequest):
    """Get comprehensive planting calendar and recommendations"""
    try:
        # Get location data
        location_data = await location_service.get_location_from_coordinates(
            request.latitude, request.longitude
        )
        
        current_date = datetime.now()
        
        # Get current month recommendations
        current_recommendations = await calendar_service.get_current_recommendations(
            location_data.state, current_date
        )
        
        # Get next planting opportunities
        major_crops = ["Rice", "Wheat", "Maize", "Cotton", "Tomato", "Onion"]
        next_opportunities = calendar_service.get_next_planting_opportunities(major_crops, current_date)
        
        # Get detailed calendar for top 3 crops
        detailed_calendars = {}
        for crop in major_crops[:3]:
            calendar_data = await calendar_service.get_planting_calendar(crop, location_data.state, current_date)
            if calendar_data:
                # Convert to JSON-serializable format
                planting_windows = []
                for window in calendar_data.planting_windows:
                    planting_windows.append({
                        "crop_name": window.crop_name,
                        "season": window.season,
                        "start_month": window.start_month,
                        "end_month": window.end_month,
                        "optimal_month": window.optimal_month,
                        "duration_days": window.duration_days,
                        "harvest_months": window.harvest_months,
                        "region_suitability": window.region_suitability
                    })
                
                detailed_calendars[crop] = {
                    "planting_windows": planting_windows,
                    "care_schedule": calendar_data.care_schedule
                }
        
        # Generate month-wise activity summary
        monthly_summary = {}
        for month in range(1, 13):
            month_name = calendar.month_name[month]
            activities = []
            
            for crop in major_crops:
                calendar_data = await calendar_service.get_planting_calendar(crop, location_data.state, current_date)
                if calendar_data and month in calendar_data.monthly_activities:
                    for activity in calendar_data.monthly_activities[month]:
                        activities.append({
                            "crop": crop,
                            "activity": activity.description,
                            "priority": activity.priority,
                            "type": activity.activity_type
                        })
            
            monthly_summary[month_name] = activities
        
        return {
            "location": f"{location_data.district}, {location_data.state}",
            "current_month": current_date.strftime("%B %Y"),
            "current_recommendations": current_recommendations,
            "next_opportunities": next_opportunities[:6],  # Top 6 opportunities
            "detailed_calendars": detailed_calendars,
            "monthly_summary": monthly_summary,
            "seasonal_overview": {
                "kharif_season": "June - October (Monsoon crops)",
                "rabi_season": "November - April (Winter crops)",
                "summer_season": "March - June (Summer crops)"
            },
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting planting calendar: {str(e)}")

@app.on_event("startup")
async def cleanup_cache():
    """Clean up expired cache entries on startup"""
    try:
        cache_service.cleanup_expired_entries()
    except Exception as e:
        print(f"Cache cleanup error: {e}")

if __name__ == "__main__":
    print("Farm Cast Enhanced Backend Server")
    print("=" * 40)
    print("Features:")
    print("- Traditional crop yield prediction")
    print("- Intelligent farmer support")
    print("- Location-based recommendations")
    print("- Weather forecasting")
    print("- Historical analysis")
    print("- Offline-first caching")
    uvicorn.run(app, host="127.0.0.1", port=8002, log_level="info")
