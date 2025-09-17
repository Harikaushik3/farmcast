"""
Planting Calendar Service
Handles crop planting schedules, seasonal recommendations, and agricultural calendar
"""
import json
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
import calendar
import logging

logger = logging.getLogger(__name__)

@dataclass
class PlantingWindow:
    crop_name: str
    season: str
    start_month: int
    end_month: int
    optimal_month: int
    duration_days: int
    harvest_months: List[int]
    region_suitability: List[str]

@dataclass
class SeasonalActivity:
    activity_type: str  # "planting", "care", "harvest", "pest_control"
    description: str
    month: int
    week: int
    priority: str  # "high", "medium", "low"
    crops_affected: List[str]

@dataclass
class CropCalendar:
    crop_name: str
    planting_windows: List[PlantingWindow]
    monthly_activities: Dict[int, List[SeasonalActivity]]
    care_schedule: Dict[str, List[str]]  # growth_stage -> activities

class CalendarService:
    def __init__(self):
        self.crop_seasons = self._initialize_crop_seasons()
        self.regional_variations = self._initialize_regional_variations()
        self.activity_templates = self._initialize_activity_templates()
        
    def _initialize_crop_seasons(self) -> Dict:
        """Initialize crop planting seasons for India"""
        return {
            "Rice": {
                "Kharif": {"start": 6, "end": 7, "optimal": 6, "duration": 120, "harvest": [10, 11]},
                "Rabi": {"start": 12, "end": 1, "optimal": 12, "duration": 110, "harvest": [4, 5]},
                "Summer": {"start": 3, "end": 4, "optimal": 3, "duration": 100, "harvest": [6, 7]}
            },
            "Wheat": {
                "Rabi": {"start": 11, "end": 12, "optimal": 11, "duration": 120, "harvest": [3, 4]}
            },
            "Maize": {
                "Kharif": {"start": 6, "end": 7, "optimal": 6, "duration": 90, "harvest": [9, 10]},
                "Rabi": {"start": 11, "end": 12, "optimal": 11, "duration": 85, "harvest": [2, 3]},
                "Summer": {"start": 2, "end": 3, "optimal": 2, "duration": 80, "harvest": [5, 6]}
            },
            "Cotton": {
                "Kharif": {"start": 5, "end": 6, "optimal": 5, "duration": 180, "harvest": [11, 12, 1]}
            },
            "Sugarcane": {
                "Adsali": {"start": 7, "end": 9, "optimal": 8, "duration": 365, "harvest": [12, 1, 2]},
                "Pre-seasonal": {"start": 1, "end": 3, "optimal": 2, "duration": 365, "harvest": [12, 1, 2]},
                "Seasonal": {"start": 10, "end": 12, "optimal": 11, "duration": 365, "harvest": [12, 1, 2]}
            },
            "Soybean": {
                "Kharif": {"start": 6, "end": 7, "optimal": 6, "duration": 100, "harvest": [9, 10]}
            },
            "Tomato": {
                "Kharif": {"start": 6, "end": 7, "optimal": 6, "duration": 75, "harvest": [8, 9]},
                "Rabi": {"start": 11, "end": 12, "optimal": 11, "duration": 80, "harvest": [2, 3]},
                "Summer": {"start": 1, "end": 2, "optimal": 1, "duration": 70, "harvest": [3, 4]}
            },
            "Onion": {
                "Kharif": {"start": 6, "end": 7, "optimal": 6, "duration": 120, "harvest": [10, 11]},
                "Rabi": {"start": 11, "end": 12, "optimal": 11, "duration": 110, "harvest": [3, 4]},
                "Late Kharif": {"start": 8, "end": 9, "optimal": 8, "duration": 100, "harvest": [12, 1]}
            }
        }

    def _initialize_regional_variations(self) -> Dict:
        """Initialize regional planting variations"""
        return {
            "Northern Plains": {
                "states": ["Punjab", "Haryana", "Uttar Pradesh", "Bihar"],
                "adjustments": {
                    "Rice": {"Kharif": {"start_offset": 0, "end_offset": 0}},
                    "Wheat": {"Rabi": {"start_offset": 0, "end_offset": 0}}
                }
            },
            "Western Region": {
                "states": ["Maharashtra", "Gujarat", "Rajasthan"],
                "adjustments": {
                    "Cotton": {"Kharif": {"start_offset": -15, "end_offset": 0}},
                    "Sugarcane": {"Pre-seasonal": {"start_offset": 0, "end_offset": 15}}
                }
            },
            "Southern Region": {
                "states": ["Karnataka", "Tamil Nadu", "Andhra Pradesh", "Telangana"],
                "adjustments": {
                    "Rice": {"Kharif": {"start_offset": -15, "end_offset": -15}},
                    "Tomato": {"Summer": {"start_offset": 15, "end_offset": 15}}
                }
            },
            "Eastern Region": {
                "states": ["West Bengal", "Odisha", "Jharkhand"],
                "adjustments": {
                    "Rice": {"Kharif": {"start_offset": 15, "end_offset": 15}}
                }
            }
        }

    def _initialize_activity_templates(self) -> Dict:
        """Initialize monthly activity templates"""
        return {
            "land_preparation": {
                "description": "Land preparation and soil treatment",
                "activities": ["Plowing", "Harrowing", "Leveling", "Organic matter incorporation"],
                "timing": "2-3 weeks before planting"
            },
            "seed_treatment": {
                "description": "Seed treatment and preparation",
                "activities": ["Seed selection", "Treatment with fungicides", "Germination testing"],
                "timing": "1 week before planting"
            },
            "planting": {
                "description": "Sowing/transplanting operations",
                "activities": ["Sowing", "Transplanting", "Spacing maintenance", "Initial irrigation"],
                "timing": "Optimal planting window"
            },
            "early_care": {
                "description": "Early crop care and management",
                "activities": ["Gap filling", "Weed control", "Pest monitoring", "Fertilizer application"],
                "timing": "2-4 weeks after planting"
            },
            "mid_season": {
                "description": "Mid-season crop management",
                "activities": ["Irrigation management", "Pest control", "Disease monitoring", "Top dressing"],
                "timing": "Mid-growth period"
            },
            "pre_harvest": {
                "description": "Pre-harvest preparations",
                "activities": ["Maturity assessment", "Harvest planning", "Equipment preparation"],
                "timing": "2 weeks before harvest"
            },
            "harvest": {
                "description": "Harvesting operations",
                "activities": ["Harvesting", "Threshing", "Cleaning", "Storage preparation"],
                "timing": "At physiological maturity"
            },
            "post_harvest": {
                "description": "Post-harvest management",
                "activities": ["Storage", "Processing", "Marketing", "Field cleaning"],
                "timing": "After harvest"
            }
        }

    async def get_planting_calendar(self, crop: str, location: str, current_date: datetime = None) -> CropCalendar:
        """Get comprehensive planting calendar for a crop"""
        try:
            if current_date is None:
                current_date = datetime.now()
                
            if crop not in self.crop_seasons:
                return None
                
            crop_data = self.crop_seasons[crop]
            planting_windows = []
            
            # Create planting windows for each season
            for season, season_data in crop_data.items():
                window = PlantingWindow(
                    crop_name=crop,
                    season=season,
                    start_month=season_data["start"],
                    end_month=season_data["end"],
                    optimal_month=season_data["optimal"],
                    duration_days=season_data["duration"],
                    harvest_months=season_data["harvest"],
                    region_suitability=self._get_suitable_regions(crop, season)
                )
                planting_windows.append(window)
            
            # Generate monthly activities
            monthly_activities = self._generate_monthly_activities(crop, planting_windows, current_date)
            
            # Generate care schedule
            care_schedule = self._generate_care_schedule(crop)
            
            return CropCalendar(
                crop_name=crop,
                planting_windows=planting_windows,
                monthly_activities=monthly_activities,
                care_schedule=care_schedule
            )
            
        except Exception as e:
            logger.error(f"Error generating planting calendar: {e}")
            return None

    def _get_suitable_regions(self, crop: str, season: str) -> List[str]:
        """Get suitable regions for crop-season combination"""
        suitable_regions = []
        
        for region, region_data in self.regional_variations.items():
            if crop in region_data.get("adjustments", {}):
                if season in region_data["adjustments"][crop]:
                    suitable_regions.extend(region_data["states"])
        
        # Default regions if no specific adjustments
        if not suitable_regions:
            suitable_regions = ["All India"]
            
        return suitable_regions

    def _generate_monthly_activities(self, crop: str, planting_windows: List[PlantingWindow], current_date: datetime) -> Dict[int, List[SeasonalActivity]]:
        """Generate month-wise activities for the crop"""
        monthly_activities = {i: [] for i in range(1, 13)}
        
        for window in planting_windows:
            # Land preparation (1 month before planting)
            prep_month = window.start_month - 1 if window.start_month > 1 else 12
            monthly_activities[prep_month].append(
                SeasonalActivity(
                    activity_type="preparation",
                    description=f"Land preparation for {window.season} {crop}",
                    month=prep_month,
                    week=3,
                    priority="high",
                    crops_affected=[crop]
                )
            )
            
            # Planting
            monthly_activities[window.optimal_month].append(
                SeasonalActivity(
                    activity_type="planting",
                    description=f"Optimal planting time for {window.season} {crop}",
                    month=window.optimal_month,
                    week=2,
                    priority="high",
                    crops_affected=[crop]
                )
            )
            
            # Care activities (throughout growing season)
            care_months = self._get_care_months(window.optimal_month, window.duration_days)
            for month in care_months:
                monthly_activities[month].append(
                    SeasonalActivity(
                        activity_type="care",
                        description=f"Crop care and management for {crop}",
                        month=month,
                        week=2,
                        priority="medium",
                        crops_affected=[crop]
                    )
                )
            
            # Harvest
            for harvest_month in window.harvest_months:
                monthly_activities[harvest_month].append(
                    SeasonalActivity(
                        activity_type="harvest",
                        description=f"Harvest {window.season} {crop}",
                        month=harvest_month,
                        week=2,
                        priority="high",
                        crops_affected=[crop]
                    )
                )
        
        return monthly_activities

    def _get_care_months(self, start_month: int, duration_days: int) -> List[int]:
        """Calculate care months based on planting month and duration"""
        care_months = []
        current_month = start_month
        days_covered = 0
        
        while days_covered < duration_days:
            care_months.append(current_month)
            days_in_month = calendar.monthrange(datetime.now().year, current_month)[1]
            days_covered += days_in_month
            current_month = current_month + 1 if current_month < 12 else 1
            
        return care_months[1:-1]  # Exclude planting and harvest months

    def _generate_care_schedule(self, crop: str) -> Dict[str, List[str]]:
        """Generate care schedule by growth stages"""
        return {
            "seedling": [
                "Monitor for damping off",
                "Maintain optimal moisture",
                "Protect from extreme weather",
                "Apply starter fertilizer"
            ],
            "vegetative": [
                "Regular irrigation",
                "Weed management",
                "Pest monitoring",
                "Nitrogen application"
            ],
            "flowering": [
                "Ensure adequate water",
                "Monitor for flower drop",
                "Apply phosphorus",
                "Pest and disease control"
            ],
            "fruiting": [
                "Balanced nutrition",
                "Water stress management",
                "Support heavy branches",
                "Quality monitoring"
            ],
            "maturity": [
                "Reduce irrigation",
                "Monitor for harvest readiness",
                "Prepare harvesting equipment",
                "Plan post-harvest handling"
            ]
        }

    async def get_current_recommendations(self, location: str, current_date: datetime = None) -> List[Dict]:
        """Get current month recommendations for the location"""
        try:
            if current_date is None:
                current_date = datetime.now()
                
            current_month = current_date.month
            recommendations = []
            
            # Check all crops for current month activities
            for crop, seasons in self.crop_seasons.items():
                for season, season_data in seasons.items():
                    # Check if it's planting time
                    if season_data["start"] <= current_month <= season_data["end"]:
                        recommendations.append({
                            "type": "planting",
                            "crop": crop,
                            "season": season,
                            "priority": "high",
                            "description": f"Optimal time to plant {season} {crop}",
                            "action": "Start land preparation and planting operations"
                        })
                    
                    # Check if it's harvest time
                    if current_month in season_data["harvest"]:
                        recommendations.append({
                            "type": "harvest",
                            "crop": crop,
                            "season": season,
                            "priority": "high",
                            "description": f"Harvest time for {season} {crop}",
                            "action": "Begin harvesting operations"
                        })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error getting current recommendations: {e}")
            return []

    def get_next_planting_opportunities(self, crops: List[str], current_date: datetime = None) -> List[Dict]:
        """Get next planting opportunities for specified crops"""
        if current_date is None:
            current_date = datetime.now()
            
        opportunities = []
        current_month = current_date.month
        
        for crop in crops:
            if crop in self.crop_seasons:
                for season, season_data in self.crop_seasons[crop].items():
                    # Find next planting window
                    start_month = season_data["start"]
                    optimal_month = season_data["optimal"]
                    
                    # Calculate months until next planting
                    if optimal_month >= current_month:
                        months_until = optimal_month - current_month
                    else:
                        months_until = (12 - current_month) + optimal_month
                    
                    opportunities.append({
                        "crop": crop,
                        "season": season,
                        "optimal_month": optimal_month,
                        "months_until": months_until,
                        "preparation_start": start_month - 1 if start_month > 1 else 12,
                        "duration_days": season_data["duration"],
                        "harvest_months": season_data["harvest"]
                    })
        
        # Sort by months until planting
        opportunities.sort(key=lambda x: x["months_until"])
        return opportunities

# Global instance
calendar_service = CalendarService()
