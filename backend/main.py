from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_squared_error
from sklearn.ensemble import RandomForestRegressor
import joblib
import os
from typing import Dict, List, Optional
import json
import traceback
from contextlib import asynccontextmanager
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global model, scaler, label_encoders, feature_names, model_trained
    
    try:
        # Force retrain model with correct structure - remove old model files
        for file_name in ['xgboost_model.pkl', 'scaler.pkl', 'label_encoders.pkl']:
            if os.path.exists(file_name):
                os.remove(file_name)
                print(f"🗑️ Removed old model file: {file_name}")
        
        # Always train new model with correct structure
        # Train new model
        print("🔄 Training new model...")
        X, y, df = load_and_preprocess_data()
        X_processed = preprocess_features(X, fit_transform=True)
        feature_names = X_processed.columns.tolist()
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_processed, y, test_size=0.2, random_state=42
        )
        
        # Train Random Forest model (more stable than XGBoost)
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        
        model.fit(X_train, y_train)
        
        # Save model and preprocessors
        joblib.dump(model, 'xgboost_model.pkl')
        joblib.dump(scaler, 'scaler.pkl')
        joblib.dump(label_encoders, 'label_encoders.pkl')
        
        model_trained = True
        print("✅ Model trained and saved successfully")
            
    except Exception as e:
        print(f"❌ Failed to initialize model: {str(e)}")
        model_trained = False
    
    yield
    # Shutdown (if needed)

app = FastAPI(
    title="Farm Cast API", 
    description="ML-powered crop yield prediction API",
    lifespan=lifespan
)

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Global variables for model and preprocessors
model = None
scaler = None
label_encoders = {}
feature_names = None
model_trained = False

# Safe conversion functions for JSON serialization
def safe_float(value):
    """Safely convert value to float, handling NaN and inf"""
    if pd.isna(value) or np.isinf(value):
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

def safe_int(value):
    """Safely convert value to int, handling NaN"""
    if pd.isna(value):
        return None
    try:
        return int(value)
    except (ValueError, TypeError):
        return None


class PredictionInput(BaseModel):
    State: str
    Crop: str
    Crop_Year: int
    Season: str
    Area: float  # Area in hectares
    Annual_Rainfall: float
    Fertilizer: float
    Pesticide: float

class TrainingResponse(BaseModel):
    message: str
    rmse: float
    feature_importance: Dict[str, float]
    dataset_info: Dict

class PredictionResponse(BaseModel):
    predicted_yield: float
    confidence_score: float
    optimization_tips: List[str]

def load_and_preprocess_data():
    """Load and preprocess the crop data"""
    try:
        # Try multiple possible paths for the CSV file
        possible_paths = [
            '../crop_yield.csv',  # Parent directory
            'crop_yield.csv',     # Current directory
            os.path.join(os.path.dirname(os.path.dirname(__file__)), 'crop_yield.csv')  # Absolute path
        ]
        
        df = None
        for path in possible_paths:
            try:
                df = pd.read_csv(path)
                print(f"✅ Successfully loaded data from: {path}")
                break
            except FileNotFoundError:
                continue
        
        if df is None:
            raise FileNotFoundError("Could not find crop_yield.csv in any expected location")
        
        # Debug: print original column names
        print(f"Original columns: {df.columns.tolist()}")
        
        # Select and rename columns to match our model structure
        # Original: Crop,Crop_Year,Season,State,Area,Production,Annual_Rainfall,Fertilizer,Pesticide,Yield
        required_columns = ['Crop', 'Crop_Year', 'Season', 'State', 'Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide', 'Yield']
        
        # Check which columns actually exist
        existing_columns = [col for col in required_columns if col in df.columns]
        print(f"Existing required columns: {existing_columns}")
        
        if len(existing_columns) < 8:  # We need at least 8 columns (all except Production)
            raise ValueError(f"Missing required columns. Found: {existing_columns}")
        
        df = df[existing_columns]
        
        # Handle missing values and data cleaning
        print(f"Data shape before cleaning: {df.shape}")
        df = df.dropna()
        
        # Remove outliers (yields that are too extreme)
        Q1 = df['Yield'].quantile(0.25)
        Q3 = df['Yield'].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        df = df[(df['Yield'] >= lower_bound) & (df['Yield'] <= upper_bound)]
        
        print(f"Data shape after cleaning: {df.shape}")
        
        # Separate features and target
        feature_columns = ['Crop', 'Crop_Year', 'Season', 'State', 'Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide']
        X = df[feature_columns]
        y = df['Yield'].values
        
        print(f"Features shape: {X.shape}, Target shape: {y.shape}")
        print(f"Feature columns: {X.columns.tolist()}")
        
        return X, y, df
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading data: {str(e)}")

