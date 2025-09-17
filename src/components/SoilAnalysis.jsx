import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BeakerIcon, 
  ScaleIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const SoilAnalysis = ({ soilData, locationData, voiceEnabled }) => {
  const { t } = useTranslation();

  const getSoilHealthStatus = (ph, organicCarbon, nitrogen, phosphorus, potassium) => {
    let score = 0;
    let issues = [];
    
    // pH assessment
    if (ph >= 6.0 && ph <= 7.5) score += 20;
    else if (ph < 5.5) issues.push(t('Soil is too acidic'));
    else if (ph > 8.0) issues.push(t('Soil is too alkaline'));
    
    // Organic carbon
    if (organicCarbon > 1.5) score += 20;
    else if (organicCarbon < 0.8) issues.push(t('Low organic matter'));
    
    // Nutrients
    if (nitrogen > 250) score += 20;
    else if (nitrogen < 200) issues.push(t('Nitrogen deficiency'));
    
    if (phosphorus > 25) score += 20;
    else if (phosphorus < 15) issues.push(t('Phosphorus deficiency'));
    
    if (potassium > 200) score += 20;
    else if (potassium < 150) issues.push(t('Potassium deficiency'));
    
    return { score, issues };
  };

  const getSoilTexture = (sand, clay, silt) => {
    if (clay > 40) return { type: t('Clay'), color: 'text-brown-700', bg: 'bg-brown-50' };
    if (sand > 60) return { type: t('Sandy'), color: 'text-yellow-700', bg: 'bg-yellow-50' };
    if (silt > 40) return { type: t('Silty'), color: 'text-gray-700', bg: 'bg-gray-50' };
    return { type: t('Loam'), color: 'text-green-700', bg: 'bg-green-50' };
  };

  const getNutrientStatus = (value, optimal) => {
    const ratio = value / optimal;
    if (ratio >= 0.8) return { status: t('Good'), color: 'text-green-600', bg: 'bg-green-50' };
    if (ratio >= 0.6) return { status: t('Moderate'), color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { status: t('Low'), color: 'text-red-600', bg: 'bg-red-50' };
  };

  const speakSoilData = () => {
    if (!voiceEnabled || !soilData) return;
    
    const texture = getSoilTexture(soilData.sand_content, soilData.clay_content, soilData.silt_content);
    const health = getSoilHealthStatus(soilData.ph, soilData.organic_carbon, soilData.nitrogen, soilData.phosphorus, soilData.potassium);
    
    const text = `Soil analysis results: pH is ${soilData.ph.toFixed(1)}, soil type is ${texture.type}. Organic carbon is ${soilData.organic_carbon.toFixed(1)} percent. Nitrogen level is ${soilData.nitrogen} ppm, phosphorus is ${soilData.phosphorus} ppm, and potassium is ${soilData.potassium} ppm. Overall soil health score is ${health.score} out of 100.`;
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (voiceEnabled && soilData) {
      setTimeout(speakSoilData, 2000);
    }
  }, [voiceEnabled, soilData]);

  const soilHealth = getSoilHealthStatus(
    soilData.ph, 
    soilData.organic_carbon, 
    soilData.nitrogen, 
    soilData.phosphorus, 
    soilData.potassium
  );

  const soilTexture = getSoilTexture(
    soilData.sand_content, 
    soilData.clay_content, 
    soilData.silt_content
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <BeakerIcon className="h-6 w-6 mr-2 text-green-600" />
          {t('Soil Analysis')}
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          soilHealth.score >= 80 ? 'bg-green-100 text-green-800' :
          soilHealth.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {soilHealth.score}/100
        </div>
      </div>

      {/* Soil Type */}
      <div className={`mb-6 p-4 rounded-lg ${soilTexture.bg}`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`text-lg font-semibold ${soilTexture.color}`}>
              {soilTexture.type} {t('Soil')}
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              {t('Sand')}: {soilData.sand_content.toFixed(1)}% | 
              {t('Clay')}: {soilData.clay_content.toFixed(1)}% | 
              {t('Silt')}: {soilData.silt_content.toFixed(1)}%
            </p>
          </div>
          <ScaleIcon className={`h-8 w-8 ${soilTexture.color}`} />
        </div>
      </div>

      {/* pH and Organic Matter */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-blue-900">{t('Soil pH')}</h4>
            <span className="text-2xl font-bold text-blue-700">{soilData.ph.toFixed(1)}</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (soilData.ph / 14) * 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            {soilData.ph < 6.0 ? t('Acidic') : soilData.ph > 7.5 ? t('Alkaline') : t('Neutral')}
          </p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-green-900">{t('Organic Carbon')}</h4>
            <span className="text-2xl font-bold text-green-700">{soilData.organic_carbon.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (soilData.organic_carbon / 3) * 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-green-600 mt-1">
            {soilData.organic_carbon > 1.5 ? t('Good') : soilData.organic_carbon > 0.8 ? t('Moderate') : t('Low')}
          </p>
        </div>
      </div>

      {/* Nutrient Analysis */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2" />
          {t('Nutrient Analysis')}
        </h4>
        
        <div className="space-y-3">
          {/* Nitrogen */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <span className="font-medium text-gray-900">{t('Nitrogen (N)')}</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-900">{soilData.nitrogen} ppm</span>
              <div className={`text-xs px-2 py-1 rounded-full ml-2 inline-block ${
                getNutrientStatus(soilData.nitrogen, 250).bg
              } ${getNutrientStatus(soilData.nitrogen, 250).color}`}>
                {getNutrientStatus(soilData.nitrogen, 250).status}
              </div>
            </div>
          </div>

          {/* Phosphorus */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
              <span className="font-medium text-gray-900">{t('Phosphorus (P)')}</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-900">{soilData.phosphorus} ppm</span>
              <div className={`text-xs px-2 py-1 rounded-full ml-2 inline-block ${
                getNutrientStatus(soilData.phosphorus, 30).bg
              } ${getNutrientStatus(soilData.phosphorus, 30).color}`}>
                {getNutrientStatus(soilData.phosphorus, 30).status}
              </div>
            </div>
          </div>

          {/* Potassium */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
              <span className="font-medium text-gray-900">{t('Potassium (K)')}</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-900">{soilData.potassium} ppm</span>
              <div className={`text-xs px-2 py-1 rounded-full ml-2 inline-block ${
                getNutrientStatus(soilData.potassium, 200).bg
              } ${getNutrientStatus(soilData.potassium, 200).color}`}>
                {getNutrientStatus(soilData.potassium, 200).status}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Soil Health Issues */}
      {soilHealth.issues.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-sm font-semibold text-red-800 mb-2 flex items-center">
            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
            {t('Soil Health Issues')}
          </h4>
          <ul className="text-sm text-red-700 space-y-1">
            {soilHealth.issues.map((issue, index) => (
              <li key={index}>• {issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
          <InformationCircleIcon className="h-4 w-4 mr-2" />
          {t('Soil Improvement Recommendations')}
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          {soilData.ph < 6.0 && (
            <li>• {t('Apply lime to increase soil pH')}</li>
          )}
          {soilData.ph > 7.5 && (
            <li>• {t('Add organic matter to reduce alkalinity')}</li>
          )}
          {soilData.organic_carbon < 1.0 && (
            <li>• {t('Add compost or farmyard manure to improve organic matter')}</li>
          )}
          {soilData.nitrogen < 200 && (
            <li>• {t('Apply nitrogen-rich fertilizer or grow legume cover crops')}</li>
          )}
          {soilData.phosphorus < 20 && (
            <li>• {t('Apply phosphate fertilizer or bone meal')}</li>
          )}
          {soilData.potassium < 150 && (
            <li>• {t('Apply potash fertilizer or wood ash')}</li>
          )}
          <li>• {t('Regular soil testing every 6 months is recommended')}</li>
        </ul>
      </div>
    </div>
  );
};

export default SoilAnalysis;
