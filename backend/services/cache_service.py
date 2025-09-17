"""
Caching service for offline-first functionality
Handles local storage of weather, soil, and crop data
"""
import json
import sqlite3
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import logging
from .location_service import WeatherData, SoilData, LocationData
from .crop_intelligence import CropRecommendation, HistoricalPattern

logger = logging.getLogger(__name__)

@dataclass
class CacheEntry:
    key: str
    data: Dict
    timestamp: datetime
    expiry: datetime
    location_hash: str

class CacheService:
    def __init__(self, cache_dir: str = "cache"):
        self.cache_dir = cache_dir
        self.db_path = os.path.join(cache_dir, "farmcast_cache.db")
        self._ensure_cache_directory()
        self._initialize_database()
        
        # Cache expiry times (in hours)
        self.cache_expiry = {
            "weather_current": 1,      # 1 hour
            "weather_forecast": 6,     # 6 hours
            "soil_data": 24 * 30,      # 30 days
            "crop_recommendations": 24, # 24 hours
            "historical_data": 24 * 7, # 7 days
            "location_data": 24 * 30   # 30 days
        }

    def _ensure_cache_directory(self):
        """Create cache directory if it doesn't exist"""
        if not os.path.exists(self.cache_dir):
            os.makedirs(self.cache_dir)

    def _initialize_database(self):
        """Initialize SQLite database for caching"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create cache table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS cache_entries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    cache_key TEXT UNIQUE NOT NULL,
                    data TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    expiry TEXT NOT NULL,
                    location_hash TEXT NOT NULL,
                    data_type TEXT NOT NULL
                )
            ''')
            
            # Create index for faster lookups
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_cache_key 
                ON cache_entries(cache_key)
            ''')
            
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_location_hash 
                ON cache_entries(location_hash)
            ''')
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error initializing cache database: {e}")

    def _generate_location_hash(self, lat: float, lon: float, precision: int = 3) -> str:
        """Generate location hash for caching (rounded to reduce cache size)"""
        lat_rounded = round(lat, precision)
        lon_rounded = round(lon, precision)
        return f"{lat_rounded}_{lon_rounded}"

    def _generate_cache_key(self, data_type: str, location_hash: str, 
                          additional_params: str = "") -> str:
        """Generate unique cache key"""
        if additional_params:
            return f"{data_type}_{location_hash}_{additional_params}"
        return f"{data_type}_{location_hash}"

    def store_weather_data(self, lat: float, lon: float, weather_data: WeatherData, 
                          is_forecast: bool = False):
        """Store weather data in cache"""
        try:
            location_hash = self._generate_location_hash(lat, lon)
            data_type = "weather_forecast" if is_forecast else "weather_current"
            cache_key = self._generate_cache_key(data_type, location_hash)
            
            # Convert dataclass to dict
            data_dict = asdict(weather_data)
            data_dict['timestamp'] = weather_data.timestamp.isoformat()
            
            self._store_in_database(cache_key, data_dict, data_type, location_hash)
            
        except Exception as e:
            logger.error(f"Error storing weather data: {e}")

    def store_soil_data(self, lat: float, lon: float, soil_data: SoilData):
        """Store soil data in cache"""
        try:
            location_hash = self._generate_location_hash(lat, lon)
            cache_key = self._generate_cache_key("soil_data", location_hash)
            
            data_dict = asdict(soil_data)
            self._store_in_database(cache_key, data_dict, "soil_data", location_hash)
            
        except Exception as e:
            logger.error(f"Error storing soil data: {e}")

    def store_location_data(self, location_data: LocationData):
        """Store location data in cache"""
        try:
            location_hash = self._generate_location_hash(
                location_data.latitude, location_data.longitude
            )
            cache_key = self._generate_cache_key("location_data", location_hash)
            
            data_dict = asdict(location_data)
            self._store_in_database(cache_key, data_dict, "location_data", location_hash)
            
        except Exception as e:
            logger.error(f"Error storing location data: {e}")

    def store_crop_recommendations(self, lat: float, lon: float, 
                                 recommendations: List[CropRecommendation],
                                 season: str = ""):
        """Store crop recommendations in cache"""
        try:
            location_hash = self._generate_location_hash(lat, lon)
            additional_params = season.lower() if season else ""
            cache_key = self._generate_cache_key("crop_recommendations", 
                                               location_hash, additional_params)
            
            # Convert list of dataclasses to list of dicts
            data_dict = {
                "recommendations": [asdict(rec) for rec in recommendations],
                "season": season,
                "location": {"lat": lat, "lon": lon}
            }
            
            self._store_in_database(cache_key, data_dict, "crop_recommendations", location_hash)
            
        except Exception as e:
            logger.error(f"Error storing crop recommendations: {e}")

    def store_historical_data(self, lat: float, lon: float, 
                            historical_data: List[HistoricalPattern]):
        """Store historical crop data in cache"""
        try:
            location_hash = self._generate_location_hash(lat, lon)
            cache_key = self._generate_cache_key("historical_data", location_hash)
            
            data_dict = {
                "patterns": [asdict(pattern) for pattern in historical_data],
                "location": {"lat": lat, "lon": lon}
            }
            
            self._store_in_database(cache_key, data_dict, "historical_data", location_hash)
            
        except Exception as e:
            logger.error(f"Error storing historical data: {e}")

    def _store_in_database(self, cache_key: str, data: Dict, data_type: str, 
                          location_hash: str):
        """Store data in SQLite database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            timestamp = datetime.now()
            expiry_hours = self.cache_expiry.get(data_type, 24)
            expiry = timestamp + timedelta(hours=expiry_hours)
            
            # Insert or replace cache entry
            cursor.execute('''
                INSERT OR REPLACE INTO cache_entries 
                (cache_key, data, timestamp, expiry, location_hash, data_type)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                cache_key,
                json.dumps(data),
                timestamp.isoformat(),
                expiry.isoformat(),
                location_hash,
                data_type
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error storing in database: {e}")

    def get_weather_data(self, lat: float, lon: float, 
                        is_forecast: bool = False) -> Optional[WeatherData]:
        """Retrieve weather data from cache"""
        try:
            location_hash = self._generate_location_hash(lat, lon)
            data_type = "weather_forecast" if is_forecast else "weather_current"
            cache_key = self._generate_cache_key(data_type, location_hash)
            
            data = self._get_from_database(cache_key)
            if data:
                # Convert back to WeatherData object
                data['timestamp'] = datetime.fromisoformat(data['timestamp'])
                return WeatherData(**data)
            
        except Exception as e:
            logger.error(f"Error retrieving weather data: {e}")
        
        return None

    def get_soil_data(self, lat: float, lon: float) -> Optional[SoilData]:
        """Retrieve soil data from cache"""
        try:
            location_hash = self._generate_location_hash(lat, lon)
            cache_key = self._generate_cache_key("soil_data", location_hash)
            
            data = self._get_from_database(cache_key)
            if data:
                return SoilData(**data)
            
        except Exception as e:
            logger.error(f"Error retrieving soil data: {e}")
        
        return None

    def get_location_data(self, lat: float, lon: float) -> Optional[LocationData]:
        """Retrieve location data from cache"""
        try:
            location_hash = self._generate_location_hash(lat, lon)
            cache_key = self._generate_cache_key("location_data", location_hash)
            
            data = self._get_from_database(cache_key)
            if data:
                return LocationData(**data)
            
        except Exception as e:
            logger.error(f"Error retrieving location data: {e}")
        
        return None

    def get_crop_recommendations(self, lat: float, lon: float, 
                               season: str = "") -> Optional[List[CropRecommendation]]:
        """Retrieve crop recommendations from cache"""
        try:
            location_hash = self._generate_location_hash(lat, lon)
            additional_params = season.lower() if season else ""
            cache_key = self._generate_cache_key("crop_recommendations", 
                                               location_hash, additional_params)
            
            data = self._get_from_database(cache_key)
            if data and 'recommendations' in data:
                return [CropRecommendation(**rec) for rec in data['recommendations']]
            
        except Exception as e:
            logger.error(f"Error retrieving crop recommendations: {e}")
        
        return None

    def get_historical_data(self, lat: float, lon: float) -> Optional[List[HistoricalPattern]]:
        """Retrieve historical data from cache"""
        try:
            location_hash = self._generate_location_hash(lat, lon)
            cache_key = self._generate_cache_key("historical_data", location_hash)
            
            data = self._get_from_database(cache_key)
            if data and 'patterns' in data:
                return [HistoricalPattern(**pattern) for pattern in data['patterns']]
            
        except Exception as e:
            logger.error(f"Error retrieving historical data: {e}")
        
        return None

    def _get_from_database(self, cache_key: str) -> Optional[Dict]:
        """Retrieve data from SQLite database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT data, expiry FROM cache_entries 
                WHERE cache_key = ?
            ''', (cache_key,))
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                data_json, expiry_str = result
                expiry = datetime.fromisoformat(expiry_str)
                
                # Check if cache entry is still valid
                if datetime.now() < expiry:
                    return json.loads(data_json)
                else:
                    # Remove expired entry
                    self._remove_from_database(cache_key)
            
        except Exception as e:
            logger.error(f"Error retrieving from database: {e}")
        
        return None

    def _remove_from_database(self, cache_key: str):
        """Remove expired cache entry"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM cache_entries WHERE cache_key = ?', (cache_key,))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error removing from database: {e}")

    def cleanup_expired_entries(self):
        """Remove all expired cache entries"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            current_time = datetime.now().isoformat()
            cursor.execute('DELETE FROM cache_entries WHERE expiry < ?', (current_time,))
            
            deleted_count = cursor.rowcount
            conn.commit()
            conn.close()
            
            logger.info(f"Cleaned up {deleted_count} expired cache entries")
            
        except Exception as e:
            logger.error(f"Error cleaning up cache: {e}")

    def get_cache_stats(self) -> Dict:
        """Get cache statistics"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Total entries
            cursor.execute('SELECT COUNT(*) FROM cache_entries')
            total_entries = cursor.fetchone()[0]
            
            # Entries by type
            cursor.execute('''
                SELECT data_type, COUNT(*) FROM cache_entries 
                GROUP BY data_type
            ''')
            entries_by_type = dict(cursor.fetchall())
            
            # Expired entries
            current_time = datetime.now().isoformat()
            cursor.execute('SELECT COUNT(*) FROM cache_entries WHERE expiry < ?', (current_time,))
            expired_entries = cursor.fetchone()[0]
            
            conn.close()
            
            return {
                "total_entries": total_entries,
                "entries_by_type": entries_by_type,
                "expired_entries": expired_entries,
                "cache_hit_potential": max(0, total_entries - expired_entries)
            }
            
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {}

    def clear_cache(self, data_type: str = None, location_hash: str = None):
        """Clear cache entries by type or location"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            if data_type and location_hash:
                cursor.execute('''
                    DELETE FROM cache_entries 
                    WHERE data_type = ? AND location_hash = ?
                ''', (data_type, location_hash))
            elif data_type:
                cursor.execute('DELETE FROM cache_entries WHERE data_type = ?', (data_type,))
            elif location_hash:
                cursor.execute('DELETE FROM cache_entries WHERE location_hash = ?', (location_hash,))
            else:
                cursor.execute('DELETE FROM cache_entries')
            
            deleted_count = cursor.rowcount
            conn.commit()
            conn.close()
            
            logger.info(f"Cleared {deleted_count} cache entries")
            
        except Exception as e:
            logger.error(f"Error clearing cache: {e}")

# Global instance
cache_service = CacheService()