def preprocess_features(X, fit_transform=True):
    """Preprocess features with scaling and encoding"""
    global scaler, label_encoders, feature_names
    
    X_processed = X.copy()
    
    # Define the exact feature order that should be used consistently
    expected_feature_order = ['Crop', 'Crop_Year', 'Season', 'State', 'Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide']
    
    # Ensure all expected columns are present
    for col in expected_feature_order:
        if col not in X_processed.columns:
            raise ValueError(f"Missing required column: {col}")
    
    # Reorder columns to match expected order
    X_processed = X_processed[expected_feature_order]
    
    if fit_transform:
        # Initialize preprocessors
        scaler = StandardScaler()
        label_encoders = {}
        
        # Encode categorical features
        categorical_features = ['Crop', 'Season', 'State']
        for feature in categorical_features:
            if feature in X_processed.columns:
                label_encoders[feature] = LabelEncoder()
                X_processed[feature] = label_encoders[feature].fit_transform(X_processed[feature])
        
        # Scale numerical features
        numerical_features = ['Crop_Year', 'Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide']
        available_numerical = [f for f in numerical_features if f in X_processed.columns]
        if available_numerical:
            X_processed[available_numerical] = scaler.fit_transform(X_processed[available_numerical])
        
        # Store the feature names in the correct order
        feature_names = X_processed.columns.tolist()
        
    else:
        # Transform using existing preprocessors
        categorical_features = ['Crop', 'Season', 'State']
        for feature in categorical_features:
            if feature in X_processed.columns and feature in label_encoders:
                # Handle unseen categories
                try:
                    X_processed[feature] = label_encoders[feature].transform(X_processed[feature])
                except ValueError as e:
                    # If unseen category, use the most frequent category
                    print(f"Warning: Unseen category in {feature}, using most frequent category")
                    most_frequent = label_encoders[feature].classes_[0]
                    X_processed[feature] = X_processed[feature].fillna(most_frequent)
                    X_processed[feature] = label_encoders[feature].transform(X_processed[feature])
        
        numerical_features = ['Crop_Year', 'Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide']
        available_numerical = [f for f in numerical_features if f in X_processed.columns]
        if available_numerical:
            X_processed[available_numerical] = scaler.transform(X_processed[available_numerical])
        
        # Ensure the columns are in the same order as during training
        if feature_names:
            X_processed = X_processed[feature_names]
    
    return X_processed

def generate_optimization_tips(input_data: PredictionInput, predicted_yield: float) -> List[str]:
    """Generate optimization tips based on input parameters"""
    tips = []
    
    # Rainfall optimization
    if input_data.Annual_Rainfall < 800:
        tips.append("Low rainfall detected. Increase irrigation frequency and consider drip irrigation systems.")
    elif input_data.Annual_Rainfall > 2500:
        tips.append("High rainfall area. Ensure proper drainage to prevent waterlogging and fungal diseases.")
    
    # Fertilizer optimization
    if input_data.Fertilizer < 50:
        tips.append("Consider increasing fertilizer application for better nutrient supply.")
    elif input_data.Fertilizer > 300:
        tips.append("High fertilizer usage detected. Consider soil testing to optimize nutrient application.")
    
    # Pesticide optimization
    if input_data.Pesticide < 10:
        tips.append("Consider integrated pest management to optimize crop protection.")
    elif input_data.Pesticide > 100:
        tips.append("High pesticide usage detected. Consider reducing chemical inputs and using biological controls.")
    
    # Area optimization
    if input_data.Area < 1:
        tips.append("Small cultivation area. Consider intensive farming practices for better yield per hectare.")
    elif input_data.Area > 100:
        tips.append("Large cultivation area. Implement precision agriculture and mechanization for efficiency.")
    
    # Yield-based tips
    if predicted_yield < 1.0:
        tips.append("Predicted yield is below average. Consider soil testing and precision agriculture techniques.")
    elif predicted_yield > 10.0:
        tips.append("Excellent yield potential! Maintain current practices and consider expanding cultivation.")
    
    # Season-specific tips
    season_tips = {
        "Kharif": "Monsoon season crop. Ensure proper drainage and pest management during humid conditions.",
        "Rabi": "Winter season crop. Monitor for frost damage and ensure adequate irrigation.",
        "Whole Year": "Year-round cultivation. Maintain consistent care and monitor seasonal variations.",
        "Summer": "Summer season crop. Ensure adequate water supply and heat protection."
    }
    
    if input_data.Season in season_tips:
        tips.append(season_tips[input_data.Season])
    
    # Crop-specific tips
    crop_tips = {
        "Rice": "Maintain proper water management and monitor for blast disease.",
        "Wheat": "Monitor for rust diseases and ensure proper soil drainage.",
        "Maize": "Ensure adequate nitrogen supply during vegetative growth stage.",
        "Cotton(lint)": "Monitor for bollworm and maintain proper spacing.",
        "Sugarcane": "Ensure adequate water supply and proper harvesting timing.",
        "Arhar/Tur": "Legume crop - ensure proper nodulation for nitrogen fixation.",
        "Gram": "Cool season legume - avoid waterlogging and ensure proper drainage.",
        "Groundnut": "Oil seed crop - ensure calcium availability for pod development."
    }
    
    if input_data.Crop in crop_tips:
        tips.append(crop_tips[input_data.Crop])
    
    return tips if tips else ["Current conditions are well-balanced for good crop yield."]

