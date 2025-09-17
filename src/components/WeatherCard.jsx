import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CloudIcon, 
  SunIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const WeatherCard = ({ weatherData, locationData, voiceEnabled }) => {
  const { t } = useTranslation();
  const [forecast, setForecast] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  const fetchForecast = async () => {
    if (!locationData) return;
    
    setLoadingForecast(true);
    try {
      const response = await fetch('http://127.0.0.1:8001/farmer-support/weather-forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          latitude: locationData.latitude, 
          longitude: locationData.longitude, 
          days: 7 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setForecast(data.forecast);
      }
    } catch (error) {
      console.error('Error fetching forecast:', error);
    } finally {
      setLoadingForecast(false);
    }
  };

  useEffect(() => {
    if (locationData) {
      fetchForecast();
    }
  }, [locationData]);

  const getWeatherIcon = (temp, humidity, rainfall) => {
    if (rainfall > 5) return CloudIcon;
    if (temp > 30) return SunIcon;
    return CloudIcon;
  };

  const getWeatherCondition = (temp, humidity, rainfall) => {
    if (rainfall > 10) return t('Rainy');
    if (temp > 35) return t('Hot');
    if (temp < 15) return t('Cold');
    if (humidity > 80) return t('Humid');
    return t('Pleasant');
  };

  const WeatherIcon = getWeatherIcon(weatherData.temperature, weatherData.humidity, weatherData.rainfall);

  const speakWeatherData = () => {
    if (!voiceEnabled || !weatherData) return;
    
    const text = `Current weather: ${weatherData.temperature} degrees celsius, ${weatherData.humidity}% humidity, ${weatherData.rainfall} mm rainfall. Wind speed is ${weatherData.wind_speed} meters per second.`;
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (voiceEnabled && weatherData) {
      setTimeout(speakWeatherData, 1000);
    }
  }, [voiceEnabled, weatherData]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <CloudIcon className="h-6 w-6 mr-2 text-blue-600" />
          {t('Current Weather')}
        </h3>
        <button
          onClick={fetchForecast}
          disabled={loadingForecast}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title={t('Refresh Forecast')}
        >
          <ArrowPathIcon className={`h-5 w-5 ${loadingForecast ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {locationData && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            📍 {locationData.address}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {t('Climate Zone')}: {locationData.climatic_zone}
          </p>
        </div>
      )}

      {/* Current Weather */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
          <SunIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-orange-700">{weatherData.temperature}°C</p>
          <p className="text-sm text-orange-600">{t('Temperature')}</p>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
          <EyeIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-700">{weatherData.humidity}%</p>
          <p className="text-sm text-blue-600">{t('Humidity')}</p>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
          <CloudIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-700">{weatherData.rainfall} mm</p>
          <p className="text-sm text-green-600">{t('Rainfall')}</p>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
          <CloudIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-700">{weatherData.wind_speed} m/s</p>
          <p className="text-sm text-purple-600">{t('Wind Speed')}</p>
        </div>
      </div>

      {/* Weather Condition */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-center">
          <WeatherIcon className="h-12 w-12 text-gray-600 mr-3" />
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">
              {getWeatherCondition(weatherData.temperature, weatherData.humidity, weatherData.rainfall)}
            </p>
            <p className="text-sm text-gray-600">
              {t('Evapotranspiration')}: {weatherData.evapotranspiration.toFixed(1)} mm/day
            </p>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      {forecast && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            {t('7-Day Forecast')}
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {forecast.slice(0, 14).map((day, index) => {
              const date = new Date(day.timestamp);
              const isToday = index === 0;
              
              return (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                  isToday ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center">
                    <div className="text-sm">
                      <p className={`font-medium ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                        {isToday ? t('Today') : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className={`text-xs ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                        {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className={`text-sm font-medium ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                        {day.temperature}°C
                      </p>
                      <p className={`text-xs ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                        {day.humidity}%
                      </p>
                    </div>
                    
                    {day.rainfall > 0 && (
                      <div className="text-center">
                        <CloudIcon className="h-4 w-4 text-blue-500 mx-auto" />
                        <p className="text-xs text-blue-600">{day.rainfall}mm</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Farming Recommendations */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2">
          {t('Weather-Based Recommendations')}
        </h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          {weatherData.rainfall > 20 && (
            <li>• {t('Heavy rainfall expected - ensure proper drainage')}</li>
          )}
          {weatherData.temperature > 35 && (
            <li>• {t('High temperature - provide shade for sensitive crops')}</li>
          )}
          {weatherData.humidity > 80 && (
            <li>• {t('High humidity - monitor for fungal diseases')}</li>
          )}
          {weatherData.wind_speed > 10 && (
            <li>• {t('Strong winds - secure tall crops and structures')}</li>
          )}
          {weatherData.evapotranspiration > 6 && (
            <li>• {t('High evapotranspiration - increase irrigation frequency')}</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default WeatherCard;
