"""
Pest and Disease Alert Service
Handles pest detection, disease alerts, and prevention recommendations
"""
import requests
import json
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import asyncio
import aiohttp
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class PestAlert:
    pest_name: str
    crop_affected: str
    severity: str  # "low", "medium", "high", "critical"
    location: str
    description: str
    symptoms: List[str]
    prevention_methods: List[str]
    treatment_options: List[str]
    alert_date: datetime
    weather_conditions: Dict

@dataclass
class DiseaseAlert:
    disease_name: str
    crop_affected: str
    severity: str
    probability: float  # 0-100%
    symptoms: List[str]
    causes: List[str]
    prevention: List[str]
    treatment: List[str]
    alert_date: datetime

class PestService:
    def __init__(self):
        self.pest_database = self._initialize_pest_database()
        self.disease_database = self._initialize_disease_database()
        self.weather_pest_correlation = self._initialize_weather_correlations()
        
    def _initialize_pest_database(self) -> Dict:
        """Initialize comprehensive pest database for Indian crops"""
        return {
            "Rice": {
                "Brown Planthopper": {
                    "severity_factors": {"humidity": (70, 90), "temperature": (25, 30)},
                    "symptoms": ["Yellowing of leaves", "Stunted growth", "Honeydew secretion"],
                    "prevention": ["Use resistant varieties", "Proper water management", "Biological control"],
                    "treatment": ["Neem oil spray", "Imidacloprid application", "Remove affected plants"]
                },
                "Stem Borer": {
                    "severity_factors": {"humidity": (60, 80), "temperature": (20, 35)},
                    "symptoms": ["Dead hearts", "White ears", "Holes in stem"],
                    "prevention": ["Early planting", "Pheromone traps", "Clean cultivation"],
                    "treatment": ["Cartap hydrochloride", "Chlorantraniliprole", "Biological agents"]
                },
                "Leaf Folder": {
                    "severity_factors": {"humidity": (65, 85), "temperature": (22, 32)},
                    "symptoms": ["Folded leaves", "Feeding marks", "Reduced photosynthesis"],
                    "prevention": ["Balanced fertilization", "Water management", "Natural enemies"],
                    "treatment": ["Fipronil spray", "Quinalphos", "Bacillus thuringiensis"]
                }
            },
            "Wheat": {
                "Aphids": {
                    "severity_factors": {"humidity": (50, 70), "temperature": (15, 25)},
                    "symptoms": ["Curled leaves", "Sticky honeydew", "Yellowing"],
                    "prevention": ["Early sowing", "Resistant varieties", "Crop rotation"],
                    "treatment": ["Dimethoate spray", "Thiamethoxam", "Ladybird beetles"]
                },
                "Termites": {
                    "severity_factors": {"humidity": (40, 60), "temperature": (20, 30)},
                    "symptoms": ["Wilting plants", "Damaged roots", "Soil tunnels"],
                    "prevention": ["Seed treatment", "Soil treatment", "Organic matter"],
                    "treatment": ["Chlorpyrifos", "Imidacloprid soil application", "Neem cake"]
                }
            },
            "Cotton": {
                "Bollworm": {
                    "severity_factors": {"humidity": (60, 80), "temperature": (25, 35)},
                    "symptoms": ["Damaged bolls", "Entry holes", "Frass presence"],
                    "prevention": ["Bt cotton varieties", "Pheromone traps", "Intercropping"],
                    "treatment": ["Spinosad", "Emamectin benzoate", "Nuclear polyhedrosis virus"]
                },
                "Whitefly": {
                    "severity_factors": {"humidity": (70, 90), "temperature": (28, 35)},
                    "symptoms": ["Yellowing leaves", "Sooty mold", "Reduced vigor"],
                    "prevention": ["Yellow sticky traps", "Reflective mulch", "Resistant varieties"],
                    "treatment": ["Thiamethoxam", "Spiromesifen", "Neem oil"]
                }
            },
            "Tomato": {
                "Fruit Borer": {
                    "severity_factors": {"humidity": (65, 85), "temperature": (20, 30)},
                    "symptoms": ["Holes in fruits", "Larval presence", "Fruit drop"],
                    "prevention": ["Pheromone traps", "Crop rotation", "Timely harvest"],
                    "treatment": ["Indoxacarb", "Chlorantraniliprole", "Bt spray"]
                },
                "Leaf Miner": {
                    "severity_factors": {"humidity": (55, 75), "temperature": (22, 32)},
                    "symptoms": ["Serpentine mines", "Leaf damage", "Reduced photosynthesis"],
                    "prevention": ["Yellow sticky traps", "Crop sanitation", "Natural enemies"],
                    "treatment": ["Abamectin", "Cyromazine", "Neem extract"]
                }
            }
        }

    def _initialize_disease_database(self) -> Dict:
        """Initialize disease database for crops"""
        return {
            "Rice": {
                "Blast": {
                    "probability_factors": {"humidity": (85, 95), "temperature": (20, 28)},
                    "symptoms": ["Diamond-shaped lesions", "Neck rot", "Panicle blast"],
                    "causes": ["High humidity", "Dense planting", "Excess nitrogen"],
                    "prevention": ["Resistant varieties", "Balanced fertilization", "Proper spacing"],
                    "treatment": ["Tricyclazole", "Carbendazim", "Propiconazole"]
                },
                "Bacterial Blight": {
                    "probability_factors": {"humidity": (80, 95), "temperature": (25, 35)},
                    "symptoms": ["Water-soaked lesions", "Yellow halos", "Wilting"],
                    "causes": ["Contaminated seeds", "Wounds", "High humidity"],
                    "prevention": ["Certified seeds", "Copper sprays", "Field sanitation"],
                    "treatment": ["Streptocycline", "Copper oxychloride", "Bacteriophages"]
                }
            },
            "Wheat": {
                "Rust": {
                    "probability_factors": {"humidity": (70, 90), "temperature": (15, 25)},
                    "symptoms": ["Orange pustules", "Yellowing", "Premature drying"],
                    "causes": ["Cool humid weather", "Susceptible varieties", "Wind dispersal"],
                    "prevention": ["Resistant varieties", "Timely sowing", "Fungicide sprays"],
                    "treatment": ["Propiconazole", "Tebuconazole", "Mancozeb"]
                }
            },
            "Cotton": {
                "Wilt": {
                    "probability_factors": {"humidity": (60, 80), "temperature": (28, 35)},
                    "symptoms": ["Yellowing", "Wilting", "Vascular browning"],
                    "causes": ["Soil-borne fungus", "Poor drainage", "Stress conditions"],
                    "prevention": ["Resistant varieties", "Soil treatment", "Crop rotation"],
                    "treatment": ["Carbendazim soil drench", "Trichoderma", "Organic amendments"]
                }
            }
        }

    def _initialize_weather_correlations(self) -> Dict:
        """Initialize weather-pest correlation factors"""
        return {
            "high_humidity_pests": ["Brown Planthopper", "Whitefly", "Leaf Folder"],
            "high_temperature_pests": ["Bollworm", "Aphids"],
            "rainy_season_diseases": ["Blast", "Bacterial Blight", "Rust"],
            "dry_season_pests": ["Termites", "Thrips"]
        }

    async def get_pest_alerts(self, crop: str, location_data: Dict, weather_data: Dict) -> List[PestAlert]:
        """Generate pest alerts based on crop, location, and weather conditions"""
        try:
            alerts = []
            current_date = datetime.now()
            
            if crop not in self.pest_database:
                return alerts
                
            crop_pests = self.pest_database[crop]
            temperature = weather_data.get('temperature', 25)
            humidity = weather_data.get('humidity', 60)
            
            for pest_name, pest_info in crop_pests.items():
                severity = self._calculate_pest_severity(pest_info, temperature, humidity)
                
                if severity != "none":
                    alert = PestAlert(
                        pest_name=pest_name,
                        crop_affected=crop,
                        severity=severity,
                        location=location_data.get('district', 'Unknown'),
                        description=f"{pest_name} outbreak risk in {crop}",
                        symptoms=pest_info['symptoms'],
                        prevention_methods=pest_info['prevention'],
                        treatment_options=pest_info['treatment'],
                        alert_date=current_date,
                        weather_conditions={
                            'temperature': temperature,
                            'humidity': humidity
                        }
                    )
                    alerts.append(alert)
            
            return alerts
            
        except Exception as e:
            logger.error(f"Error generating pest alerts: {e}")
            return []

    async def get_disease_alerts(self, crop: str, location_data: Dict, weather_data: Dict) -> List[DiseaseAlert]:
        """Generate disease alerts based on environmental conditions"""
        try:
            alerts = []
            current_date = datetime.now()
            
            if crop not in self.disease_database:
                return alerts
                
            crop_diseases = self.disease_database[crop]
            temperature = weather_data.get('temperature', 25)
            humidity = weather_data.get('humidity', 60)
            
            for disease_name, disease_info in crop_diseases.items():
                probability = self._calculate_disease_probability(disease_info, temperature, humidity)
                
                if probability > 30:  # Alert threshold
                    severity = "high" if probability > 70 else "medium" if probability > 50 else "low"
                    
                    alert = DiseaseAlert(
                        disease_name=disease_name,
                        crop_affected=crop,
                        severity=severity,
                        probability=probability,
                        symptoms=disease_info['symptoms'],
                        causes=disease_info['causes'],
                        prevention=disease_info['prevention'],
                        treatment=disease_info['treatment'],
                        alert_date=current_date
                    )
                    alerts.append(alert)
            
            return alerts
            
        except Exception as e:
            logger.error(f"Error generating disease alerts: {e}")
            return []

    def _calculate_pest_severity(self, pest_info: Dict, temperature: float, humidity: float) -> str:
        """Calculate pest severity based on environmental conditions"""
        severity_factors = pest_info.get('severity_factors', {})
        
        temp_range = severity_factors.get('temperature', (0, 50))
        humidity_range = severity_factors.get('humidity', (0, 100))
        
        temp_score = 0
        if temp_range[0] <= temperature <= temp_range[1]:
            temp_score = 1 - abs(temperature - (temp_range[0] + temp_range[1]) / 2) / ((temp_range[1] - temp_range[0]) / 2)
        
        humidity_score = 0
        if humidity_range[0] <= humidity <= humidity_range[1]:
            humidity_score = 1 - abs(humidity - (humidity_range[0] + humidity_range[1]) / 2) / ((humidity_range[1] - humidity_range[0]) / 2)
        
        combined_score = (temp_score + humidity_score) / 2
        
        if combined_score > 0.8:
            return "critical"
        elif combined_score > 0.6:
            return "high"
        elif combined_score > 0.4:
            return "medium"
        elif combined_score > 0.2:
            return "low"
        else:
            return "none"

    def _calculate_disease_probability(self, disease_info: Dict, temperature: float, humidity: float) -> float:
        """Calculate disease probability percentage"""
        probability_factors = disease_info.get('probability_factors', {})
        
        temp_range = probability_factors.get('temperature', (0, 50))
        humidity_range = probability_factors.get('humidity', (0, 100))
        
        temp_match = temp_range[0] <= temperature <= temp_range[1]
        humidity_match = humidity_range[0] <= humidity <= humidity_range[1]
        
        base_probability = 20  # Base 20% chance
        
        if temp_match and humidity_match:
            probability = 80
        elif temp_match or humidity_match:
            probability = 50
        else:
            probability = base_probability
        
        return probability

    def get_prevention_calendar(self, crop: str, location: str) -> Dict:
        """Get seasonal prevention calendar for pests and diseases"""
        calendar = {
            "January": ["Soil treatment for termites", "Seed treatment"],
            "February": ["Field preparation", "Organic matter incorporation"],
            "March": ["Early pest monitoring", "Pheromone trap installation"],
            "April": ["Regular scouting", "Beneficial insect conservation"],
            "May": ["Water management", "Stress reduction measures"],
            "June": ["Monsoon preparation", "Drainage management"],
            "July": ["Disease monitoring", "Fungicide applications"],
            "August": ["Peak pest season vigilance", "Integrated pest management"],
            "September": ["Harvest preparation", "Post-harvest pest control"],
            "October": ["Field sanitation", "Crop residue management"],
            "November": ["Storage pest prevention", "Warehouse management"],
            "December": ["Planning next season", "Equipment maintenance"]
        }
        
        return calendar

# Global instance
pest_service = PestService()
