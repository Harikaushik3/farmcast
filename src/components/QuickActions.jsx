import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CloudIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XMarkIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import ExtendedForecast from './ExtendedForecast';
import MarketPrices from './MarketPrices';
import PestAlerts from './PestAlerts';
import PlantingCalendar from './PlantingCalendar';

const QuickActions = ({ isOpen, onClose, locationData, initialAction = null }) => {
  const { t } = useTranslation();
  const [activeAction, setActiveAction] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle initial action from voice assistant
  useEffect(() => {
    if (initialAction && isOpen) {
      setActiveAction(initialAction);
    }
  }, [initialAction, isOpen]);

  const quickActions = [
    {
      id: 'forecast',
      title: t('7-Day Forecast'),
      description: t('Extended weather forecast with farming advice'),
      icon: CloudIcon,
      color: 'blue',
      component: ExtendedForecast
    },
    {
      id: 'market',
      title: t('Market Prices'),
      description: t('Current crop prices and market trends'),
      icon: ArrowTrendingUpIcon,
      color: 'green',
      component: MarketPrices
    },
    {
      id: 'pest',
      title: t('Pest Alerts'),
      description: t('Pest and disease warnings for your area'),
      icon: ExclamationTriangleIcon,
      color: 'yellow',
      component: PestAlerts
    },
    {
      id: 'calendar',
      title: t('Planting Calendar'),
      description: t('Seasonal planting schedule and recommendations'),
      icon: ClockIcon,
      color: 'purple',
      component: PlantingCalendar
    }
  ];

  const handleActionClick = (action) => {
    setActiveAction(action);
  };

  const handleBack = () => {
    setActiveAction(null);
  };

  if (activeAction) {
    const ActionComponent = activeAction.component;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <ChevronRightIcon className="h-5 w-5 rotate-180" />
                </button>
                <activeAction.icon className="h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-bold">{activeAction.title}</h2>
                  <p className="text-blue-100">{activeAction.description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <ActionComponent 
              locationData={locationData}
              loading={loading}
              setLoading={setLoading}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{t('Quick Actions')}</h2>
              <p className="text-blue-100">
                {t('Access key farming tools and information')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className={`p-6 rounded-xl border-2 border-${action.color}-200 hover:border-${action.color}-400 
                  bg-${action.color}-50 hover:bg-${action.color}-100 transition-all duration-200 
                  transform hover:scale-105 text-left group`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 bg-${action.color}-500 text-white rounded-lg group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold text-${action.color}-900 mb-2`}>
                      {action.title}
                    </h3>
                    <p className={`text-${action.color}-700 text-sm`}>
                      {action.description}
                    </p>
                    <div className="flex items-center mt-3">
                      <span className={`text-${action.color}-600 text-sm font-medium`}>
                        {t('View Details')}
                      </span>
                      <ChevronRightIcon className={`h-4 w-4 text-${action.color}-600 ml-1 group-hover:translate-x-1 transition-transform`} />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Location Info */}
          {locationData && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {t('Showing information for')}: <span className="font-medium text-gray-900">
                  {locationData.district}, {locationData.state}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
