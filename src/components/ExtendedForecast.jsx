import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CloudIcon,
  SunIcon,
  EyeIcon,
  ArrowPathIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

const ExtendedForecast = ({ locationData, loading, setLoading }) => {
  const { t } = useTranslation();
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (locationData) {
      fetchExtendedForecast();
    }
  }, [locationData]);

  const fetchExtendedForecast = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8001/farmer-support/extended-forecast', {
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

      if (!response.ok) {
        throw new Error('Failed to fetch extended forecast');
      }

      const data = await response.json();
      setForecastData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (conditions) => {
    switch (conditions.toLowerCase()) {
      case 'rainy':
        return CloudIcon;
      case 'cloudy':
        return CloudIcon;
      case 'clear':
        return SunIcon;
      default:
        return CloudIcon;
    }
  };

  const getConditionColor = (conditions) => {
    switch (conditions.toLowerCase()) {
      case 'rainy':
        return 'text-blue-600 bg-blue-100';
      case 'cloudy':
        return 'text-gray-600 bg-gray-100';
      case 'clear':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">{t('Loading extended forecast...')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{t('Error loading forecast')}: {error}</p>
        <button
          onClick={fetchExtendedForecast}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {t('Retry')}
        </button>
      </div>
    );
  }

  if (!forecastData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">{t('No forecast data available')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {t('7-Day Weather Summary')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <SunIcon className="h-5 w-5 text-red-500" />
              <span className="text-sm text-gray-600">{t('Avg Temperature')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {forecastData.summary.avg_temperature?.toFixed(1)}°C
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <BeakerIcon className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-600">{t('Total Rainfall')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {forecastData.summary.total_expected_rainfall?.toFixed(1)} mm
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CloudIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">{t('Rainy Days')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {forecastData.summary.rainy_days}
            </p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>{t('General Advice')}:</strong> {forecastData.summary.general_advice}
          </p>
        </div>
      </div>

      {/* Daily Forecasts */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {t('Daily Forecast Details')}
        </h3>
        <div className="grid gap-4">
          {forecastData.daily_forecasts?.map((day, index) => {
            const WeatherIcon = getWeatherIcon(day.conditions);
            const conditionColor = getConditionColor(day.conditions);
            
            return (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${conditionColor}`}>
                      <WeatherIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {day.day_name}
                      </h4>
                      <p className="text-sm text-gray-600">{day.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {day.max_temp}° / {day.min_temp}°
                    </p>
                    <p className="text-sm text-gray-600 capitalize">{day.conditions}</p>
                  </div>
                </div>

                {/* Weather Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <BeakerIcon className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-600">{t('Humidity')}</p>
                      <p className="font-medium">{day.avg_humidity?.toFixed(0)}%</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CloudIcon className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">{t('Rainfall')}</p>
                      <p className="font-medium">{day.total_rainfall?.toFixed(1)} mm</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowPathIcon className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">{t('Wind Speed')}</p>
                      <p className="font-medium">{day.avg_wind_speed?.toFixed(1)} m/s</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <EyeIcon className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-600">{t('Conditions')}</p>
                      <p className="font-medium capitalize">{day.conditions}</p>
                    </div>
                  </div>
                </div>

                {/* Farming Advice */}
                {day.farming_advice && day.farming_advice.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h5 className="font-medium text-green-900 mb-2">
                      {t('Farming Advice for')} {day.day_name}:
                    </h5>
                    <ul className="space-y-1">
                      {day.farming_advice.map((advice, adviceIndex) => (
                        <li key={adviceIndex} className="text-sm text-green-800 flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          {advice}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Location Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          {t('Forecast for')}: <span className="font-medium text-gray-900">
            {forecastData.location}
          </span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {t('Generated at')}: {new Date(forecastData.generated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default ExtendedForecast;
