"""
Market Price Service
Handles agricultural market price data and trends
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
class MarketPrice:
    crop_name: str
    price_per_kg: float
    currency: str
    market_name: str
    date: datetime
    trend: str  # "up", "down", "stable"
    change_percentage: float

@dataclass
class MarketTrend:
    crop_name: str
    weekly_prices: List[float]
    monthly_average: float
    seasonal_high: float
    seasonal_low: float
    forecast_next_week: float

class MarketService:
    def __init__(self):
        # Indian agricultural market data sources
        self.agmarknet_base_url = "https://agmarknet.gov.in/SearchCmmMkt.aspx"
        self.mock_prices = self._initialize_mock_prices()
        
    def _initialize_mock_prices(self) -> Dict:
        """Initialize mock market prices for Indian crops"""
        base_date = datetime.now()
        return {
            "Rice": {
                "current_price": 25.50,
                "weekly_trend": [24.80, 25.20, 25.50, 25.30, 25.60, 25.40, 25.50],
                "monthly_average": 25.20,
                "seasonal_high": 28.00,
                "seasonal_low": 22.50,
                "markets": ["Delhi", "Mumbai", "Kolkata", "Chennai", "Bangalore"]
            },
            "Wheat": {
                "current_price": 22.30,
                "weekly_trend": [21.80, 22.10, 22.30, 22.20, 22.40, 22.35, 22.30],
                "monthly_average": 22.15,
                "seasonal_high": 24.50,
                "seasonal_low": 20.00,
                "markets": ["Delhi", "Mumbai", "Pune", "Indore", "Ludhiana"]
            },
            "Maize": {
                "current_price": 18.75,
                "weekly_trend": [18.20, 18.50, 18.75, 18.60, 18.80, 18.70, 18.75],
                "monthly_average": 18.55,
                "seasonal_high": 20.50,
                "seasonal_low": 16.80,
                "markets": ["Hyderabad", "Bangalore", "Chennai", "Coimbatore"]
            },
            "Cotton": {
                "current_price": 55.20,
                "weekly_trend": [54.50, 55.00, 55.20, 55.10, 55.30, 55.25, 55.20],
                "monthly_average": 54.90,
                "seasonal_high": 58.00,
                "seasonal_low": 52.00,
                "markets": ["Ahmedabad", "Mumbai", "Nagpur", "Guntur"]
            },
            "Sugarcane": {
                "current_price": 3.20,
                "weekly_trend": [3.15, 3.18, 3.20, 3.19, 3.22, 3.21, 3.20],
                "monthly_average": 3.18,
                "seasonal_high": 3.50,
                "seasonal_low": 2.90,
                "markets": ["Pune", "Kolhapur", "Muzaffarnagar", "Meerut"]
            },
            "Soybean": {
                "current_price": 42.80,
                "weekly_trend": [42.20, 42.50, 42.80, 42.60, 42.90, 42.85, 42.80],
                "monthly_average": 42.55,
                "seasonal_high": 45.00,
                "seasonal_low": 40.00,
                "markets": ["Indore", "Bhopal", "Nagpur", "Akola"]
            },
            "Tomato": {
                "current_price": 15.60,
                "weekly_trend": [14.80, 15.20, 15.60, 15.40, 15.80, 15.70, 15.60],
                "monthly_average": 15.30,
                "seasonal_high": 18.00,
                "seasonal_low": 12.00,
                "markets": ["Bangalore", "Chennai", "Hyderabad", "Pune"]
            },
            "Onion": {
                "current_price": 12.40,
                "weekly_trend": [11.80, 12.10, 12.40, 12.20, 12.50, 12.45, 12.40],
                "monthly_average": 12.20,
                "seasonal_high": 15.00,
                "seasonal_low": 8.50,
                "markets": ["Nashik", "Pune", "Bangalore", "Delhi"]
            }
        }

    async def get_current_prices(self, crops: List[str], location: str = "Delhi") -> List[MarketPrice]:
        """Get current market prices for specified crops"""
        try:
            prices = []
            current_date = datetime.now()
            
            for crop in crops:
                if crop in self.mock_prices:
                    crop_data = self.mock_prices[crop]
                    
                    # Calculate trend
                    recent_prices = crop_data["weekly_trend"][-3:]
                    if len(recent_prices) >= 2:
                        if recent_prices[-1] > recent_prices[0]:
                            trend = "up"
                            change = ((recent_prices[-1] - recent_prices[0]) / recent_prices[0]) * 100
                        elif recent_prices[-1] < recent_prices[0]:
                            trend = "down"
                            change = ((recent_prices[0] - recent_prices[-1]) / recent_prices[0]) * -100
                        else:
                            trend = "stable"
                            change = 0.0
                    else:
                        trend = "stable"
                        change = 0.0
                    
                    price = MarketPrice(
                        crop_name=crop,
                        price_per_kg=crop_data["current_price"],
                        currency="INR",
                        market_name=location,
                        date=current_date,
                        trend=trend,
                        change_percentage=round(change, 2)
                    )
                    prices.append(price)
            
            return prices
            
        except Exception as e:
            logger.error(f"Error fetching market prices: {e}")
            return []

    async def get_market_trends(self, crop: str) -> Optional[MarketTrend]:
        """Get detailed market trends for a specific crop"""
        try:
            if crop not in self.mock_prices:
                return None
                
            crop_data = self.mock_prices[crop]
            
            # Calculate forecast (simple trend projection)
            recent_trend = crop_data["weekly_trend"][-3:]
            if len(recent_trend) >= 2:
                trend_slope = (recent_trend[-1] - recent_trend[0]) / len(recent_trend)
                forecast = recent_trend[-1] + trend_slope
            else:
                forecast = crop_data["current_price"]
            
            return MarketTrend(
                crop_name=crop,
                weekly_prices=crop_data["weekly_trend"],
                monthly_average=crop_data["monthly_average"],
                seasonal_high=crop_data["seasonal_high"],
                seasonal_low=crop_data["seasonal_low"],
                forecast_next_week=round(forecast, 2)
            )
            
        except Exception as e:
            logger.error(f"Error fetching market trends: {e}")
            return None

    async def get_price_alerts(self, crops: List[str], threshold_percentage: float = 5.0) -> List[Dict]:
        """Get price alerts for significant price changes"""
        try:
            alerts = []
            
            for crop in crops:
                if crop in self.mock_prices:
                    crop_data = self.mock_prices[crop]
                    recent_prices = crop_data["weekly_trend"][-2:]
                    
                    if len(recent_prices) >= 2:
                        change_percent = ((recent_prices[-1] - recent_prices[-2]) / recent_prices[-2]) * 100
                        
                        if abs(change_percent) >= threshold_percentage:
                            alert_type = "price_surge" if change_percent > 0 else "price_drop"
                            severity = "high" if abs(change_percent) >= 10 else "medium"
                            
                            alerts.append({
                                "crop": crop,
                                "type": alert_type,
                                "severity": severity,
                                "change_percentage": round(change_percent, 2),
                                "current_price": crop_data["current_price"],
                                "message": f"{crop} price {'increased' if change_percent > 0 else 'decreased'} by {abs(change_percent):.1f}%",
                                "timestamp": datetime.now().isoformat()
                            })
            
            return alerts
            
        except Exception as e:
            logger.error(f"Error generating price alerts: {e}")
            return []

    def get_available_crops(self) -> List[str]:
        """Get list of available crops for price tracking"""
        return list(self.mock_prices.keys())

    def get_available_markets(self, crop: str) -> List[str]:
        """Get available markets for a specific crop"""
        if crop in self.mock_prices:
            return self.mock_prices[crop]["markets"]
        return ["Delhi", "Mumbai", "Kolkata", "Chennai", "Bangalore"]

# Global instance
market_service = MarketService()
