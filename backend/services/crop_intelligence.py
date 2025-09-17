"""
Crop Intelligence Service
Handles crop recommendations, yield predictions, and sustainability scoring
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import joblib
import logging
from .location_service import LocationData, WeatherData, SoilData

logger = logging.getLogger(__name__)

@dataclass
class CropRecommendation:
    crop_name: str
    expected_yield: float  # kg/hectare
    profit_margin: float   # percentage
    sustainability_score: float  # 0-100 scale
    water_requirement: float  # mm/season
    growth_duration: int  # days
    best_planting_time: str
    risk_factors: List[str]
    care_instructions: List[str]

@dataclass
class HistoricalPattern:
    crop: str
    year: int
    yield_per_hectare: float
    profit_margin: float
    weather_conditions: Dict
    success_rate: float

class CropIntelligenceService:
    def __init__(self):
        self.crop_database = self._initialize_crop_database()
        self.climatic_suitability = self._initialize_climatic_suitability()
        self.seasonal_calendar = self._initialize_seasonal_calendar()
        
    def _initialize_crop_database(self) -> Dict:
        """Initialize comprehensive crop database with Indian crops"""
        return {
            "Rice": {
                "water_requirement": 1200,  # mm/season
                "growth_duration": 120,     # days
                "optimal_temp": (20, 35),   # min, max celsius
                "optimal_ph": (5.5, 7.0),
                "optimal_rainfall": (1000, 2000),
                "profit_margin_base": 35,
                "yield_potential": 4500,    # kg/hectare
                "seasons": ["Kharif", "Rabi"],
                "soil_types": ["clay", "loam"],
                "sustainability_factors": {
                    "water_efficiency": 0.6,
                    "soil_health_impact": 0.7,
                    "carbon_footprint": 0.5
                }
            },
            "Wheat": {
                "water_requirement": 450,
                "growth_duration": 110,
                "optimal_temp": (15, 25),
                "optimal_ph": (6.0, 7.5),
                "optimal_rainfall": (300, 800),
                "profit_margin_base": 40,
                "yield_potential": 3200,
                "seasons": ["Rabi"],
                "soil_types": ["loam", "clay"],
                "sustainability_factors": {
                    "water_efficiency": 0.8,
                    "soil_health_impact": 0.8,
                    "carbon_footprint": 0.7
                }
            },
            "Maize": {
                "water_requirement": 500,
                "growth_duration": 90,
                "optimal_temp": (21, 30),
                "optimal_ph": (5.8, 7.0),
                "optimal_rainfall": (500, 1200),
                "profit_margin_base": 45,
                "yield_potential": 5500,
                "seasons": ["Kharif", "Rabi"],
                "soil_types": ["loam", "sandy_loam"],
                "sustainability_factors": {
                    "water_efficiency": 0.7,
                    "soil_health_impact": 0.6,
                    "carbon_footprint": 0.6
                }
            },
            "Cotton": {
                "water_requirement": 700,
                "growth_duration": 180,
                "optimal_temp": (21, 30),
                "optimal_ph": (5.8, 8.0),
                "optimal_rainfall": (500, 1000),
                "profit_margin_base": 50,
                "yield_potential": 2200,
                "seasons": ["Kharif"],
                "soil_types": ["clay", "loam"],
                "sustainability_factors": {
                    "water_efficiency": 0.5,
                    "soil_health_impact": 0.4,
                    "carbon_footprint": 0.3
                }
            },
            "Sugarcane": {
                "water_requirement": 1800,
                "growth_duration": 365,
                "optimal_temp": (20, 30),
                "optimal_ph": (6.0, 7.5),
                "optimal_rainfall": (1000, 1500),
                "profit_margin_base": 60,
                "yield_potential": 70000,
                "seasons": ["Annual"],
                "soil_types": ["loam", "clay"],
                "sustainability_factors": {
                    "water_efficiency": 0.4,
                    "soil_health_impact": 0.5,
                    "carbon_footprint": 0.4
                }
            },
            "Soybean": {
                "water_requirement": 450,
                "growth_duration": 100,
                "optimal_temp": (20, 30),
                "optimal_ph": (6.0, 7.0),
                "optimal_rainfall": (400, 700),
                "profit_margin_base": 55,
                "yield_potential": 1800,
                "seasons": ["Kharif"],
                "soil_types": ["loam", "sandy_loam"],
                "sustainability_factors": {
                    "water_efficiency": 0.8,
                    "soil_health_impact": 0.9,  # Nitrogen fixing
                    "carbon_footprint": 0.8
                }
            },
            "Tomato": {
                "water_requirement": 400,
                "growth_duration": 75,
                "optimal_temp": (18, 29),
                "optimal_ph": (6.0, 6.8),
                "optimal_rainfall": (300, 650),
                "profit_margin_base": 70,
                "yield_potential": 25000,
                "seasons": ["Rabi", "Summer"],
                "soil_types": ["loam", "sandy_loam"],
                "sustainability_factors": {
                    "water_efficiency": 0.7,
                    "soil_health_impact": 0.6,
                    "carbon_footprint": 0.7
                }
            },
            "Onion": {
                "water_requirement": 350,
                "growth_duration": 110,
                "optimal_temp": (13, 24),
                "optimal_ph": (6.0, 7.0),
                "optimal_rainfall": (300, 600),
                "profit_margin_base": 65,
                "yield_potential": 20000,
                "seasons": ["Rabi"],
                "soil_types": ["loam", "sandy_loam"],
                "sustainability_factors": {
                    "water_efficiency": 0.8,
                    "soil_health_impact": 0.7,
                    "carbon_footprint": 0.8
                }
            }
        }

    def _initialize_climatic_suitability(self) -> Dict:
        """Map crops to climatic zones"""
        return {
            "arid": ["Wheat", "Maize", "Cotton", "Onion"],
            "semi_arid": ["Cotton", "Soybean", "Maize", "Sugarcane"],
            "tropical_wet": ["Rice", "Sugarcane", "Coconut", "Banana"],
            "subtropical": ["Wheat", "Rice", "Maize", "Tomato"],
            "humid_subtropical": ["Rice", "Jute", "Tea", "Maize"],
            "tropical_monsoon": ["Rice", "Maize", "Cotton", "Sugarcane"]
        }

    def _initialize_seasonal_calendar(self) -> Dict:
        """Seasonal planting calendar for India"""
        return {
            "Kharif": {
                "planting_months": [6, 7, 8],  # June-August
                "harvesting_months": [10, 11, 12],  # Oct-Dec
                "crops": ["Rice", "Maize", "Cotton", "Soybean"]
            },
            "Rabi": {
                "planting_months": [11, 12, 1],  # Nov-Jan
                "harvesting_months": [3, 4, 5],  # Mar-May
                "crops": ["Wheat", "Tomato", "Onion", "Maize"]
            },
            "Summer": {
                "planting_months": [3, 4, 5],  # Mar-May
                "harvesting_months": [6, 7, 8],  # Jun-Aug
                "crops": ["Tomato", "Cucumber", "Watermelon"]
            }
        }

    def calculate_crop_suitability(self, crop: str, location: LocationData, 
                                 weather: WeatherData, soil: SoilData, 
                                 climatic_zone: str) -> float:
        """Calculate suitability score for a crop (0-100)"""
        if crop not in self.crop_database:
            return 0.0
            
        crop_data = self.crop_database[crop]
        score = 0.0
        
        # Temperature suitability (25% weight)
        temp_min, temp_max = crop_data["optimal_temp"]
        if temp_min <= weather.temperature <= temp_max:
            score += 25
        else:
            temp_penalty = min(abs(weather.temperature - temp_min), 
                             abs(weather.temperature - temp_max))
            score += max(0, 25 - temp_penalty * 2)
        
        # pH suitability (20% weight)
        ph_min, ph_max = crop_data["optimal_ph"]
        if ph_min <= soil.ph <= ph_max:
            score += 20
        else:
            ph_penalty = min(abs(soil.ph - ph_min), abs(soil.ph - ph_max))
            score += max(0, 20 - ph_penalty * 10)
        
        # Climatic zone suitability (20% weight)
        if crop in self.climatic_suitability.get(climatic_zone, []):
            score += 20
        else:
            score += 10  # Partial score for adaptable crops
        
        # Soil type suitability (15% weight)
        # Simplified soil type classification based on clay content
        if soil.clay_content > 35:
            soil_type = "clay"
        elif soil.sand_content > 60:
            soil_type = "sandy_loam"
        else:
            soil_type = "loam"
            
        if soil_type in crop_data["soil_types"]:
            score += 15
        else:
            score += 7
        
        # Nutrient availability (20% weight)
        nutrient_score = 0
        if soil.nitrogen > 200: nutrient_score += 7
        if soil.phosphorus > 20: nutrient_score += 7
        if soil.potassium > 150: nutrient_score += 6
        score += nutrient_score
        
        return min(100, score)

    def calculate_expected_yield(self, crop: str, suitability_score: float, 
                               weather_forecast: List[WeatherData]) -> float:
        """Calculate expected yield based on conditions"""
        if crop not in self.crop_database:
            return 0.0
            
        base_yield = self.crop_database[crop]["yield_potential"]
        
        # Adjust yield based on suitability
        yield_multiplier = suitability_score / 100
        
        # Weather impact on yield
        if weather_forecast:
            avg_temp = np.mean([w.temperature for w in weather_forecast])
            total_rainfall = sum([w.rainfall for w in weather_forecast])
            
            # Temperature stress factor
            optimal_temp = np.mean(self.crop_database[crop]["optimal_temp"])
            temp_stress = 1 - min(0.3, abs(avg_temp - optimal_temp) / optimal_temp)
            
            # Rainfall adequacy factor
            optimal_rainfall = np.mean(self.crop_database[crop]["optimal_rainfall"])
            rainfall_factor = min(1.0, total_rainfall / optimal_rainfall)
            
            yield_multiplier *= temp_stress * rainfall_factor
        
        return base_yield * yield_multiplier

    def calculate_profit_margin(self, crop: str, expected_yield: float, 
                              location: LocationData) -> float:
        """Calculate profit margin percentage"""
        if crop not in self.crop_database:
            return 0.0
            
        base_margin = self.crop_database[crop]["profit_margin_base"]
        
        # Adjust based on yield efficiency
        yield_potential = self.crop_database[crop]["yield_potential"]
        yield_efficiency = expected_yield / yield_potential
        
        # Market factors (simplified)
        market_multiplier = 1.0
        if location.state in ["Punjab", "Haryana", "Uttar Pradesh"]:
            market_multiplier = 1.1  # Better market access
        elif location.state in ["Rajasthan", "Madhya Pradesh"]:
            market_multiplier = 0.95  # Moderate market access
        
        return base_margin * yield_efficiency * market_multiplier

    def calculate_sustainability_score(self, crop: str, soil: SoilData, 
                                     water_availability: float) -> float:
        """Calculate sustainability score (0-100)"""
        if crop not in self.crop_database:
            return 0.0
            
        crop_data = self.crop_database[crop]
        sustainability = crop_data["sustainability_factors"]
        
        # Water efficiency score
        water_req = crop_data["water_requirement"]
        water_efficiency = min(1.0, water_availability / water_req) * sustainability["water_efficiency"]
        
        # Soil health impact
        soil_health = sustainability["soil_health_impact"]
        if soil.organic_carbon > 1.5:  # Good organic matter
            soil_health *= 1.2
        elif soil.organic_carbon < 0.8:  # Poor organic matter
            soil_health *= 0.8
        
        # Carbon footprint (inverse scoring)
        carbon_score = sustainability["carbon_footprint"]
        
        # Combined sustainability score
        total_score = (water_efficiency * 40 + soil_health * 35 + carbon_score * 25)
        return min(100, total_score * 100)

    def get_crop_recommendations(self, location: LocationData, weather: WeatherData, 
                               soil: SoilData, climatic_zone: str,
                               weather_forecast: List[WeatherData],
                               season: str = None) -> List[CropRecommendation]:
        """Get top 3 crop recommendations"""
        recommendations = []
        
        # Determine current season if not provided
        if not season:
            current_month = datetime.now().month
            if current_month in [6, 7, 8, 9]:
                season = "Kharif"
            elif current_month in [11, 12, 1, 2]:
                season = "Rabi"
            else:
                season = "Summer"
        
        # Get suitable crops for the season
        seasonal_crops = self.seasonal_calendar.get(season, {}).get("crops", [])
        suitable_crops = list(set(seasonal_crops) & set(self.crop_database.keys()))
        
        for crop in suitable_crops:
            suitability = self.calculate_crop_suitability(
                crop, location, weather, soil, climatic_zone
            )
            
            if suitability < 30:  # Skip unsuitable crops
                continue
                
            expected_yield = self.calculate_expected_yield(
                crop, suitability, weather_forecast
            )
            
            profit_margin = self.calculate_profit_margin(
                crop, expected_yield, location
            )
            
            sustainability_score = self.calculate_sustainability_score(
                crop, soil, weather.rainfall * 30  # Approximate monthly to seasonal
            )
            
            # Generate care instructions and risk factors
            care_instructions = self._get_care_instructions(crop, soil, weather)
            risk_factors = self._get_risk_factors(crop, weather, soil)
            
            recommendation = CropRecommendation(
                crop_name=crop,
                expected_yield=expected_yield,
                profit_margin=profit_margin,
                sustainability_score=sustainability_score,
                water_requirement=self.crop_database[crop]["water_requirement"],
                growth_duration=self.crop_database[crop]["growth_duration"],
                best_planting_time=self._get_planting_time(crop, season),
                risk_factors=risk_factors,
                care_instructions=care_instructions
            )
            
            recommendations.append(recommendation)
        
        # Sort by combined score (yield potential + profit + sustainability)
        recommendations.sort(
            key=lambda x: (x.expected_yield/1000 + x.profit_margin + x.sustainability_score/2),
            reverse=True
        )
        
        return recommendations[:3]  # Top 3 recommendations

    def _get_care_instructions(self, crop: str, soil: SoilData, weather: WeatherData) -> List[str]:
        """Generate care instructions based on conditions"""
        instructions = []
        
        # Soil-based instructions
        if soil.ph < 6.0:
            instructions.append("Apply lime to increase soil pH")
        elif soil.ph > 7.5:
            instructions.append("Apply organic matter to reduce soil alkalinity")
            
        if soil.organic_carbon < 1.0:
            instructions.append("Add compost or farmyard manure to improve soil health")
            
        if soil.nitrogen < 200:
            instructions.append("Apply nitrogen-rich fertilizer or grow legume cover crops")
            
        # Weather-based instructions
        if weather.temperature > 35:
            instructions.append("Provide shade during extreme heat periods")
        elif weather.temperature < 15:
            instructions.append("Use mulching to protect from cold")
            
        if weather.humidity > 80:
            instructions.append("Ensure good air circulation to prevent fungal diseases")
            
        # Crop-specific instructions
        crop_specific = {
            "Rice": ["Maintain 2-5cm water level in field", "Apply silicon fertilizer for pest resistance"],
            "Wheat": ["Sow at proper depth (3-4cm)", "Monitor for rust diseases"],
            "Cotton": ["Regular monitoring for bollworm", "Maintain proper plant spacing"],
            "Tomato": ["Stake plants for support", "Regular pruning of suckers"],
            "Maize": ["Hill up soil around plants", "Monitor for stem borer"]
        }
        
        if crop in crop_specific:
            instructions.extend(crop_specific[crop])
            
        return instructions[:5]  # Limit to 5 instructions

    def _get_risk_factors(self, crop: str, weather: WeatherData, soil: SoilData) -> List[str]:
        """Identify potential risk factors"""
        risks = []
        
        # Weather risks
        if weather.temperature > 40:
            risks.append("Heat stress risk")
        if weather.humidity > 85:
            risks.append("High disease pressure")
        if weather.rainfall > 100:
            risks.append("Waterlogging risk")
        elif weather.rainfall < 10:
            risks.append("Drought stress")
            
        # Soil risks
        if soil.ph < 5.5 or soil.ph > 8.0:
            risks.append("Nutrient availability issues")
        if soil.organic_carbon < 0.8:
            risks.append("Poor soil structure")
            
        # Crop-specific risks
        crop_risks = {
            "Rice": ["Blast disease", "Brown plant hopper"],
            "Wheat": ["Rust diseases", "Aphid infestation"],
            "Cotton": ["Bollworm attack", "Whitefly infestation"],
            "Tomato": ["Late blight", "Fruit cracking"],
            "Maize": ["Fall armyworm", "Stalk rot"]
        }
        
        if crop in crop_risks:
            risks.extend(crop_risks[crop])
            
        return risks[:4]  # Limit to 4 risk factors

    def _get_planting_time(self, crop: str, season: str) -> str:
        """Get optimal planting time"""
        season_months = {
            "Kharif": "June-July",
            "Rabi": "November-December", 
            "Summer": "March-April"
        }
        return season_months.get(season, "Consult local agricultural officer")

# Global instance
crop_intelligence = CropIntelligenceService()
