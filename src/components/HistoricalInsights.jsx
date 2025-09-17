import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CloudIcon,
  SunIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const HistoricalInsights = ({ historicalData, locationData, voiceEnabled }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('trends');

  const speakHistoricalData = () => {
    if (!voiceEnabled || !historicalData) return;
    
    const topTrend = historicalData.yield_trends?.[0];
    const text = topTrend 
      ? `Historical analysis shows ${topTrend.crop} has a ${topTrend.trend_direction} yield trend with ${Math.abs(topTrend.trend_percentage).toFixed(1)} percent change per year. Next year's predicted yield is ${Math.round(topTrend.prediction_next_year)} kilograms per hectare.`
      : 'Historical analysis completed for your location.';
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (voiceEnabled && historicalData) {
      setTimeout(speakHistoricalData, 4000);
    }
  }, [voiceEnabled, historicalData]);

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'increasing':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />;
      case 'decreasing':
        return <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />;
      default:
        return <MinusIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTrendColor = (direction) => {
    switch (direction) {
      case 'increasing':
        return 'text-green-600 bg-green-50';
      case 'decreasing':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatYieldData = (trends) => {
    if (!trends || trends.length === 0) return [];
    
    const allYears = [...new Set(trends.flatMap(trend => trend.years))].sort();
    
    return allYears.map(year => {
      const yearData = { year };
      trends.forEach(trend => {
        const yearIndex = trend.years.indexOf(year);
        if (yearIndex !== -1) {
          yearData[trend.crop] = trend.yields[yearIndex];
        }
      });
      return yearData;
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (!historicalData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{t('No historical data available')}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'trends', label: t('Yield Trends'), icon: ArrowTrendingUpIcon },
    { id: 'seasonal', label: t('Seasonal Insights'), icon: CalendarIcon },
    { id: 'climate', label: t('Climate Patterns'), icon: CloudIcon }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <ChartBarIcon className="h-6 w-6 mr-2 text-purple-600" />
          {t('Historical Insights')}
        </h3>
        <div className="text-sm text-gray-600">
          📍 {historicalData.location} • {historicalData.years_analyzed} {t('years')}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Yield Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Trend Summary Cards */}
          {historicalData.yield_trends && historicalData.yield_trends.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {historicalData.yield_trends.slice(0, 6).map((trend, index) => (
                <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{trend.crop}</h4>
                    {getTrendIcon(trend.trend_direction)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(trend.trend_direction)}`}>
                      {trend.trend_direction === 'increasing' ? '↗' : trend.trend_direction === 'decreasing' ? '↘' : '→'} 
                      {Math.abs(trend.trend_percentage).toFixed(1)}% {t('per year')}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>{t('Current')}: {trend.yields[trend.yields.length - 1]?.toFixed(0)} kg/ha</p>
                      <p>{t('Predicted')}: {trend.prediction_next_year.toFixed(0)} kg/ha</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Yield Trends Chart */}
          {historicalData.yield_trends && historicalData.yield_trends.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('Yield Trends Over Time')}</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formatYieldData(historicalData.yield_trends)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis label={{ value: t('Yield (kg/ha)'), angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      formatter={(value, name) => [`${value?.toFixed(0)} kg/ha`, name]}
                      labelFormatter={(year) => `${t('Year')}: ${year}`}
                    />
                    {historicalData.yield_trends.slice(0, 5).map((trend, index) => (
                      <Line 
                        key={trend.crop}
                        type="monotone" 
                        dataKey={trend.crop} 
                        stroke={COLORS[index % COLORS.length]} 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Seasonal Insights Tab */}
      {activeTab === 'seasonal' && (
        <div className="space-y-6">
          {historicalData.seasonal_insights && historicalData.seasonal_insights.map((season, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                  {season.season} {t('Season')}
                </h4>
                <div className="text-sm text-gray-600">
                  {t('Planting')}: {t('Month')} {season.optimal_planting_window[0]}-{season.optimal_planting_window[1]}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recommended Crops */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">{t('Top Recommended Crops')}</h5>
                  <div className="space-y-2">
                    {season.recommended_crops.slice(0, 5).map((crop, cropIndex) => {
                      const avgYield = season.average_yield[crop] || 0;
                      const successRate = season.success_rate[crop] || 0;
                      
                      return (
                        <div key={cropIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{crop}</span>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              {avgYield.toFixed(0)} kg/ha
                            </p>
                            <p className="text-xs text-gray-600">
                              {(successRate * 100).toFixed(0)}% {t('success')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Risk Factors */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-2 text-red-500" />
                    {t('Seasonal Risk Factors')}
                  </h5>
                  <div className="space-y-2">
                    {season.risk_factors.map((risk, riskIndex) => (
                      <div key={riskIndex} className="p-2 bg-red-50 text-red-700 text-sm rounded-lg">
                        • {risk}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Climate Patterns Tab */}
      {activeTab === 'climate' && historicalData.climate_patterns && (
        <div className="space-y-6">
          {/* Temperature Trends */}
          <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <SunIcon className="h-5 w-5 mr-2 text-orange-600" />
              {t('Temperature Patterns')}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(historicalData.climate_patterns.temperature_trend).map(([season, temp]) => (
                <div key={season} className="text-center p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-gray-700 capitalize">{season}</p>
                  <p className="text-xl font-bold text-orange-700">{temp.toFixed(1)}°C</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rainfall Patterns */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CloudIcon className="h-5 w-5 mr-2 text-blue-600" />
              {t('Rainfall Patterns')}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(historicalData.climate_patterns.rainfall_pattern).map(([season, rainfall]) => (
                <div key={season} className="text-center p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-gray-700 capitalize">{season}</p>
                  <p className="text-xl font-bold text-blue-700">{rainfall.toFixed(0)} mm</p>
                </div>
              ))}
            </div>
          </div>

          {/* Extreme Events */}
          {historicalData.climate_patterns.extreme_events && historicalData.climate_patterns.extreme_events.length > 0 && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                {t('Extreme Weather Events')}
              </h4>
              <div className="space-y-3">
                {historicalData.climate_patterns.extreme_events.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <p className="font-medium text-red-900 capitalize">{event.type}</p>
                      <p className="text-sm text-red-700">{t('Impact')}: {event.impact}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-900">
                        {(event.frequency * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-red-600">{t('Frequency')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Climate Zone Shift */}
          {historicalData.climate_patterns.climate_zone_shift && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="text-lg font-semibold text-yellow-900 mb-2 flex items-center">
                <InformationCircleIcon className="h-5 w-5 mr-2" />
                {t('Climate Zone Analysis')}
              </h4>
              <p className="text-yellow-800">
                {t('Climate zone shift detected')}: {historicalData.climate_patterns.climate_zone_shift}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">
          {t('Historical Analysis Summary')}
        </h4>
        <p className="text-sm text-gray-700">
          {t('Analysis based on')} {historicalData.years_analyzed} {t('years of historical data for')} {historicalData.location}. 
          {t('This includes yield trends, seasonal patterns, and climate analysis to help optimize your farming decisions.')}
        </p>
        <p className="text-xs text-gray-600 mt-2">
          {t('Generated on')}: {new Date(historicalData.generated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default HistoricalInsights;
