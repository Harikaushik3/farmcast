"""
Historical insights and seasonal analysis service
Provides crop pattern analysis, yield trends, and seasonal recommendations
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging
from .location_service import LocationData
from .crop_intelligence import HistoricalPattern

logger = logging.getLogger(__name__)

@dataclass
class SeasonalInsight:
    season: str
    recommended_crops: List[str]
    average_yield: Dict[str, float]
    success_rate: Dict[str, float]
    risk_factors: List[str]
    optimal_planting_window: Tuple[int, int]  # month range

@dataclass
class YieldTrend:
    crop: str
    years: List[int]
    yields: List[float]
    trend_direction: str  # "increasing", "decreasing", "stable"
    trend_percentage: float
    prediction_next_year: float

@dataclass
class ClimatePattern:
    location: str
    temperature_trend: Dict[str, float]  # seasonal averages
    rainfall_pattern: Dict[str, float]   # seasonal totals
    extreme_events: List[Dict]           # droughts, floods, etc.
    climate_zone_shift: Optional[str]    # changing climate zone

class HistoricalService:
    def __init__(self):
        self.historical_data = self._load_historical_data()
        self.seasonal_patterns = self._initialize_seasonal_patterns()
        self.climate_data = self._initialize_climate_data()
        
    def _load_historical_data(self) -> pd.DataFrame:
        """Load historical crop data - in production, this would come from databases"""
        try:
            # Try to load existing crop yield data
            df = pd.read_csv("crop_yield.csv")
            return df
        except FileNotFoundError:
            # Create synthetic historical data for demonstration
            logger.warning("Historical data file not found, using synthetic data")
            return self._create_synthetic_historical_data()

    def _create_synthetic_historical_data(self) -> pd.DataFrame:
        """Create synthetic historical data for demonstration"""
        np.random.seed(42)
        
        states = ["Punjab", "Haryana", "Uttar Pradesh", "Maharashtra", "Karnataka", 
                 "Andhra Pradesh", "Tamil Nadu", "West Bengal", "Bihar", "Rajasthan"]
        crops = ["Rice", "Wheat", "Maize", "Cotton", "Sugarcane", "Soybean"]
        seasons = ["Kharif", "Rabi"]
        years = list(range(2015, 2024))
        
        data = []
        for year in years:
            for state in states:
                for crop in crops:
                    for season in seasons:
                        # Skip invalid combinations
                        if season == "Rabi" and crop in ["Cotton", "Sugarcane"]:
                            continue
                        if season == "Kharif" and crop == "Wheat":
                            continue
                            
                        # Generate realistic yield data with trends
                        base_yield = {
                            "Rice": 3500, "Wheat": 3200, "Maize": 5000,
                            "Cotton": 1800, "Sugarcane": 65000, "Soybean": 1500
                        }
                        
                        # Add year trend (some crops improving, others declining)
                        year_factor = 1 + (year - 2015) * 0.02 if crop in ["Rice", "Wheat"] else 1
                        
                        # Add state factor
                        state_factor = {
                            "Punjab": 1.2, "Haryana": 1.15, "Uttar Pradesh": 1.0,
                            "Maharashtra": 0.95, "Karnataka": 0.9, "Andhra Pradesh": 1.05,
                            "Tamil Nadu": 1.1, "West Bengal": 1.0, "Bihar": 0.85, "Rajasthan": 0.8
                        }.get(state, 1.0)
                        
                        # Add random variation
                        random_factor = np.random.normal(1.0, 0.15)
                        
                        yield_value = base_yield[crop] * year_factor * state_factor * random_factor
                        yield_value = max(0, yield_value)  # Ensure non-negative
                        
                        data.append({
                            "Year": year,
                            "State": state,
                            "Crop": crop,
                            "Season": season,
                            "Yield": yield_value,
                            "Area": np.random.uniform(1000, 10000),  # hectares
                            "Production": yield_value * np.random.uniform(1000, 10000)
                        })
        
        return pd.DataFrame(data)

    def _initialize_seasonal_patterns(self) -> Dict:
        """Initialize seasonal crop patterns for different regions"""
        return {
            "northern_plains": {
                "Kharif": {
                    "crops": ["Rice", "Maize", "Cotton", "Sugarcane"],
                    "planting": (6, 8),  # June-August
                    "harvesting": (10, 12),
                    "rainfall_dependency": 0.7
                },
                "Rabi": {
                    "crops": ["Wheat", "Barley", "Mustard", "Gram"],
                    "planting": (11, 1),  # Nov-Jan
                    "harvesting": (3, 5),
                    "rainfall_dependency": 0.3
                }
            },
            "western_region": {
                "Kharif": {
                    "crops": ["Cotton", "Sugarcane", "Soybean", "Maize"],
                    "planting": (6, 7),
                    "harvesting": (10, 11),
                    "rainfall_dependency": 0.8
                },
                "Rabi": {
                    "crops": ["Wheat", "Gram", "Jowar"],
                    "planting": (11, 12),
                    "harvesting": (3, 4),
                    "rainfall_dependency": 0.2
                }
            },
            "southern_region": {
                "Kharif": {
                    "crops": ["Rice", "Maize", "Cotton", "Sugarcane"],
                    "planting": (6, 8),
                    "harvesting": (11, 1),
                    "rainfall_dependency": 0.6
                },
                "Rabi": {
                    "crops": ["Rice", "Maize", "Groundnut"],
                    "planting": (12, 2),
                    "harvesting": (4, 6),
                    "rainfall_dependency": 0.4
                }
            }
        }

    def _initialize_climate_data(self) -> Dict:
        """Initialize climate trend data"""
        return {
            "temperature_trends": {
                "northern_plains": {"annual_increase": 0.8, "summer_stress": True},
                "western_region": {"annual_increase": 1.2, "summer_stress": True},
                "southern_region": {"annual_increase": 0.6, "summer_stress": False}
            },
            "rainfall_trends": {
                "northern_plains": {"monsoon_shift": -5, "winter_rain_increase": 10},
                "western_region": {"monsoon_variability": 25, "drought_frequency": 0.3},
                "southern_region": {"monsoon_reliability": 0.8, "cyclone_risk": 0.2}
            }
        }

    def get_regional_classification(self, state: str) -> str:
        """Classify state into regional pattern"""
        regional_mapping = {
            "northern_plains": ["Punjab", "Haryana", "Uttar Pradesh", "Bihar", "West Bengal"],
            "western_region": ["Rajasthan", "Gujarat", "Maharashtra", "Madhya Pradesh"],
            "southern_region": ["Karnataka", "Andhra Pradesh", "Telangana", "Tamil Nadu", "Kerala"]
        }
        
        for region, states in regional_mapping.items():
            if state in states:
                return region
        return "northern_plains"  # Default

    def analyze_historical_patterns(self, location: LocationData, 
                                  years_back: int = 5) -> List[HistoricalPattern]:
        """Analyze historical crop patterns for a location"""
        patterns = []
        
        try:
            # Filter data for the state and recent years
            current_year = datetime.now().year
            start_year = current_year - years_back
            
            state_data = self.historical_data[
                (self.historical_data['State'] == location.state) &
                (self.historical_data['Year'] >= start_year)
            ]
            
            if state_data.empty:
                logger.warning(f"No historical data found for {location.state}")
                return self._get_default_patterns(location.state)
            
            # Group by crop and analyze patterns
            for crop in state_data['Crop'].unique():
                crop_data = state_data[state_data['Crop'] == crop]
                
                # Calculate average yield and success metrics
                avg_yield = crop_data['Yield'].mean()
                yield_std = crop_data['Yield'].std()
                success_rate = len(crop_data[crop_data['Yield'] > avg_yield * 0.8]) / len(crop_data)
                
                # Analyze weather correlation (simplified)
                weather_conditions = self._estimate_weather_conditions(crop_data)
                
                for _, row in crop_data.iterrows():
                    pattern = HistoricalPattern(
                        crop=crop,
                        year=int(row['Year']),
                        yield_per_hectare=row['Yield'],
                        profit_margin=self._estimate_profit_margin(crop, row['Yield'], avg_yield),
                        weather_conditions=weather_conditions,
                        success_rate=success_rate
                    )
                    patterns.append(pattern)
            
        except Exception as e:
            logger.error(f"Error analyzing historical patterns: {e}")
            return self._get_default_patterns(location.state)
        
        return patterns

    def get_seasonal_insights(self, location: LocationData) -> List[SeasonalInsight]:
        """Get seasonal insights and recommendations"""
        region = self.get_regional_classification(location.state)
        regional_patterns = self.seasonal_patterns.get(region, self.seasonal_patterns["northern_plains"])
        
        insights = []
        
        for season, pattern_data in regional_patterns.items():
            # Analyze historical performance for this season
            season_data = self.historical_data[
                (self.historical_data['State'] == location.state) &
                (self.historical_data['Season'] == season)
            ]
            
            if not season_data.empty:
                # Calculate average yields and success rates
                avg_yields = {}
                success_rates = {}
                
                for crop in pattern_data['crops']:
                    crop_data = season_data[season_data['Crop'] == crop]
                    if not crop_data.empty:
                        avg_yields[crop] = crop_data['Yield'].mean()
                        # Success rate based on yield consistency
                        threshold = avg_yields[crop] * 0.7
                        success_rates[crop] = len(crop_data[crop_data['Yield'] >= threshold]) / len(crop_data)
                
                # Identify risk factors
                risk_factors = self._identify_seasonal_risks(season, region, location.state)
                
                insight = SeasonalInsight(
                    season=season,
                    recommended_crops=sorted(avg_yields.keys(), key=lambda x: avg_yields.get(x, 0), reverse=True)[:3],
                    average_yield=avg_yields,
                    success_rate=success_rates,
                    risk_factors=risk_factors,
                    optimal_planting_window=pattern_data['planting']
                )
                insights.append(insight)
        
        return insights

    def analyze_yield_trends(self, location: LocationData, 
                           crops: List[str] = None) -> List[YieldTrend]:
        """Analyze yield trends over time"""
        trends = []
        
        try:
            state_data = self.historical_data[self.historical_data['State'] == location.state]
            
            if crops is None:
                crops = state_data['Crop'].unique()
            
            for crop in crops:
                crop_data = state_data[state_data['Crop'] == crop]
                
                if len(crop_data) < 3:  # Need at least 3 years of data
                    continue
                
                # Group by year and calculate average yield
                yearly_yields = crop_data.groupby('Year')['Yield'].mean().sort_index()
                
                if len(yearly_yields) < 3:
                    continue
                
                years = yearly_yields.index.tolist()
                yields = yearly_yields.values.tolist()
                
                # Calculate trend
                trend_direction, trend_percentage = self._calculate_trend(years, yields)
                
                # Predict next year yield using simple linear regression
                prediction = self._predict_next_year_yield(years, yields)
                
                trend = YieldTrend(
                    crop=crop,
                    years=years,
                    yields=yields,
                    trend_direction=trend_direction,
                    trend_percentage=trend_percentage,
                    prediction_next_year=prediction
                )
                trends.append(trend)
                
        except Exception as e:
            logger.error(f"Error analyzing yield trends: {e}")
        
        return trends

    def get_climate_patterns(self, location: LocationData) -> ClimatePattern:
        """Analyze climate patterns and trends"""
        region = self.get_regional_classification(location.state)
        
        # Get climate trend data
        temp_trends = self.climate_data["temperature_trends"].get(region, {})
        rainfall_trends = self.climate_data["rainfall_trends"].get(region, {})
        
        # Seasonal temperature averages (simplified)
        temperature_trend = {
            "winter": 18.0 + temp_trends.get("annual_increase", 0) * 5,
            "summer": 35.0 + temp_trends.get("annual_increase", 0) * 5,
            "monsoon": 28.0 + temp_trends.get("annual_increase", 0) * 5,
            "post_monsoon": 25.0 + temp_trends.get("annual_increase", 0) * 5
        }
        
        # Seasonal rainfall patterns (mm)
        rainfall_pattern = {
            "winter": 50 + rainfall_trends.get("winter_rain_increase", 0),
            "summer": 100,
            "monsoon": 800 + rainfall_trends.get("monsoon_shift", 0),
            "post_monsoon": 200
        }
        
        # Identify extreme events
        extreme_events = []
        if rainfall_trends.get("drought_frequency", 0) > 0.2:
            extreme_events.append({
                "type": "drought",
                "frequency": rainfall_trends["drought_frequency"],
                "impact": "high"
            })
        
        if rainfall_trends.get("cyclone_risk", 0) > 0.1:
            extreme_events.append({
                "type": "cyclone",
                "frequency": rainfall_trends["cyclone_risk"],
                "impact": "very_high"
            })
        
        # Climate zone shift analysis
        climate_zone_shift = None
        if temp_trends.get("annual_increase", 0) > 1.0:
            climate_zone_shift = "warming_trend"
        
        return ClimatePattern(
            location=f"{location.district}, {location.state}",
            temperature_trend=temperature_trend,
            rainfall_pattern=rainfall_pattern,
            extreme_events=extreme_events,
            climate_zone_shift=climate_zone_shift
        )

    def _estimate_weather_conditions(self, crop_data: pd.DataFrame) -> Dict:
        """Estimate weather conditions from yield data"""
        # Simplified weather estimation based on yield patterns
        yield_cv = crop_data['Yield'].std() / crop_data['Yield'].mean()
        
        return {
            "rainfall_variability": "high" if yield_cv > 0.3 else "moderate",
            "temperature_stress": "moderate",
            "extreme_events": "low" if yield_cv < 0.2 else "moderate"
        }

    def _estimate_profit_margin(self, crop: str, yield_value: float, avg_yield: float) -> float:
        """Estimate profit margin based on yield performance"""
        base_margins = {
            "Rice": 25, "Wheat": 30, "Maize": 35, "Cotton": 40,
            "Sugarcane": 45, "Soybean": 50
        }
        
        base_margin = base_margins.get(crop, 30)
        yield_factor = yield_value / avg_yield if avg_yield > 0 else 1
        
        return base_margin * yield_factor

    def _identify_seasonal_risks(self, season: str, region: str, state: str) -> List[str]:
        """Identify seasonal risk factors"""
        risks = []
        
        # Season-specific risks
        if season == "Kharif":
            risks.extend(["Monsoon variability", "Flood risk", "Pest pressure"])
        elif season == "Rabi":
            risks.extend(["Winter fog", "Late frost", "Water scarcity"])
        
        # Region-specific risks
        if region == "western_region":
            risks.append("Drought stress")
        elif region == "southern_region":
            risks.append("Cyclone damage")
        
        # State-specific risks
        state_risks = {
            "Punjab": ["Water table depletion"],
            "Maharashtra": ["Erratic rainfall"],
            "Karnataka": ["Groundwater depletion"],
            "West Bengal": ["Cyclone risk"]
        }
        
        if state in state_risks:
            risks.extend(state_risks[state])
        
        return list(set(risks))  # Remove duplicates

    def _calculate_trend(self, years: List[int], yields: List[float]) -> Tuple[str, float]:
        """Calculate yield trend direction and percentage"""
        if len(years) < 2:
            return "stable", 0.0
        
        # Simple linear regression
        n = len(years)
        sum_x = sum(years)
        sum_y = sum(yields)
        sum_xy = sum(x * y for x, y in zip(years, yields))
        sum_x2 = sum(x * x for x in years)
        
        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x)
        
        # Calculate percentage change per year
        avg_yield = sum_y / n
        percentage_change = (slope / avg_yield) * 100 if avg_yield > 0 else 0
        
        if abs(percentage_change) < 1:
            return "stable", percentage_change
        elif percentage_change > 0:
            return "increasing", percentage_change
        else:
            return "decreasing", percentage_change

    def _predict_next_year_yield(self, years: List[int], yields: List[float]) -> float:
        """Predict next year's yield using linear regression"""
        if len(years) < 2:
            return yields[-1] if yields else 0
        
        # Simple linear regression
        n = len(years)
        sum_x = sum(years)
        sum_y = sum(yields)
        sum_xy = sum(x * y for x, y in zip(years, yields))
        sum_x2 = sum(x * x for x in years)
        
        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x)
        intercept = (sum_y - slope * sum_x) / n
        
        next_year = max(years) + 1
        prediction = slope * next_year + intercept
        
        return max(0, prediction)  # Ensure non-negative

    def _get_default_patterns(self, state: str) -> List[HistoricalPattern]:
        """Get default historical patterns when no data is available"""
        default_crops = ["Rice", "Wheat", "Maize"]
        patterns = []
        
        for i, crop in enumerate(default_crops):
            pattern = HistoricalPattern(
                crop=crop,
                year=2023,
                yield_per_hectare=3000 + i * 500,
                profit_margin=30 + i * 5,
                weather_conditions={"rainfall_variability": "moderate"},
                success_rate=0.7 + i * 0.1
            )
            patterns.append(pattern)
        
        return patterns

# Global instance
historical_service = HistoricalService()
