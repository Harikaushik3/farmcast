import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const MarketPrices = ({ locationData, loading, setLoading }) => {
  const { t } = useTranslation();
  const [marketData, setMarketData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);

  useEffect(() => {
    if (locationData) {
      fetchMarketPrices();
    }
  }, [locationData]);

  const fetchMarketPrices = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8001/farmer-support/market-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: locationData.latitude,
          longitude: locationData.longitude
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch market prices');
      }

      const data = await response.json();
      setMarketData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return ArrowTrendingUpIcon;
      case 'down':
        return ArrowTrendingDownIcon;
      default:
        return MinusIcon;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-100';
      case 'down':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default:
        return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="ml-4 text-gray-600">{t('Loading market prices...')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{t('Error loading market prices')}: {error}</p>
        <button
          onClick={fetchMarketPrices}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {t('Retry')}
        </button>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">{t('No market data available')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Price Alerts */}
      {marketData.price_alerts && marketData.price_alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-900">
              {t('Price Alerts')}
            </h3>
          </div>
          <div className="space-y-3">
            {marketData.price_alerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getAlertSeverityColor(alert.severity)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{alert.crop}</p>
                    <p className="text-sm">{alert.message}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{alert.current_price}/kg</p>
                    <p className="text-sm">
                      {alert.change_percentage > 0 ? '+' : ''}{alert.change_percentage}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Prices Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {t('Current Market Prices')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketData.current_prices?.map((price, index) => {
            const TrendIcon = getTrendIcon(price.trend);
            const trendColor = getTrendColor(price.trend);
            
            return (
              <div 
                key={index} 
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setSelectedCrop(price.crop_name)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {price.crop_name}
                  </h4>
                  <div className={`p-2 rounded-full ${trendColor}`}>
                    <TrendIcon className="h-4 w-4" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold text-gray-900">
                      {price.price_per_kg}
                    </span>
                    <span className="text-gray-600">/{t('kg')}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{price.market_name}</span>
                    <span className={`font-medium ${
                      price.change_percentage > 0 ? 'text-green-600' : 
                      price.change_percentage < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {price.change_percentage > 0 ? '+' : ''}{price.change_percentage}%
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    {t('Updated')}: {new Date(price.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Market Trends */}
      {marketData.market_trends && Object.keys(marketData.market_trends).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {t('Market Trends')}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(marketData.market_trends).map(([crop, trend]) => (
              <div key={crop} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  <h4 className="text-lg font-semibold text-gray-900">{crop}</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">{t('Monthly Average')}</p>
                    <p className="text-lg font-bold text-gray-900">₹{trend.monthly_average}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('Next Week Forecast')}</p>
                    <p className="text-lg font-bold text-blue-600">₹{trend.forecast_next_week}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('Seasonal High')}</p>
                    <p className="text-lg font-bold text-green-600">₹{trend.seasonal_high}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('Seasonal Low')}</p>
                    <p className="text-lg font-bold text-red-600">₹{trend.seasonal_low}</p>
                  </div>
                </div>

                {/* Weekly Price Trend */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">{t('Weekly Trend')}</p>
                  <div className="flex items-end space-x-1 h-16">
                    {trend.weekly_prices.map((price, index) => {
                      const maxPrice = Math.max(...trend.weekly_prices);
                      const height = (price / maxPrice) * 100;
                      return (
                        <div
                          key={index}
                          className="bg-blue-500 rounded-t flex-1 min-h-[4px] opacity-70 hover:opacity-100 transition-opacity"
                          style={{ height: `${height}%` }}
                          title={`Day ${index + 1}: ₹${price}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Crops */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('Available Crops for Price Tracking')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {marketData.available_crops?.map((crop, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200"
            >
              {crop}
            </span>
          ))}
        </div>
      </div>

      {/* Location Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          {t('Market prices for')}: <span className="font-medium text-gray-900">
            {marketData.location}
          </span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {t('Generated at')}: {new Date(marketData.generated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default MarketPrices;
