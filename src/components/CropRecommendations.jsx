import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LightBulbIcon, 
  TrophyIcon,
  CurrencyDollarIcon,
  BeakerIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const CropRecommendations = ({ recommendations, locationData, voiceEnabled }) => {
  const { t } = useTranslation();
  const [expandedCrop, setExpandedCrop] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState('');

  const seasons = ['Kharif', 'Rabi', 'Summer'];

  const speakRecommendations = () => {
    if (!voiceEnabled || !recommendations?.recommendations) return;
    
    const topCrop = recommendations.recommendations[0];
    const text = `Top crop recommendation: ${topCrop.crop_name}. Expected yield is ${Math.round(topCrop.expected_yield)} kilograms per hectare. Profit margin is ${Math.round(topCrop.profit_margin)} percent. Sustainability score is ${Math.round(topCrop.sustainability_score)} out of 100.`;
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (voiceEnabled && recommendations) {
      setTimeout(speakRecommendations, 3000);
    }
  }, [voiceEnabled, recommendations]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getYieldCategory = (yield_val) => {
    if (yield_val > 5000) return { label: t('High Yield'), color: 'text-green-600' };
    if (yield_val > 2000) return { label: t('Medium Yield'), color: 'text-yellow-600' };
    return { label: t('Low Yield'), color: 'text-red-600' };
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(Math.round(num));
  };

  if (!recommendations?.recommendations) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <LightBulbIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{t('No crop recommendations available')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <LightBulbIcon className="h-6 w-6 mr-2 text-yellow-600" />
          {t('Crop Recommendations')}
        </h3>
        <div className="text-sm text-gray-600">
          📍 {recommendations.location}
        </div>
      </div>

      {/* Season Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('Filter by Season')}
        </label>
        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">{t('All Seasons')}</option>
          {seasons.map(season => (
            <option key={season} value={season}>{season}</option>
          ))}
        </select>
      </div>

      {/* Recommendations Grid */}
      <div className="space-y-4">
        {recommendations.recommendations.map((crop, index) => {
          const yieldCategory = getYieldCategory(crop.expected_yield);
          const isExpanded = expandedCrop === index;
          
          return (
            <div key={index} className={`border rounded-xl p-4 transition-all duration-200 ${
              index === 0 
                ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  {index === 0 && <TrophyIcon className="h-6 w-6 text-yellow-600 mr-2" />}
                  <h4 className="text-lg font-bold text-gray-900">{crop.crop_name}</h4>
                  {index === 0 && (
                    <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      {t('Top Pick')}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setExpandedCrop(isExpanded ? -1 : index)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-600" />
                  )}
                </button>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="flex items-center justify-center mb-1">
                    <BeakerIcon className="h-5 w-5 text-green-600 mr-1" />
                    <span className="text-sm font-medium text-gray-700">{t('Yield')}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatNumber(crop.expected_yield)}
                  </p>
                  <p className={`text-xs ${yieldCategory.color}`}>
                    kg/ha • {yieldCategory.label}
                  </p>
                </div>

                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="flex items-center justify-center mb-1">
                    <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-1" />
                    <span className="text-sm font-medium text-gray-700">{t('Profit')}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {crop.profit_margin.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-600">{t('Margin')}</p>
                </div>

                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="flex items-center justify-center mb-1">
                    <span className="text-sm font-medium text-gray-700">🌱 {t('Sustainability')}</span>
                  </div>
                  <p className={`text-lg font-bold ${getScoreColor(crop.sustainability_score).split(' ')[0]}`}>
                    {crop.sustainability_score.toFixed(0)}/100
                  </p>
                  <p className="text-xs text-gray-600">{t('Score')}</p>
                </div>

                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="flex items-center justify-center mb-1">
                    <ClockIcon className="h-5 w-5 text-blue-600 mr-1" />
                    <span className="text-sm font-medium text-gray-700">{t('Duration')}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {crop.growth_duration}
                  </p>
                  <p className="text-xs text-gray-600">{t('Days')}</p>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  {/* Planting Time */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      {t('Best Planting Time')}
                    </h5>
                    <p className="text-blue-800">{crop.best_planting_time}</p>
                  </div>

                  {/* Water Requirement */}
                  <div className="p-3 bg-cyan-50 rounded-lg">
                    <h5 className="font-semibold text-cyan-900 mb-2">
                      💧 {t('Water Requirement')}
                    </h5>
                    <p className="text-cyan-800">
                      {formatNumber(crop.water_requirement)} mm {t('per season')}
                    </p>
                  </div>

                  {/* Risk Factors */}
                  {crop.risk_factors && crop.risk_factors.length > 0 && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <h5 className="font-semibold text-red-900 mb-2 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                        {t('Risk Factors')}
                      </h5>
                      <ul className="text-red-800 text-sm space-y-1">
                        {crop.risk_factors.map((risk, riskIndex) => (
                          <li key={riskIndex}>• {risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Care Instructions */}
                  {crop.care_instructions && crop.care_instructions.length > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h5 className="font-semibold text-green-900 mb-2 flex items-center">
                        <InformationCircleIcon className="h-4 w-4 mr-2" />
                        {t('Care Instructions')}
                      </h5>
                      <ul className="text-green-800 text-sm space-y-1">
                        {crop.care_instructions.map((instruction, instIndex) => (
                          <li key={instIndex}>• {instruction}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">
          {t('Recommendation Summary')}
        </h4>
        <p className="text-sm text-gray-700">
          {t('Based on your location in')} <strong>{recommendations.location}</strong>, 
          {t('we analyzed soil conditions, weather patterns, and historical data to provide these personalized crop recommendations.')}
          {recommendations.season && (
            <span> {t('Recommendations are optimized for')} <strong>{recommendations.season}</strong> {t('season')}.</span>
          )}
        </p>
        <p className="text-xs text-gray-600 mt-2">
          {t('Generated on')}: {new Date(recommendations.generated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default CropRecommendations;