@app.get("/")
async def root():
    return {"message": "Farm Cast API - ML-powered crop yield prediction"}

@app.post("/train", response_model=TrainingResponse)
async def train_model():
    """Train the XGBoost model"""
    global model, feature_names, model_trained
    
    try:
        # Load and preprocess data
        X, y, df = load_and_preprocess_data()
        X_processed = preprocess_features(X, fit_transform=True)
        feature_names = X_processed.columns.tolist()
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_processed, y, test_size=0.2, random_state=42
        )
        
        # Train Random Forest model (more stable than XGBoost)
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        
        model.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = model.predict(X_test)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        
        # Get feature importance
        feature_importance = dict(zip(feature_names, model.feature_importances_))
        
        # Dataset info
        dataset_info = {
            "total_samples": len(df),
            "features": len(X.columns),
            "target_stats": {
                "mean_yield": float(y.mean()),
                "min_yield": float(y.min()),
                "max_yield": float(y.max()),
                "std_yield": float(y.std())
            },
            "unique_states": len(df['State'].unique()),
            "unique_crops": len(df['Crop'].unique()),
            "year_range": f"{df['Crop_Year'].min()}-{df['Crop_Year'].max()}"
        }
        
        # Save model and preprocessors
        joblib.dump(model, 'xgboost_model.pkl')
        joblib.dump(scaler, 'scaler.pkl')
        joblib.dump(label_encoders, 'label_encoders.pkl')
        
        model_trained = True
        
        return TrainingResponse(
            message="Model trained successfully",
            rmse=float(rmse),
            feature_importance=feature_importance,
            dataset_info=dataset_info
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@app.post("/predict", response_model=PredictionResponse)
async def predict_yield(input_data: PredictionInput):
    """Predict crop yield based on input parameters"""
    global model, scaler, label_encoders, model_trained
    
    if not model_trained:
        # Try to load existing model
        try:
            model = joblib.load('xgboost_model.pkl')
            scaler = joblib.load('scaler.pkl')
            label_encoders = joblib.load('label_encoders.pkl')
            feature_names = ['Crop', 'Crop_Year', 'Season', 'State', 'Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide']
            model_trained = True
        except:
            raise HTTPException(status_code=400, detail="Model not trained. Please train the model first.")
    
    try:
        # Convert input to DataFrame
        input_df = pd.DataFrame([input_data.dict()])
        
        # Preprocess input
        input_processed = preprocess_features(input_df, fit_transform=False)
        
        # Make prediction using individual trees for confidence calculation
        prediction = model.predict(input_processed)[0]
        
        # Calculate confidence using Random Forest prediction intervals
        # Get predictions from all individual trees
        tree_predictions = np.array([tree.predict(input_processed)[0] for tree in model.estimators_])
        
        # Calculate statistics
        mean_prediction = np.mean(tree_predictions)
        std_prediction = np.std(tree_predictions)
        
        # Calculate prediction interval (95% confidence interval)
        confidence_interval = 1.96 * std_prediction  # 95% CI
        
        # Calculate confidence score based on relative uncertainty
        # Lower standard deviation relative to mean = higher confidence
        if mean_prediction > 0:
            relative_uncertainty = std_prediction / mean_prediction
            # Convert to confidence score (0.5 to 0.98 range)
            confidence = max(0.5, min(0.98, 1.0 - (relative_uncertainty * 2)))
        else:
            confidence = 0.5
        
        # Generate optimization tips
        tips = generate_optimization_tips(input_data, prediction)
        
        return PredictionResponse(
            predicted_yield=float(prediction),
            confidence_score=float(confidence),
            optimization_tips=tips
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/feature-importance")
async def get_feature_importance():
    """Get feature importance from the trained model"""
    global model, feature_names, model_trained
    
    if not model_trained:
        try:
            model = joblib.load('xgboost_model.pkl')
            # Recreate feature names based on actual dataset
            feature_names = ['Crop', 'Crop_Year', 'Season', 'State', 'Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide']
            model_trained = True
        except:
            raise HTTPException(status_code=400, detail="Model not trained. Please train the model first.")
    
    try:
        # Get feature importance
        importance_dict = dict(zip(feature_names, model.feature_importances_))
        
        # Sort by importance
        sorted_importance = dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True))
        
        return {
            "feature_importance": sorted_importance,
            "top_features": list(sorted_importance.keys())[:5]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get feature importance: {str(e)}")

@app.get("/model-stats")
async def get_model_stats():
    """Get model statistics and data overview with robust error handling"""
    try:
        print("🔄 Loading data for model stats...")
        X, y, df = load_and_preprocess_data()
        print(f"✅ Data loaded successfully: {len(df)} records")
        
        # Initialize response with safe defaults
        stats = {
            "dataset_size": len(df),
            "features": len(X.columns),
            "target_stats": {},
            "crop_distribution": {},
            "area_distribution": {},
            "feature_correlations": {},
            "year_range": "",
            "yield_by_year": {},
            "scatter_data": []
        }
        
        # Safe target stats calculation
        try:
            stats["target_stats"] = {
                "mean_yield": safe_float(y.mean()),
                "min_yield": safe_float(y.min()),
                "max_yield": safe_float(y.max()),
                "std_yield": safe_float(y.std())
            }
            print("✅ Target stats calculated")
        except Exception as e:
            print(f"⚠️ Error calculating target stats: {e}")
        
        # Safe crop distribution
        try:
            crop_counts = df['Crop'].value_counts()
            stats["crop_distribution"] = {str(k): safe_int(v) for k, v in crop_counts.items()}
            print(f"✅ Crop distribution calculated: {len(stats['crop_distribution'])} crops")
        except Exception as e:
            print(f"⚠️ Error calculating crop distribution: {e}")
        
        # Safe state distribution
        try:
            state_counts = df['State'].value_counts().head(10)
            stats["state_distribution"] = {str(k): safe_int(v) for k, v in state_counts.items()}
            print(f"✅ State distribution calculated: {len(stats['state_distribution'])} states")
        except Exception as e:
            print(f"⚠️ Error calculating state distribution: {e}")
        
        # Safe feature correlations (only numeric columns)
        try:
            # Select only numeric columns for correlation calculation
            numeric_columns = df.select_dtypes(include=[np.number]).columns.tolist()
            if 'Yield' in numeric_columns:
                numeric_df = df[numeric_columns]
                correlations = numeric_df.corr()['Yield'].drop('Yield')
                stats["feature_correlations"] = {str(k): safe_float(v) for k, v in correlations.items() if not pd.isna(v)}
                print(f"✅ Feature correlations calculated: {len(stats['feature_correlations'])} features")
            else:
                stats["feature_correlations"] = {}
                print("⚠️ No numeric yield column found for correlations")
        except Exception as e:
            print(f"⚠️ Error calculating feature correlations: {e}")
            stats["feature_correlations"] = {}
        
        # Safe year range
        try:
            min_year = safe_int(df['Crop_Year'].min())
            max_year = safe_int(df['Crop_Year'].max())
            if min_year and max_year:
                stats["year_range"] = f"{min_year}-{max_year}"
            print(f"✅ Year range calculated: {stats['year_range']}")
        except Exception as e:
            print(f"⚠️ Error calculating year range: {e}")
        
        # Safe yield by year
        try:
            yield_by_year_raw = df.groupby('Crop_Year')['Yield'].mean()
            stats["yield_by_year"] = {str(k): safe_float(v) for k, v in yield_by_year_raw.items() if safe_float(v) is not None}
            print(f"✅ Yield by year calculated: {len(stats['yield_by_year'])} years")
        except Exception as e:
            print(f"⚠️ Error calculating yield by year: {e}")
        
        # Safe scatter data (limit to 100 points for performance)
        try:
            sample_size = min(100, len(df))
            sample_df = df.sample(sample_size, random_state=42)
            
            scatter_data = []
            for _, row in sample_df.iterrows():
                try:
                    rainfall = safe_float(row['Annual_Rainfall'])
                    yield_val = safe_float(row['Yield'])
                    fertilizer = safe_float(row['Fertilizer'])
                    pesticides = safe_float(row['Pesticide'])
                    
                    # Only include if all values are valid
                    if all(v is not None for v in [rainfall, yield_val, fertilizer, pesticides]):
                        scatter_data.append({
                            "rainfall": rainfall,
                            "yield": yield_val,
                            "fertilizer": fertilizer,
                            "pesticides": pesticides
                        })
                except Exception:
                    continue  # Skip invalid rows
            
            stats["scatter_data"] = scatter_data
            print(f"✅ Scatter data calculated: {len(scatter_data)} valid points")
        except Exception as e:
            print(f"⚠️ Error calculating scatter data: {e}")
        
        # Validate JSON serialization
        try:
            json.dumps(stats)
            print("✅ JSON validation passed")
        except Exception as e:
            print(f"❌ JSON validation failed: {e}")
            raise HTTPException(status_code=500, detail=f"Data serialization error: {str(e)}")
        
        print("✅ Model stats response prepared successfully")
        return stats
        
    except Exception as e:
        error_msg = f"Failed to get model stats: {str(e)}"
        print(f"❌ {error_msg}")
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/crop-options")
async def get_crop_options():
    """Get available crop options from the dataset"""
    try:
        X, y, df = load_and_preprocess_data()
        crops = sorted(df['Crop'].unique().tolist())
        return {"crops": crops}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get crop options: {str(e)}")

@app.get("/state-options")
async def get_state_options():
    """Get available state options from the dataset"""
    try:
        X, y, df = load_and_preprocess_data()
        states = sorted(df['State'].unique().tolist())
        return {"states": states}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get state options: {str(e)}")

@app.get("/season-options")
async def get_season_options():
    """Get available season options from the dataset"""
    try:
        _, _, df = load_and_preprocess_data()
        seasons = sorted(df['Season'].unique().tolist())
        return {"seasons": seasons}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get season options: {str(e)}")

@app.get("/area-options")
async def get_area_options():
    """Get available area options from the dataset (alias for state-options)"""
    try:
        _, _, df = load_and_preprocess_data()
        states = sorted(df['State'].unique().tolist())
        return {"areas": states}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get area options: {str(e)}")

class CropSuggestionInput(BaseModel):
    State: str
    Crop_Year: int
    Season: str
    Area: float
    Annual_Rainfall: float
    Fertilizer: float
    Pesticide: float

class ChatInput(BaseModel):
    message: str
    language: str = "en"

@app.post("/suggest-crops")
async def suggest_best_crops(input_data: CropSuggestionInput):
    """Suggest top 3 crops that give the best yield for given conditions"""
    global model, scaler, label_encoders, model_trained
    
    if not model_trained:
        try:
            model = joblib.load('xgboost_model.pkl')
            scaler = joblib.load('scaler.pkl')
            label_encoders = joblib.load('label_encoders.pkl')
            model_trained = True
        except:
            raise HTTPException(status_code=400, detail="Model not trained. Please train the model first.")
    
    try:
        print("🔄 Loading data for crop suggestions...")
        X, y, df = load_and_preprocess_data()
        
        # Get all available crops
        available_crops = df['Crop'].unique().tolist()
        print(f"✅ Found {len(available_crops)} available crops")
        
        crop_predictions = []
        
        for crop in available_crops:
            try:
                # Create input data for this crop
                test_data = pd.DataFrame([{
                    'State': input_data.State,
                    'Crop': crop,
                    'Crop_Year': input_data.Crop_Year,
                    'Season': input_data.Season,
                    'Area': input_data.Area,
                    'Annual_Rainfall': input_data.Annual_Rainfall,
                    'Fertilizer': input_data.Fertilizer,
                    'Pesticide': input_data.Pesticide
                }])
                
                # Preprocess the data
                test_processed = preprocess_features(test_data, fit_transform=False)
                
                # Make prediction
                predicted_yield = model.predict(test_processed)[0]
                
                # Get historical data for this crop-state combination for context
                historical_data = df[(df['Crop'] == crop) & (df['State'] == input_data.State)]
                
                crop_info = {
                    'crop': crop,
                    'predicted_yield': safe_float(predicted_yield),
                    'predicted_yield_tons': safe_float(predicted_yield),  # Already in tons/ha
                    'historical_samples': len(historical_data),
                    'avg_historical_yield': safe_float(historical_data['Yield'].mean()) if len(historical_data) > 0 else None,
                    'avg_historical_yield_tons': safe_float(historical_data['Yield'].mean()) if len(historical_data) > 0 else None
                }
                
                # Only include crops with valid predictions
                if crop_info['predicted_yield'] is not None and crop_info['predicted_yield'] > 0:
                    crop_predictions.append(crop_info)
                    
            except Exception as e:
                print(f"⚠️ Error predicting for crop {crop}: {e}")
                continue
        
        # Sort by predicted yield (descending) and get top 3
        crop_predictions.sort(key=lambda x: x['predicted_yield'] or 0, reverse=True)
        top_3_crops = crop_predictions[:3]
        
        print(f"✅ Generated suggestions for {len(crop_predictions)} crops, returning top 3")
        
        # Add ranking and improvement suggestions
        for i, crop in enumerate(top_3_crops):
            crop['rank'] = i + 1
            crop['yield_category'] = 'Excellent' if crop['predicted_yield'] >= 10.0 else 'Good' if crop['predicted_yield'] >= 5.0 else 'Average'
            
            # Generate crop-specific tips
            crop_tips = {
                "Maize": "High-energy crop, ensure adequate nitrogen during growth stages.",
                "Rice, paddy": "Water-intensive crop, maintain proper irrigation and drainage.",
                "Wheat": "Cool-season crop, monitor for diseases and ensure good soil drainage.",
                "Potatoes": "Tuber crop, maintain consistent soil moisture and temperature.",
                "Soybeans": "Nitrogen-fixing legume, ensure proper nodulation for best results.",
                "Sorghum": "Drought-tolerant grain, suitable for semi-arid conditions.",
                "Cassava": "Root crop, drought-tolerant and suitable for poor soils.",
                "Sweet potatoes": "Nutritious root crop, requires well-drained soil.",
                "Yams": "Tropical root crop, requires warm temperatures and humidity.",
                "Plantains": "Tropical fruit crop, requires consistent moisture and warmth."
            }
            
            crop['growing_tip'] = crop_tips.get(crop['crop'], "Ensure optimal growing conditions for best yield.")
        
        response = {
            'suggested_crops': top_3_crops,
            'total_crops_analyzed': len(crop_predictions),
            'conditions_summary': {
                'state': input_data.State,
                'season': input_data.Season,
                'area': input_data.Area,
                'rainfall': input_data.Annual_Rainfall,
                'fertilizer': input_data.Fertilizer,
                'pesticides': input_data.Pesticide,
                'year': input_data.Crop_Year
            }
        }
        
        return response
        
    except Exception as e:
        error_msg = f"Failed to suggest crops: {str(e)}"
        print(f"❌ {error_msg}")
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/chat")
async def chat_with_assistant(input_data: ChatInput):
    """General-purpose chat endpoint using Gemini API"""
    try:
        message = input_data.message
        language = input_data.language
        
        # Get Gemini API key from environment
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            return {"response": "Sorry, the chatbot is not configured properly. Please set up the Gemini API key."}
        
        # Configure Gemini API
        genai.configure(api_key=api_key)
        
        # Create the model - try different model names
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
        except Exception as model_error:
            print(f"❌ Failed to create gemini-1.5-flash: {model_error}")
            try:
                model = genai.GenerativeModel('gemini-pro')
            except Exception as model_error2:
                print(f"❌ Failed to create gemini-pro: {model_error2}")
                try:
                    model = genai.GenerativeModel('models/gemini-1.5-flash-latest')
                except Exception as model_error3:
                    print(f"❌ Failed to create gemini-1.5-flash-latest: {model_error3}")
                    return {"response": "Sorry, I'm having trouble connecting to the AI service. Please try again later."}
        
        # Create a system prompt based on language
        system_prompts = {
            "en": "You are a helpful AI assistant. You can discuss any topic and provide informative, accurate, and helpful responses. Be conversational and friendly.",
            "es": "Eres un asistente de IA útil. Puedes discutir cualquier tema y proporcionar respuestas informativas, precisas y útiles. Sé conversacional y amigable. Responde en español.",
            "fr": "Vous êtes un assistant IA utile. Vous pouvez discuter de n'importe quel sujet et fournir des réponses informatives, précises et utiles. Soyez conversationnel et amical. Répondez en français.",
            "hi": "आप एक सहायक AI असिस्टेंट हैं। आप किसी भी विषय पर चर्चा कर सकते हैं और जानकारीपूर्ण, सटीक और उपयोगी उत्तर प्रदान कर सकते हैं। बातचीत में मित्रवत रहें। हिंदी में उत्तर दें।",
            "te": "మీరు సహాయకరమైన AI అసిస్టెంట్. మీరు ఏ విషయం గురించి అయినా చర్చించవచ్చు మరియు సమాచారంతో కూడిన, ఖచ్చితమైన మరియు ఉపయోగకరమైన సమాధానాలు అందించవచ్చు. సంభాషణాత్మకంగా మరియు స్నేహపూర్వకంగా ఉండండి. తెలుగులో సమాధానం ఇవ్వండి।",
            "ta": "நீங்கள் ஒரு உதவிகரமான AI உதவியாளர். நீங்கள் எந்த தலைப்பையும் விவாதிக்கலாம் மற்றும் தகவல், துல்லியமான மற்றும் பயனுள்ள பதில்களை வழங்கலாம். உரையாடல் மற்றும் நட்பாக இருங்கள். தமிழில் பதிலளியுங்கள்।",
            "bn": "আপনি একজন সহায়ক AI সহায়ক। আপনি যেকোনো বিষয় নিয়ে আলোচনা করতে পারেন এবং তথ্যপূর্ণ, নির্ভুল এবং সহায়ক উত্তর প্রদান করতে পারেন। কথোপকথনমূলক এবং বন্ধুত্বপূর্ণ হন। বাংলায় উত্তর দিন।"
        }
        
        system_prompt = system_prompts.get(language, system_prompts["en"])
        
        # Create the full prompt - simplified approach
        full_prompt = f"{system_prompt}\n\n{message}"
        
        # Generate response using Gemini
        print(f"🔄 Sending prompt to Gemini: {full_prompt[:100]}...")
        print(f"🔑 Using API key: {api_key[:10]}...{api_key[-4:]}")
        
        response = model.generate_content(full_prompt)
        
        print(f"📥 Gemini response object: {response}")
        print(f"📝 Response text: {response.text if response else 'No response'}")
        
        if response and response.text:
            return {"response": response.text}
        else:
            print("❌ No valid response from Gemini")
            return {"response": "I'm sorry, I couldn't generate a response. Please try again."}
        
    except Exception as e:
        print(f"Chat error: {str(e)}")
        # Fallback response based on language
        fallback_responses = {
            "en": "I'm sorry, I encountered an error. Please try asking your question again.",
            "es": "Lo siento, encontré un error. Por favor, intenta hacer tu pregunta de nuevo.",
            "fr": "Je suis désolé, j'ai rencontré une erreur. Veuillez réessayer votre question.",
            "hi": "क्षमा करें, मुझे एक त्रुटि का सामना करना पड़ा। कृपया अपना प्रश्न फिर से पूछने का प्रयास करें।",
            "te": "క్షమించండి, నాకు ఒక లోపం ఎదురైంది. దయచేసి మీ ప్రశ్నను మళ్లీ అడగడానికి ప్రయత్నించండి.",
            "ta": "மன்னிக்கவும், எனக்கு ஒரு பிழை ஏற்பட்டது. தயவுசெய்து உங்கள் கேள்வியை மீண்டும் கேட்க முயற்சிக்கவும்.",
            "bn": "দুঃখিত, আমি একটি ত্রুটির সম্মুখীন হয়েছি। অনুগ্রহ করে আপনার প্রশ্ন আবার জিজ্ঞাসা করার চেষ্টা করুন।"
        }
        return {"response": fallback_responses.get(language, fallback_responses["en"])}

@app.get("/historical-data/{crop}/{region}")
async def get_historical_data(crop: str, region: str):
    """Get historical yield data for a specific crop and region"""
    try:
        X, y, df = load_and_preprocess_data()
        
        # Filter data for specific crop and region
        # Align to dataset columns: Crop, State, Crop_Year, Yield
        filtered_df = df[(df['Crop'] == crop) & (df['State'] == region)]
        
        if filtered_df.empty:
            return {"error": f"No historical data found for {crop} in {region}"}
        
        # Group by year and get average yield
        historical_data = []
        for year in sorted(filtered_df['Crop_Year'].unique()):
            year_data = filtered_df[filtered_df['Crop_Year'] == year]
            avg_yield = year_data['Yield'].mean()
            
            historical_data.append({
                "year": int(year),
                "yield": safe_float(avg_yield),
                "yield_tons": safe_float(avg_yield),  # Already in tons/ha
                "sample_count": len(year_data)
            })
        
        return {
            "crop": crop,
            "region": region,
            "historical_data": historical_data,
            "total_samples": len(filtered_df),
            "year_range": f"{filtered_df['Crop_Year'].min()}-{filtered_df['Crop_Year'].max()}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get historical data: {str(e)}")

@app.get("/predictions/{crop}/{region}")
async def get_predictions_for_crop_region(crop: str, region: str, start_year: int = 2024, end_year: int = 2030):
    """Get yield predictions for a specific crop and region over a range of years with realistic trends"""
    global model, scaler, label_encoders, model_trained
    
    if not model_trained:
        try:
            model = joblib.load('xgboost_model.pkl')
            scaler = joblib.load('scaler.pkl')
            label_encoders = joblib.load('label_encoders.pkl')
            model_trained = True
        except:
            raise HTTPException(status_code=400, detail="Model not trained. Please train the model first.")
    
    try:
        X, y, df = load_and_preprocess_data()
        
        # Get historical data for this crop-region combination (align columns)
        historical_data = df[(df['State'] == region) & (df['Crop'] == crop)]
        if historical_data.empty:
            raise HTTPException(status_code=404, detail=f"No data found for {crop} in {region}")
        
        # Calculate historical trend
        historical_years = historical_data['Crop_Year'].values
        historical_yields = historical_data['Yield'].values
        
        # Calculate trend slope using linear regression
        if len(historical_years) > 1:
            trend_slope = np.polyfit(historical_years, historical_yields, 1)[0]
        else:
            trend_slope = 0
        
        # Get base environmental conditions
        avg_rainfall = historical_data['Annual_Rainfall'].mean()
        avg_pesticides = historical_data['Pesticide'].mean()
        avg_fertilizer = historical_data['Fertilizer'].mean()
        
        # Get the last historical yield as baseline
        last_year = historical_years.max()
        last_yield = historical_data[historical_data['Crop_Year'] == last_year]['Yield'].mean()
        
        predictions = []
        for year in range(start_year, end_year + 1):
            try:
                # Apply realistic variations to environmental conditions over time
                years_from_last = year - last_year
                
                # Simulate fertilizer usage variation
                fertilizer_variation = avg_fertilizer * (1 + years_from_last * 0.005)  # 0.5% increase per year
                
                # Simulate rainfall variability (slight decrease due to climate change)
                rainfall_variation = avg_rainfall * (1 - years_from_last * 0.001)  # 0.1% decrease per year
                
                # Simulate technology improvement in pesticide efficiency
                pesticide_variation = avg_pesticides * (1 + years_from_last * 0.005)  # 0.5% increase per year
                
                # Create prediction input with variations
                test_data = pd.DataFrame([{
                    'State': region,
                    'Crop': crop,
                    'Crop_Year': year,
                    'Season': 'Kharif',  # Default season
                    'Area': 10.0,  # Default area
                    'Annual_Rainfall': rainfall_variation,
                    'Fertilizer': fertilizer_variation,
                    'Pesticide': pesticide_variation
                }])
                
                # Preprocess and predict
                test_processed = preprocess_features(test_data, fit_transform=False)
                base_prediction = model.predict(test_processed)[0]
                
                # Apply historical trend to the prediction
                trend_adjustment = trend_slope * years_from_last
                predicted_yield = base_prediction + trend_adjustment
                
                # Add some realistic noise/variation
                noise_factor = np.random.normal(0, predicted_yield * 0.02)  # 2% standard deviation
                predicted_yield += noise_factor
                
                # Ensure prediction is positive (tons/ha)
                predicted_yield = max(predicted_yield, 1.0)
                
                predictions.append({
                    "year": year,
                    "predicted_yield": safe_float(predicted_yield),
                    "predicted_yield_tons": safe_float(predicted_yield),  # Already in tons/ha
                    "conditions": {
                        "rainfall": safe_float(rainfall_variation),
                        "pesticides": safe_float(pesticide_variation),
                        "fertilizer": safe_float(fertilizer_variation)
                    }
                })
                
            except Exception as e:
                print(f"Error predicting for year {year}: {e}")
                continue
        
        return {
            "crop": crop,
            "region": region,
            "predictions": predictions,
            "prediction_range": f"{start_year}-{end_year}",
            "historical_trend_slope": safe_float(trend_slope),
            "base_conditions": {
                "rainfall": safe_float(avg_rainfall),
                "pesticides": safe_float(avg_pesticides),
                "fertilizer": safe_float(avg_fertilizer)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get predictions: {str(e)}")

class CustomPredictionInput(BaseModel):
    crop: str
    region: str
    year: int
    rainfall: float
    pesticides: float
    temperature: float

@app.post("/custom-prediction")
async def get_custom_prediction(input_data: CustomPredictionInput):
    """Get prediction for user-specified conditions"""
    global model, scaler, label_encoders, model_trained
    
    if not model_trained:
        try:
            model = joblib.load('xgboost_model.pkl')
            scaler = joblib.load('scaler.pkl')
            label_encoders = joblib.load('label_encoders.pkl')
            model_trained = True
        except:
            raise HTTPException(status_code=400, detail="Model not trained. Please train the model first.")
    
    try:
        # Create prediction input
        test_data = pd.DataFrame([{
            'State': input_data.region,
            'Crop': input_data.crop,
            'Crop_Year': input_data.year,
            'Season': 'Kharif',  # Default season
            'Area': 10.0,  # Default area
            'Annual_Rainfall': input_data.rainfall,
            'Fertilizer': input_data.fertilizer,
            'Pesticide': input_data.pesticides
        }])
        
        # Preprocess and predict
        test_processed = preprocess_features(test_data, fit_transform=False)
        predicted_yield = model.predict(test_processed)[0]
        
        return {
            "crop": input_data.crop,
            "region": input_data.region,
            "year": input_data.year,
            "predicted_yield": safe_float(predicted_yield),
            "predicted_yield_tons": safe_float(predicted_yield / 100),
            "input_conditions": {
                "rainfall": input_data.rainfall,
                "pesticides": input_data.pesticides,
                "temperature": input_data.temperature
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get custom prediction: {str(e)}")

@app.get("/test-gemini")
async def test_gemini():
    """Test endpoint to check if Gemini API is working"""
    try:
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            return {"status": "error", "message": "No API key found"}
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        response = model.generate_content("Say hello in one word")
        
        return {
            "status": "success", 
            "message": "Gemini API is working",
            "response": response.text if response and response.text else "No response"
        }
    except Exception as e:
        return {"status": "error", "message": f"Gemini API test failed: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
