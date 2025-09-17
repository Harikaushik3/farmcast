import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MapPinIcon, 
  CloudIcon, 
  BeakerIcon,
  ChartBarIcon,
  LightBulbIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';
import LocationCapture from '../components/LocationCapture';
import WeatherCard from '../components/WeatherCard';
import SoilAnalysis from '../components/SoilAnalysis';
import CropRecommendations from '../components/CropRecommendations';
import HistoricalInsights from '../components/HistoricalInsights';
import VoiceAssistant from '../components/VoiceAssistant';
import QuickActions from '../components/QuickActions';

const FarmerSupport = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [locationData, setLocationData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [soilData, setSoilData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [quickActionType, setQuickActionType] = useState(null);

  const steps = [
    { id: 'location', title: t('Location Detection'), icon: MapPinIcon, completed: false },
    { id: 'weather', title: t('Weather Analysis'), icon: CloudIcon, completed: false },
    { id: 'soil', title: t('Soil Analysis'), icon: BeakerIcon, completed: false },
    { id: 'recommendations', title: t('Crop Recommendations'), icon: LightBulbIcon, completed: false },
    { id: 'insights', title: t('Historical Insights'), icon: ChartBarIcon, completed: false }
  ];

  const [stepStatus, setStepStatus] = useState(steps.map(step => ({ ...step })));

  const handleLocationCapture = async (latitude, longitude) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch comprehensive location data
      const response = await fetch('http://127.0.0.1:8001/farmer-support/location-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const data = await response.json();
      setLocationData(data.location);
      setWeatherData(data.weather);
      setSoilData(data.soil);

      // Update step status
      updateStepStatus(0, true);
      updateStepStatus(1, true);
      updateStepStatus(2, true);
      
      // Move to recommendations step
      setCurrentStep(3);
      
      // Fetch crop recommendations
      await fetchCropRecommendations(latitude, longitude);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCropRecommendations = async (latitude, longitude, season = null) => {
    try {
      const response = await fetch('http://127.0.0.1:8001/farmer-support/crop-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude, season }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch crop recommendations');
      }

      const data = await response.json();
      setRecommendations(data);
      
      updateStepStatus(3, true);
      setCurrentStep(4);
      
      // Fetch historical insights
      await fetchHistoricalInsights(latitude, longitude);
      
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchHistoricalInsights = async (latitude, longitude) => {
    try {
      const response = await fetch('http://127.0.0.1:8001/farmer-support/historical-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude, years_back: 5 }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch historical insights');
      }

      const data = await response.json();
      setHistoricalData(data);
      
      updateStepStatus(4, true);
      
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStepStatus = (stepIndex, completed) => {
    setStepStatus(prev => 
      prev.map((step, index) => 
        index === stepIndex ? { ...step, completed } : step
      )
    );
  };

  const resetAnalysis = () => {
    setCurrentStep(0);
    setLocationData(null);
    setWeatherData(null);
    setSoilData(null);
    setRecommendations(null);
    setHistoricalData(null);
    setError(null);
    setStepStatus(steps.map(step => ({ ...step, completed: false })));
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('Intelligent Farmer Support')}
              </h1>
              <p className="text-gray-600">
                {t('Get personalized crop recommendations based on your location, weather, and soil conditions')}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleVoice}
                className={`p-3 rounded-full transition-colors ${
                  voiceEnabled 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}
                title={t('Toggle Voice Assistant')}
              >
                <SpeakerWaveIcon className="h-6 w-6" />
              </button>
              <button
                onClick={resetAnalysis}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('New Analysis')}
              </button>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            {stepStatus.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                  step.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : currentStep === index
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }`}>
                  {step.completed ? (
                    <CheckCircleIcon className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-6 w-6" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    step.completed ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < stepStatus.length - 1 && (
                  <div className={`w-16 h-1 mx-4 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="ml-4 text-gray-600">{t('Analyzing your location and conditions...')}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location Capture */}
          {currentStep === 0 && (
            <div className="lg:col-span-2">
              <LocationCapture onLocationCapture={handleLocationCapture} />
            </div>
          )}

          {/* Weather and Soil Data */}
          {weatherData && (
            <WeatherCard 
              weatherData={weatherData} 
              locationData={locationData}
              voiceEnabled={voiceEnabled}
            />
          )}

          {soilData && (
            <SoilAnalysis 
              soilData={soilData} 
              locationData={locationData}
              voiceEnabled={voiceEnabled}
            />
          )}

          {/* Crop Recommendations */}
          {recommendations && (
            <div className="lg:col-span-2">
              <CropRecommendations 
                recommendations={recommendations}
                locationData={locationData}
                voiceEnabled={voiceEnabled}
              />
            </div>
          )}

          {/* Historical Insights */}
          {historicalData && (
            <div className="lg:col-span-2">
              <HistoricalInsights 
                historicalData={historicalData}
                locationData={locationData}
                voiceEnabled={voiceEnabled}
              />
            </div>
          )}
        </div>

        {/* Voice Assistant */}
        {voiceEnabled && (
          <VoiceAssistant 
            locationData={locationData}
            weatherData={weatherData}
            soilData={soilData}
            recommendations={recommendations}
            historicalData={historicalData}
            onQuickAction={(action) => {
              setQuickActionType(action);
              setShowQuickActions(true);
            }}
          />
        )}

        {/* Quick Actions */}
        {locationData && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('Quick Actions')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => setShowQuickActions(true)}
                className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors"
              >
                <CloudIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-700">{t('7-Day Forecast')}</p>
              </button>
              <button 
                onClick={() => setShowQuickActions(true)}
                className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors"
              >
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-700">{t('Market Prices')}</p>
              </button>
              <button 
                onClick={() => setShowQuickActions(true)}
                className="p-4 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100 transition-colors"
              >
                <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-yellow-700">{t('Pest Alerts')}</p>
              </button>
              <button 
                onClick={() => setShowQuickActions(true)}
                className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors"
              >
                <ClockIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-purple-700">{t('Planting Calendar')}</p>
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions Modal */}
        {showQuickActions && (
          <QuickActions 
            isOpen={showQuickActions}
            onClose={() => {
              setShowQuickActions(false);
              setQuickActionType(null);
            }}
            locationData={locationData}
            initialAction={quickActionType}
          />
        )}
      </div>
    </div>
  );
};

export default FarmerSupport;
