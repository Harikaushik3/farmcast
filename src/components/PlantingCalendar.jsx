import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarIcon,
  ClockIcon,
  SunIcon,
  CloudIcon,
  BeakerIcon,
  ChartBarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const PlantingCalendar = ({ locationData, loading, setLoading }) => {
  const { t } = useTranslation();
  const [calendarData, setCalendarData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    if (locationData) {
      fetchPlantingCalendar();
    }
  }, [locationData]);

  const fetchPlantingCalendar = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8001/farmer-support/planting-calendar', {
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
        throw new Error('Failed to fetch planting calendar');
      }

      const data = await response.json();
      setCalendarData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeasonColor = (season) => {
    switch (season.toLowerCase()) {
      case 'kharif':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rabi':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'summer':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="ml-4 text-gray-600">{t('Loading planting calendar...')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{t('Error loading planting calendar')}: {error}</p>
        <button
          onClick={fetchPlantingCalendar}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {t('Retry')}
        </button>
      </div>
    );
  }

  if (!calendarData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">{t('No calendar data available')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Month Overview */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <CalendarIcon className="h-6 w-6 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-900">
            {calendarData.current_month} - {t('Current Recommendations')}
          </h3>
        </div>
        
        {calendarData.current_recommendations && calendarData.current_recommendations.length > 0 ? (
          <div className="grid gap-4">
            {calendarData.current_recommendations.map((rec, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{rec.crop} - {rec.season}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-700 text-sm mb-2">{rec.description}</p>
                <p className="text-purple-700 text-sm font-medium">{rec.action}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-4">
            <p className="text-gray-600">{t('No specific recommendations for this month')}</p>
          </div>
        )}
      </div>

      {/* Seasonal Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('Seasonal Overview')}
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CloudIcon className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-green-900">{t('Kharif Season')}</h4>
            </div>
            <p className="text-green-700 text-sm">{calendarData.seasonal_overview.kharif_season}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <SunIcon className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">{t('Rabi Season')}</h4>
            </div>
            <p className="text-blue-700 text-sm">{calendarData.seasonal_overview.rabi_season}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BeakerIcon className="h-5 w-5 text-yellow-600" />
              <h4 className="font-medium text-yellow-900">{t('Summer Season')}</h4>
            </div>
            <p className="text-yellow-700 text-sm">{calendarData.seasonal_overview.summer_season}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('current')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'current'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('Next Opportunities')}
          </button>
          <button
            onClick={() => setActiveTab('detailed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'detailed'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('Detailed Calendars')}
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'monthly'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('Monthly Activities')}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'current' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('Next Planting Opportunities')}
          </h3>
          <div className="grid gap-4">
            {calendarData.next_opportunities?.map((opportunity, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="h-6 w-6 text-purple-600" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {opportunity.crop} - {opportunity.season}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {opportunity.months_until === 0 ? t('Plant now!') : 
                         `${opportunity.months_until} ${t('months until optimal planting')}`}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeasonColor(opportunity.season)}`}>
                    {getMonthName(opportunity.optimal_month)}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{t('Preparation Start')}</p>
                    <p className="font-medium">{getMonthName(opportunity.preparation_start)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('Growth Duration')}</p>
                    <p className="font-medium">{opportunity.duration_days} {t('days')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('Harvest Months')}</p>
                    <p className="font-medium">
                      {opportunity.harvest_months.map(month => getMonthName(month)).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'detailed' && (
        <div className="space-y-6">
          {Object.entries(calendarData.detailed_calendars || {}).map(([crop, calendar]) => (
            <div key={crop} className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
                <span>{crop} {t('Planting Calendar')}</span>
              </h3>
              
              {/* Planting Windows */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">{t('Planting Windows')}</h4>
                <div className="grid gap-3">
                  {calendar.planting_windows?.map((window, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeasonColor(window.season)}`}>
                          {window.season}
                        </span>
                        <span className="text-sm text-gray-600">
                          {window.duration_days} {t('days')}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">{t('Planting Period')}</p>
                          <p className="font-medium">
                            {getMonthName(window.start_month)} - {getMonthName(window.end_month)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">{t('Optimal Month')}</p>
                          <p className="font-medium">{getMonthName(window.optimal_month)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">{t('Harvest')}</p>
                          <p className="font-medium">
                            {window.harvest_months.map(month => getMonthName(month)).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Care Schedule */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">{t('Care Schedule by Growth Stage')}</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(calendar.care_schedule || {}).map(([stage, activities]) => (
                    <div key={stage} className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-2 capitalize">
                        {stage.replace('_', ' ')} {t('Stage')}
                      </h5>
                      <ul className="space-y-1">
                        {activities.map((activity, idx) => (
                          <li key={idx} className="text-sm text-blue-800 flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'monthly' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('Year-Round Activity Calendar')}
          </h3>
          <div className="grid gap-4">
            {Object.entries(calendarData.monthly_summary || {}).map(([month, activities]) => (
              <div key={month} className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-purple-600" />
                  <span>{month}</span>
                </h4>
                
                {activities && activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                            {activity.priority}
                          </span>
                          <span className="font-medium text-gray-900">{activity.crop}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{activity.activity}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <InformationCircleIcon className="h-5 w-5" />
                    <p className="text-sm">{t('No specific activities scheduled for this month')}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          {t('Planting calendar for')}: <span className="font-medium text-gray-900">
            {calendarData.location}
          </span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {t('Generated at')}: {new Date(calendarData.generated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default PlantingCalendar;
