"""
Location-based data capture service
Handles GPS coordinates, weather data, and soil information
"""
import requests
import json
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import asyncio
import aiohttp
from dataclasses import dataclass
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class LocationData:
    latitude: float
    longitude: float
    address: str
    district: str
    state: str
    country: str

@dataclass
class WeatherData:
    temperature: float
    humidity: float
    rainfall: float
    evapotranspiration: float
    wind_speed: float
    pressure: float
    timestamp: datetime

@dataclass
class SoilData:
    ph: float
    moisture: float
    organic_carbon: float
    nitrogen: float
    phosphorus: float
    potassium: float
    sand_content: float
    clay_content: float
    silt_content: float

class LocationService:
    def __init__(self):
        # Free weather API keys (replace with actual keys)
        self.openweather_api_key = "your_openweather_api_key"
        self.weatherapi_key = "your_weatherapi_key"
        
        # SoilGrids API endpoint
        self.soilgrids_base_url = "https://rest.isric.org/soilgrids/v2.0"
        
        # Climatic zones mapping for India
        self.climatic_zones = {
            "arid": ["Rajasthan", "Gujarat", "Haryana"],
            "semi_arid": ["Maharashtra", "Karnataka", "Andhra Pradesh", "Telangana"],
            "tropical_wet": ["Kerala", "Tamil Nadu", "Karnataka"],
            "subtropical": ["Punjab", "Himachal Pradesh", "Uttarakhand"],
            "humid_subtropical": ["West Bengal", "Assam", "Bihar"],
            "tropical_monsoon": ["Odisha", "Jharkhand", "Chhattisgarh"]
        }

    async def get_location_from_coordinates(self, lat: float, lon: float) -> LocationData:
        """Get location details from GPS coordinates using reverse geocoding"""
        try:
            url = f"https://api.opencagedata.com/geocode/v1/json?q={lat}+{lon}&key=your_opencage_api_key"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    data = await response.json()
                    
                    if data['results']:
                        result = data['results'][0]
                        components = result['components']
                        
                        return LocationData(
                            latitude=lat,
                            longitude=lon,
                            address=result['formatted'],
                            district=components.get('state_district', ''),
                            state=components.get('state', ''),
                            country=components.get('country', '')
                        )
        except Exception as e:
            logger.error(f"Error getting location: {e}")
            # Fallback to basic location data
            return LocationData(lat, lon, f"Location {lat}, {lon}", "", "", "India")

    async def get_current_weather(self, lat: float, lon: float) -> WeatherData:
        """Fetch current weather data from multiple APIs"""
        try:
            # Primary: OpenWeatherMap API
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={self.openweather_api_key}&units=metric"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    data = await response.json()
                    
                    return WeatherData(
                        temperature=data['main']['temp'],
                        humidity=data['main']['humidity'],
                        rainfall=data.get('rain', {}).get('1h', 0),
                        evapotranspiration=self._calculate_et0(
                            data['main']['temp'],
                            data['main']['humidity'],
                            data['wind']['speed']
                        ),
                        wind_speed=data['wind']['speed'],
                        pressure=data['main']['pressure'],
                        timestamp=datetime.now()
                    )
        except Exception as e:
            logger.error(f"Error fetching weather: {e}")
            # Return default weather data
            return WeatherData(25.0, 60.0, 0.0, 4.0, 2.0, 1013.0, datetime.now())

    async def get_soil_data(self, lat: float, lon: float) -> SoilData:
        """Fetch soil data from SoilGrids API"""
        try:
            # SoilGrids API for soil properties
            properties = ["phh2o", "soc", "nitrogen", "phosfor", "potassium", "sand", "clay", "silt"]
            depth = "0-5cm"  # Top soil layer
            
            url = f"{self.soilgrids_base_url}/properties"
            params = {
                "lon": lon,
                "lat": lat,
                "property": properties,
                "depth": depth,
                "value": "mean"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    data = await response.json()
                    
                    # Extract soil properties
                    props = data.get('properties', {})
                    
                    return SoilData(
                        ph=props.get('phh2o', {}).get('0-5cm', {}).get('mean', 7.0) / 10,
                        moisture=50.0,  # Default moisture, would need separate API
                        organic_carbon=props.get('soc', {}).get('0-5cm', {}).get('mean', 15.0) / 10,
                        nitrogen=props.get('nitrogen', {}).get('0-5cm', {}).get('mean', 2000) / 100,
                        phosphorus=props.get('phosfor', {}).get('0-5cm', {}).get('mean', 300) / 100,
                        potassium=props.get('potassium', {}).get('0-5cm', {}).get('mean', 200) / 100,
                        sand_content=props.get('sand', {}).get('0-5cm', {}).get('mean', 400) / 10,
                        clay_content=props.get('clay', {}).get('0-5cm', {}).get('mean', 250) / 10,
                        silt_content=props.get('silt', {}).get('0-5cm', {}).get('mean', 350) / 10
                    )
        except Exception as e:
            logger.error(f"Error fetching soil data: {e}")
            # Return default soil data for Indian conditions
            return SoilData(6.8, 45.0, 1.2, 280, 25, 180, 35.0, 28.0, 37.0)

    def get_climatic_zone(self, state: str) -> str:
        """Determine climatic zone based on state"""
        for zone, states in self.climatic_zones.items():
            if state in states:
                return zone
        return "tropical_monsoon"  # Default for India

    def _calculate_et0(self, temp: float, humidity: float, wind_speed: float) -> float:
        """Calculate reference evapotranspiration using simplified Penman equation"""
        # Simplified ET0 calculation
        delta = 4098 * (0.6108 * 2.71828 ** (17.27 * temp / (temp + 237.3))) / ((temp + 237.3) ** 2)
        gamma = 0.665  # Psychrometric constant
        u2 = wind_speed * 4.87 / (2.71828 ** (67.8 * 10 / (temp + 273.3)))  # Wind speed at 2m
        
        et0 = (0.408 * delta * (temp) + gamma * 900 / (temp + 273) * u2 * (0.01 * (100 - humidity))) / (delta + gamma * (1 + 0.34 * u2))
        return max(0, et0)

    async def get_weather_forecast(self, lat: float, lon: float, days: int = 7) -> List[WeatherData]:
        """Get multi-day weather forecast"""
        try:
            url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={self.openweather_api_key}&units=metric"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    data = await response.json()
                    
                    forecasts = []
                    for item in data['list'][:days * 8]:  # 8 forecasts per day (3-hour intervals)
                        forecast = WeatherData(
                            temperature=item['main']['temp'],
                            humidity=item['main']['humidity'],
                            rainfall=item.get('rain', {}).get('3h', 0),
                            evapotranspiration=self._calculate_et0(
                                item['main']['temp'],
                                item['main']['humidity'],
                                item['wind']['speed']
                            ),
                            wind_speed=item['wind']['speed'],
                            pressure=item['main']['pressure'],
                            timestamp=datetime.fromtimestamp(item['dt'])
                        )
                        forecasts.append(forecast)
                    
                    return forecasts
        except Exception as e:
            logger.error(f"Error fetching forecast: {e}")
            return []

# Global instance
location_service = LocationService()
