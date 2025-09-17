#!/usr/bin/env python3
"""
Test script to validate the updated ML model with correct dataset structure
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import os

def load_and_test_data():
    """Load and test the crop yield dataset"""
    try:
        # Try to load the dataset
        possible_paths = [
            '../crop_yield.csv',
            'crop_yield.csv',
            os.path.join(os.path.dirname(os.path.dirname(__file__)), 'crop_yield.csv')
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
            raise FileNotFoundError("Could not find crop_yield.csv")
        
        print(f"📊 Dataset shape: {df.shape}")
        print(f"📋 Columns: {df.columns.tolist()}")
        print(f"📈 Data types:\n{df.dtypes}")
        print(f"🔍 First few rows:\n{df.head()}")
        
        # Check for missing values
        missing_values = df.isnull().sum()
        print(f"❌ Missing values:\n{missing_values[missing_values > 0]}")
        
        # Basic statistics
        print(f"📊 Yield statistics:\n{df['Yield'].describe()}")
        print(f"🌾 Unique crops: {df['Crop'].nunique()}")
        print(f"🏛️ Unique states: {df['State'].nunique()}")
        print(f"🗓️ Unique seasons: {df['Season'].nunique()}")
        print(f"📅 Year range: {df['Crop_Year'].min()} - {df['Crop_Year'].max()}")
        
        return df
        
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return None

def test_model_training(df):
    """Test the model training process"""
    try:
        print("\n🔄 Testing model training...")
        
        # Select required columns
        required_columns = ['Crop', 'Crop_Year', 'Season', 'State', 'Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide', 'Yield']
        existing_columns = [col for col in required_columns if col in df.columns]
        
        if len(existing_columns) < 8:
            raise ValueError(f"Missing required columns. Found: {existing_columns}")
        
        df_clean = df[existing_columns].dropna()
        print(f"✅ Clean dataset shape: {df_clean.shape}")
        
        # Remove outliers
        Q1 = df_clean['Yield'].quantile(0.25)
        Q3 = df_clean['Yield'].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        df_clean = df_clean[(df_clean['Yield'] >= lower_bound) & (df_clean['Yield'] <= upper_bound)]
        print(f"✅ After outlier removal: {df_clean.shape}")
        
        # Prepare features and target
        feature_columns = ['Crop', 'Crop_Year', 'Season', 'State', 'Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide']
        X = df_clean[feature_columns]
        y = df_clean['Yield'].values
        
        # Encode categorical features
        X_processed = X.copy()
        label_encoders = {}
        
        categorical_features = ['Crop', 'Season', 'State']
        for feature in categorical_features:
            if feature in X_processed.columns:
                label_encoders[feature] = LabelEncoder()
                X_processed[feature] = label_encoders[feature].fit_transform(X_processed[feature])
        
        # Scale numerical features
        scaler = StandardScaler()
        numerical_features = ['Crop_Year', 'Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide']
        available_numerical = [f for f in numerical_features if f in X_processed.columns]
        if available_numerical:
            X_processed[available_numerical] = scaler.fit_transform(X_processed[available_numerical])
        
        print(f"✅ Processed features shape: {X_processed.shape}")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_processed, y, test_size=0.2, random_state=42
        )
        
        # Train model
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        
        print("🔄 Training model...")
        model.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = model.predict(X_test)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        print(f"✅ Model trained successfully!")
        print(f"📊 RMSE: {rmse:.4f}")
        print(f"📊 R² Score: {r2:.4f}")
        
        # Feature importance
        feature_importance = dict(zip(X_processed.columns, model.feature_importances_))
        sorted_importance = dict(sorted(feature_importance.items(), key=lambda x: x[1], reverse=True))
        
        print(f"🔝 Top 5 most important features:")
        for i, (feature, importance) in enumerate(list(sorted_importance.items())[:5]):
            print(f"  {i+1}. {feature}: {importance:.4f}")
        
        return model, scaler, label_encoders, X_processed.columns.tolist()
        
    except Exception as e:
        print(f"❌ Error training model: {e}")
        return None, None, None, None

def test_prediction(model, scaler, label_encoders, feature_names):
    """Test making a prediction with sample data"""
    try:
        print("\n🔄 Testing prediction...")
        
        # Sample input data
        sample_data = pd.DataFrame([{
            'State': 'Assam',
            'Crop': 'Rice',
            'Crop_Year': 2024,
            'Season': 'Kharif',
            'Area': 10.0,
            'Annual_Rainfall': 1200.0,
            'Fertilizer': 150.0,
            'Pesticide': 25.0
        }])
        
        print(f"📝 Sample input: {sample_data.iloc[0].to_dict()}")
        
        # Process the sample data
        sample_processed = sample_data.copy()
        
        # Encode categorical features
        categorical_features = ['Crop', 'Season', 'State']
        for feature in categorical_features:
            if feature in sample_processed.columns and feature in label_encoders:
                try:
                    sample_processed[feature] = label_encoders[feature].transform(sample_processed[feature])
                except ValueError:
                    # Handle unseen categories
                    print(f"⚠️ Unseen category in {feature}, using most frequent")
                    most_frequent = label_encoders[feature].classes_[0]
                    sample_processed[feature] = sample_processed[feature].fillna(most_frequent)
                    sample_processed[feature] = label_encoders[feature].transform(sample_processed[feature])
        
        # Scale numerical features
        numerical_features = ['Crop_Year', 'Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide']
        available_numerical = [f for f in numerical_features if f in sample_processed.columns]
        if available_numerical:
            sample_processed[available_numerical] = scaler.transform(sample_processed[available_numerical])
        
        # Make prediction
        prediction = model.predict(sample_processed)[0]
        
        print(f"✅ Predicted yield: {prediction:.2f} tons/ha")
        
        # Classify yield
        if prediction >= 10.0:
            category = "Excellent"
        elif prediction >= 5.0:
            category = "Good"
        else:
            category = "Below Average"
        
        print(f"📊 Yield category: {category}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error making prediction: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Starting FarmCast ML Model Test")
    print("=" * 50)
    
    # Load and examine data
    df = load_and_test_data()
    if df is None:
        return
    
    # Test model training
    model, scaler, label_encoders, feature_names = test_model_training(df)
    if model is None:
        return
    
    # Test prediction
    success = test_prediction(model, scaler, label_encoders, feature_names)
    
    if success:
        print("\n✅ All tests passed! The model is working correctly.")
        print("🎉 Ready to deploy the updated FarmCast system!")
    else:
        print("\n❌ Some tests failed. Please check the implementation.")

if __name__ == "__main__":
    main()
