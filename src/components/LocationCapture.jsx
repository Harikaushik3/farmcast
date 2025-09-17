import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MapPinIcon, 
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

const LocationCapture = ({ onLocationCapture }) => {
  const { t } = useTranslation();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualCoords, setManualCoords] = useState({ latitude: '', longitude: '' });

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError(t('Geolocation is not supported by this browser'));
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setLoading(false);
        onLocationCapture(latitude, longitude);
      },
      (error) => {
        let errorMessage;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t('Location access denied by user');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = t('Location information is unavailable');
            break;
          case error.TIMEOUT:
            errorMessage = t('Location request timed out');
            break;
          default:
            errorMessage = t('An unknown error occurred');
            break;
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const lat = parseFloat(manualCoords.latitude);
    const lon = parseFloat(manualCoords.longitude);

    if (isNaN(lat) || isNaN(lon)) {
      setError(t('Please enter valid coordinates'));
      return;
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError(t('Coordinates are out of valid range'));
      return;
    }

    setLocation({ latitude: lat, longitude: lon });
    setError(null);
    onLocationCapture(lat, lon);
  };

  const sampleLocations = [
    { name: 'Punjab, India', lat: 31.1471, lon: 75.3412 },
    { name: 'Maharashtra, India', lat: 19.7515, lon: 75.7139 },
    { name: 'Karnataka, India', lat: 15.3173, lon: 75.7139 },
    { name: 'Uttar Pradesh, India', lat: 26.8467, lon: 80.9462 }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-6">
        <MapPinIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('Capture Your Location')}
        </h2>
        <p className="text-gray-600">
          {t('We need your location to provide personalized crop recommendations')}
        </p>
      </div>

      {/* Current Location Button */}
      <div className="mb-6">
        <button
          onClick={getCurrentLocation}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {t('Getting Location...')}
            </>
          ) : (
            <>
              <GlobeAltIcon className="h-5 w-5 mr-2" />
              {t('Use Current Location')}
            </>
          )}
        </button>
      </div>

      {/* Manual Coordinates */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {t('Or Enter Coordinates Manually')}
        </h3>
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Latitude')}
              </label>
              <input
                type="number"
                step="any"
                value={manualCoords.latitude}
                onChange={(e) => setManualCoords(prev => ({ ...prev, latitude: e.target.value }))}
                placeholder="e.g., 28.6139"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Longitude')}
              </label>
              <input
                type="number"
                step="any"
                value={manualCoords.longitude}
                onChange={(e) => setManualCoords(prev => ({ ...prev, longitude: e.target.value }))}
                placeholder="e.g., 77.2090"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            {t('Use These Coordinates')}
          </button>
        </form>
      </div>

      {/* Sample Locations */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {t('Try Sample Locations')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sampleLocations.map((loc, index) => (
            <button
              key={index}
              onClick={() => {
                setLocation({ latitude: loc.lat, longitude: loc.lon });
                onLocationCapture(loc.lat, loc.lon);
              }}
              className="p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <p className="font-medium text-gray-900">{loc.name}</p>
              <p className="text-sm text-gray-600">{loc.lat}, {loc.lon}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Success Display */}
      {location && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <p className="text-green-700 font-medium">{t('Location Captured Successfully')}</p>
              <p className="text-green-600 text-sm">
                {t('Latitude')}: {location.latitude.toFixed(4)}, {t('Longitude')}: {location.longitude.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationCapture;
