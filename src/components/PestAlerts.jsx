import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  BugAntIcon,
  BeakerIcon,
  CalendarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const PestAlerts = ({ locationData, loading, setLoading }) => {
  const { t } = useTranslation();
  const [alertData, setAlertData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('alerts');

  useEffect(() => {
    if (locationData) {
      fetchPestAlerts();
    }
  }, [locationData]);

  const fetchPestAlerts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8001/farmer-support/pest-alerts', {
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
        throw new Error('Failed to fetch pest alerts');
      }

      const data = await response.json();
      setAlertData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low':
        return 'bg-green-100 border-green-300 text-green-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return ExclamationTriangleIcon;
      case 'medium':
        return ShieldExclamationIcon;
      default:
        return InformationCircleIcon;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
        <p className="ml-4 text-gray-600">{t('Loading pest alerts...')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{t('Error loading pest alerts')}: {error}</p>
        <button
          onClick={fetchPestAlerts}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {t('Retry')}
        </button>
      </div>
    );
  }

  if (!alertData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">{t('No pest alert data available')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="bg-gradient-to-r from-yellow-50 to-red-50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {t('Alert Summary')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <BugAntIcon className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-gray-600">{t('Pest Alerts')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {alertData.alert_summary.total_pest_alerts}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <BeakerIcon className="h-5 w-5 text-red-500" />
              <span className="text-sm text-gray-600">{t('Disease Alerts')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {alertData.alert_summary.total_disease_alerts}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <span className="text-sm text-gray-600">{t('High Severity')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {alertData.alert_summary.high_severity_count}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <ShieldExclamationIcon className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-gray-600">{t('Crops at Risk')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {alertData.alert_summary.crops_at_risk.length}
            </p>
          </div>
        </div>
      </div>

      {/* Weather Conditions */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('Current Weather Conditions')}
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">{t('Temperature')}</p>
            <p className="text-xl font-bold text-gray-900">
              {alertData.weather_conditions.temperature}°C
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">{t('Humidity')}</p>
            <p className="text-xl font-bold text-gray-900">
              {alertData.weather_conditions.humidity}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">{t('Rainfall')}</p>
            <p className="text-xl font-bold text-gray-900">
              {alertData.weather_conditions.rainfall} mm
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'alerts'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('Active Alerts')}
          </button>
          <button
            onClick={() => setActiveTab('prevention')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'prevention'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('Prevention Calendar')}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Pest Alerts */}
          {alertData.pest_alerts && alertData.pest_alerts.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <BugAntIcon className="h-6 w-6 text-orange-500" />
                <span>{t('Pest Alerts')}</span>
              </h3>
              <div className="space-y-4">
                {alertData.pest_alerts.map((alert, index) => {
                  const SeverityIcon = getSeverityIcon(alert.severity);
                  return (
                    <div key={index} className={`rounded-xl border-2 p-6 ${getSeverityColor(alert.severity)}`}>
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <SeverityIcon className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold">{alert.pest_name}</h4>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-50">
                              {alert.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm mb-3">{alert.description}</p>
                          <p className="text-sm mb-3">
                            <strong>{t('Crop Affected')}:</strong> {alert.crop_affected}
                          </p>
                          
                          <div className="grid md:grid-cols-3 gap-4 mt-4">
                            <div>
                              <h5 className="font-medium mb-2">{t('Symptoms')}:</h5>
                              <ul className="text-sm space-y-1">
                                {alert.symptoms.map((symptom, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    {symptom}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium mb-2">{t('Prevention')}:</h5>
                              <ul className="text-sm space-y-1">
                                {alert.prevention_methods.map((method, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    {method}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium mb-2">{t('Treatment')}:</h5>
                              <ul className="text-sm space-y-1">
                                {alert.treatment_options.map((treatment, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    {treatment}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Disease Alerts */}
          {alertData.disease_alerts && alertData.disease_alerts.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <BeakerIcon className="h-6 w-6 text-red-500" />
                <span>{t('Disease Alerts')}</span>
              </h3>
              <div className="space-y-4">
                {alertData.disease_alerts.map((alert, index) => {
                  const SeverityIcon = getSeverityIcon(alert.severity);
                  return (
                    <div key={index} className={`rounded-xl border-2 p-6 ${getSeverityColor(alert.severity)}`}>
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <SeverityIcon className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold">{alert.disease_name}</h4>
                            <div className="flex items-center space-x-2">
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-50">
                                {alert.probability}% {t('Probability')}
                              </span>
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-50">
                                {alert.severity.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm mb-3">
                            <strong>{t('Crop Affected')}:</strong> {alert.crop_affected}
                          </p>
                          
                          <div className="grid md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <h5 className="font-medium mb-2">{t('Symptoms')}:</h5>
                              <ul className="text-sm space-y-1">
                                {alert.symptoms.map((symptom, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    {symptom}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium mb-2">{t('Causes')}:</h5>
                              <ul className="text-sm space-y-1">
                                {alert.causes.map((cause, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    {cause}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium mb-2">{t('Prevention')}:</h5>
                              <ul className="text-sm space-y-1">
                                {alert.prevention.map((method, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    {method}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium mb-2">{t('Treatment')}:</h5>
                              <ul className="text-sm space-y-1">
                                {alert.treatment.map((treatment, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    {treatment}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'prevention' && (
        <div className="space-y-4">
          <div className="bg-green-50 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CalendarIcon className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">
                {t('This Month\'s Prevention Activities')} - {alertData.current_month_prevention.month}
              </h3>
            </div>
            <div className="space-y-2">
              {alertData.current_month_prevention.activities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-green-800">{activity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Location Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          {t('Pest alerts for')}: <span className="font-medium text-gray-900">
            {alertData.location}
          </span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {t('Generated at')}: {new Date(alertData.generated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default PestAlerts;
