#!/usr/bin/env python3
"""
Simple test script to verify backend functionality
"""
import sys
import os

def test_imports():
    """Test if all required packages can be imported"""
    print("Testing imports...")
    
    try:
        import fastapi
        print("✅ FastAPI imported successfully")
    except ImportError as e:
        print(f"❌ FastAPI import failed: {e}")
        return False
    
    try:
        import pandas as pd
        print("✅ Pandas imported successfully")
    except ImportError as e:
        print(f"❌ Pandas import failed: {e}")
        return False
    
    try:
        from sklearn.ensemble import RandomForestRegressor
        print("✅ Scikit-learn imported successfully")
    except ImportError as e:
        print(f"❌ Scikit-learn import failed: {e}")
        return False
    
    return True

def test_data_file():
    """Test if data file exists"""
    print("\nTesting data file...")
    
    possible_paths = [
        '../crop_yield.csv',
        'crop_yield.csv',
        os.path.join(os.path.dirname(os.path.dirname(__file__)), 'crop_yield.csv')
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            print(f"✅ Found data file at: {path}")
            return True
    
    print("❌ crop_yield.csv not found in any expected location")
    return False

def test_main_import():
    """Test if main.py can be imported"""
    print("\nTesting main.py import...")
    
    try:
        sys.path.insert(0, os.path.dirname(__file__))
        import main
        print("✅ main.py imported successfully")
        return True
    except Exception as e:
        print(f"❌ main.py import failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Backend Test Script")
    print("=" * 40)
    
    all_tests_passed = True
    
    # Run tests
    all_tests_passed &= test_imports()
    all_tests_passed &= test_data_file()
    all_tests_passed &= test_main_import()
    
    print("\n" + "=" * 40)
    if all_tests_passed:
        print("🎉 All tests passed! Backend should work.")
        print("\nTo start the server:")
        print("1. cd backend")
        print("2. python main.py")
    else:
        print("❌ Some tests failed. Please fix the issues above.")
        print("\nTo fix missing dependencies:")
        print("pip install fastapi uvicorn pandas scikit-learn numpy joblib python-multipart pydantic python-dotenv")
