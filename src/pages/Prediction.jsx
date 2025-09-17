import { useState, useEffect } from 'react'
import { ExclamationTriangleIcon, CheckCircleIcon, LightBulbIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import farmCastAPI from '../services/api'

export default function Prediction() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    State: '',
    Crop: '',
    Crop_Year: new Date().getFullYear(),
    Season: '',
    Area: '',
    Annual_Rainfall: '',
    Fertilizer: '',
    Pesticide: ''
  })
  
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cropOptions, setCropOptions] = useState([])
  const [stateOptions, setStateOptions] = useState([])
  const [seasonOptions, setSeasonOptions] = useState([])
  const [cropSuggestions, setCropSuggestions] = useState(null)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [optionsLoading, setOptionsLoading] = useState(true)

  useEffect(() => {
    loadFormDataFromStorage()
    loadOptions()
  }, [])

  // Load options after form data is loaded
  useEffect(() => {
    if (dataLoaded && cropOptions.length > 0 && stateOptions.length > 0 && seasonOptions.length > 0) {
      // Only set defaults if no stored data exists
      if (!formData.Crop && cropOptions.length > 0) {
        setFormData(prev => ({ ...prev, Crop: cropOptions[0] }))
      }
      if (!formData.State && stateOptions.length > 0) {
        setFormData(prev => ({ ...prev, State: stateOptions[0] }))
      }
      if (!formData.Season && seasonOptions.length > 0) {
        setFormData(prev => ({ ...prev, Season: seasonOptions[0] }))
      }
    }
  }, [dataLoaded, cropOptions, stateOptions, seasonOptions, formData.Crop, formData.State, formData.Season])

  const loadFormDataFromStorage = () => {
    try {
      const storedFormData = localStorage.getItem('farmcast_form_data')
      if (storedFormData) {
        const parsedData = JSON.parse(storedFormData)
        setFormData(prev => ({ ...prev, ...parsedData }))
      }
      setDataLoaded(true)
    } catch (error) {
      console.error('Error loading form data from storage:', error)
      setDataLoaded(true)
    }
  }

  const saveFormDataToStorage = (data) => {
    try {
      localStorage.setItem('farmcast_form_data', JSON.stringify(data))
    } catch (error) {
      console.error('Error saving form data to storage:', error)
    }
  }

  const loadOptions = async () => {
    try {
      setOptionsLoading(true)
      console.log('Loading options from backend...')
      const [cropsResponse, statesResponse, seasonsResponse] = await Promise.allSettled([
        farmCastAPI.getCropOptions(),
        farmCastAPI.getStateOptions(),
        farmCastAPI.getSeasonOptions()
      ])
      
      console.log('Crops response:', cropsResponse)
      console.log('States response:', statesResponse)
      console.log('Seasons response:', seasonsResponse)
      
      if (cropsResponse.status === 'fulfilled' && cropsResponse.value?.crops) {
        console.log('Setting crop options:', cropsResponse.value.crops)
        setCropOptions(cropsResponse.value.crops)
      } else {
        console.error('Crops failed:', cropsResponse.reason)
        // Fallback crop options
        setCropOptions([
          'Rice', 'Wheat', 'Maize', 'Cotton(lint)', 'Sugarcane', 'Arhar/Tur', 
          'Gram', 'Groundnut', 'Soybean', 'Bajra', 'Jowar', 'Barley', 
          'Ragi', 'Small millets', 'Sesamum', 'Niger seed', 'Safflower'
        ])
      }
      
      if (statesResponse.status === 'fulfilled' && statesResponse.value?.states) {
        console.log('Setting state options:', statesResponse.value.states)
        setStateOptions(statesResponse.value.states)
      } else {
        console.error('States failed:', statesResponse.reason)
        // Fallback state options
        setStateOptions([
          'Andhra Pradesh', 'Assam', 'Bihar', 'Gujarat', 'Haryana', 'Karnataka', 
          'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 
          'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
        ])
      }
      
      if (seasonsResponse.status === 'fulfilled' && seasonsResponse.value?.seasons) {
        console.log('Setting season options:', seasonsResponse.value.seasons)
        setSeasonOptions(seasonsResponse.value.seasons)
      } else {
        console.error('Seasons failed:', seasonsResponse.reason)
        // Fallback season options
        setSeasonOptions(['Kharif', 'Rabi', 'Whole Year', 'Summer'])
      }
    } catch (error) {
      console.error('Error loading options:', error)
      // Set fallback options if all API calls fail
      setCropOptions([
        'Rice', 'Wheat', 'Maize', 'Cotton(lint)', 'Sugarcane', 'Arhar/Tur', 
        'Gram', 'Groundnut', 'Soybean', 'Bajra', 'Jowar', 'Barley'
      ])
      setStateOptions([
        'Andhra Pradesh', 'Assam', 'Bihar', 'Gujarat', 'Haryana', 'Karnataka', 
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 
        'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
      ])
      setSeasonOptions(['Kharif', 'Rabi', 'Whole Year', 'Summer'])
    } finally {
      setOptionsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value
    }
    setFormData(newFormData)
    saveFormDataToStorage(newFormData)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setPrediction(null)

    try {
      const result = await farmCastAPI.predictYield(formData)
      setPrediction(result)
      
      // Store prediction data for visualization page
      const predictionData = {
        crop: formData.Crop,
        state: formData.State,
        season: formData.Season,
        year: formData.Crop_Year,
        area: parseFloat(formData.Area),
        rainfall: parseFloat(formData.Annual_Rainfall),
        fertilizer: parseFloat(formData.Fertilizer),
        pesticide: parseFloat(formData.Pesticide),
        predicted_yield_tons: result.predicted_yield,
        input_conditions: {
          rainfall: parseFloat(formData.Annual_Rainfall),
          fertilizer: parseFloat(formData.Fertilizer),
          pesticide: parseFloat(formData.Pesticide)
        }
      }
      localStorage.setItem('farmcast_prediction', JSON.stringify(predictionData))
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get prediction. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getSuggestions = async () => {
    // Check if we have enough data for suggestions (excluding crop selection)
    if (!formData.State || !formData.Season || !formData.Area || !formData.Annual_Rainfall || !formData.Fertilizer || !formData.Pesticide) {
      setError('Please fill in all conditions to get crop suggestions')
      return
    }

    setSuggestionsLoading(true)
    setError('')
    setCropSuggestions(null)

    try {
      const suggestionData = {
        State: formData.State,
        Crop_Year: parseInt(formData.Crop_Year),
        Season: formData.Season,
        Area: parseFloat(formData.Area),
        Annual_Rainfall: parseFloat(formData.Annual_Rainfall),
        Fertilizer: parseFloat(formData.Fertilizer),
        Pesticide: parseFloat(formData.Pesticide)
      }

      const result = await farmCastAPI.suggestCrops(suggestionData)
      setCropSuggestions(result)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get crop suggestions. Please ensure the model is trained.')
    } finally {
      setSuggestionsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      State: stateOptions[0] || '',
      Crop: cropOptions[0] || '',
      Crop_Year: new Date().getFullYear(),
      Season: seasonOptions[0] || '',
      Area: '',
      Annual_Rainfall: '',
      Fertilizer: '',
      Pesticide: ''
    })
    setPrediction(null)
    setCropSuggestions(null)
    setError('')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('cropYieldPrediction')}</h1>
        <p className="mt-2 text-lg text-gray-600">
          {t('enterDetails')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('farmConditions', 'Farm Conditions')}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location and Crop */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('locationCropInfo', 'Location & Crop Information')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="State" className="block text-sm font-medium text-gray-700">
                    {t('state', 'State')}
                  </label>
                  <select
                    name="State"
                    id="State"
                    value={formData.State}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 bg-white border border-gray-300 text-gray-900"
                  >
                    <option value="">{t('selectState', 'Select State')}</option>
                    {stateOptions.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="Crop" className="block text-sm font-medium text-gray-700">
                    {t('cropType')}
                  </label>
                  <select
                    name="Crop"
                    id="Crop"
                    value={formData.Crop}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 bg-white border border-gray-300 text-gray-900"
                  >
                    <option value="">{t('selectCrop')}</option>
                    {cropOptions.map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="Season" className="block text-sm font-medium text-gray-700">
                    {t('season', 'Season')}
                  </label>
                  <select
                    name="Season"
                    id="Season"
                    value={formData.Season}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 bg-white border border-gray-300 text-gray-900"
                  >
                    <option value="">{t('selectSeason', 'Select Season')}</option>
                    {seasonOptions.map(season => (
                      <option key={season} value={season}>{season}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="Crop_Year" className="block text-sm font-medium text-gray-700">
                    {t('year')}
                  </label>
                  <input
                    type="number"
                    name="Crop_Year"
                    id="Crop_Year"
                    min="1990"
                    max="2030"
                    value={formData.Crop_Year}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="2024"
                  />
                </div>
              </div>
            </div>

            {/* Farm Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('farmDetails', 'Farm Details')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="Area" className="block text-sm font-medium text-gray-700">
                    {t('cultivationArea', 'Cultivation Area (hectares)')}
                  </label>
                  <input
                    type="number"
                    name="Area"
                    id="Area"
                    step="0.1"
                    min="0.1"
                    value={formData.Area}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="10.5"
                  />
                </div>
                <div>
                  <label htmlFor="Annual_Rainfall" className="block text-sm font-medium text-gray-700">
                    {t('annualRainfall', 'Annual Rainfall (mm)')}
                  </label>
                  <input
                    type="number"
                    name="Annual_Rainfall"
                    id="Annual_Rainfall"
                    step="1"
                    min="0"
                    max="5000"
                    value={formData.Annual_Rainfall}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="1200"
                  />
                </div>
                <div>
                  <label htmlFor="Fertilizer" className="block text-sm font-medium text-gray-700">
                    {t('fertilizer', 'Fertilizer Usage (kg/ha)')}
                  </label>
                  <input
                    type="number"
                    name="Fertilizer"
                    id="Fertilizer"
                    step="0.1"
                    min="0"
                    value={formData.Fertilizer}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="150"
                  />
                </div>
                <div>
                  <label htmlFor="Pesticide" className="block text-sm font-medium text-gray-700">
                    {t('pesticide', 'Pesticide Usage (kg/ha)')}
                  </label>
                  <input
                    type="number"
                    name="Pesticide"
                    id="Pesticide"
                    step="0.1"
                    min="0"
                    value={formData.Pesticide}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="25"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col space-y-3">
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('loading') : t('getPrediction')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  {t('reset', 'Reset')}
                </button>
              </div>
              
              {/* Crop Suggestions Button */}
              <button
                type="button"
                onClick={getSuggestions}
                disabled={suggestionsLoading || !formData.State || !formData.Season || !formData.Area || !formData.Annual_Rainfall || !formData.Fertilizer || !formData.Pesticide}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <LightBulbIcon className="h-5 w-5 mr-2" />
                {suggestionsLoading ? t('gettingSuggestions', 'Getting Suggestions...') : t('getBestCropSuggestions', 'Get Best Crop Suggestions')}
              </button>
            </div>
          </form>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{t('predictionError', 'Prediction Error')}</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Prediction Results */}
          {prediction && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">{t('predictionResults', 'Prediction Results')}</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-sm text-primary-600 font-medium">{t('predictedYield')}</p>
                    <p className="text-3xl font-bold text-primary-900">
                      {prediction.predicted_yield.toFixed(2)} tons/ha
                    </p>
                    <p className="text-sm text-primary-600 mt-1">
                      {t('confidence')}: {(prediction.confidence_score * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Yield Category */}
                <div className="text-center">
                  {prediction.predicted_yield >= 10.0 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {t('excellentYield', 'Excellent Yield')}
                    </span>
                  )}
                  {prediction.predicted_yield >= 5.0 && prediction.predicted_yield < 10.0 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      {t('goodYield', 'Good Yield')}
                    </span>
                  )}
                  {prediction.predicted_yield < 5.0 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      {t('belowAverageYield', 'Below Average Yield')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Crop Suggestions */}
          {cropSuggestions && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <LightBulbIcon className="h-6 w-6 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">{t('bestCropSuggestions', 'Best Crop Suggestions')}</h3>
              </div>
              
              <div className="mb-4 text-sm text-gray-600">
                Based on your conditions: {cropSuggestions.conditions_summary.state}, {cropSuggestions.conditions_summary.season} season, {cropSuggestions.conditions_summary.area}ha, {cropSuggestions.conditions_summary.rainfall}mm rainfall
              </div>
              
              <div className="space-y-4">
                {cropSuggestions.suggested_crops.map((crop, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 text-sm font-medium rounded-full mr-3">
                          {crop.rank}
                        </span>
                        <h4 className="text-lg font-medium text-gray-900">{crop.crop}</h4>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          crop.yield_category === 'Excellent' ? 'bg-green-100 text-green-800' :
                          crop.yield_category === 'Good' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {crop.yield_category}
                        </span>
                      </div>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, Crop: crop.crop }))}
                        className="text-sm bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700"
                      >
                        {t('select', 'Select')}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-500">{t('predictedYield')}</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {crop.predicted_yield_tons?.toFixed(2)} tons/ha
                        </p>
                      </div>
                      {crop.avg_historical_yield_tons && (
                        <div>
                          <p className="text-sm text-gray-500">{t('historicalAverage', 'Historical Average')}</p>
                          <p className="text-lg font-semibold text-gray-700">
                            {crop.avg_historical_yield_tons.toFixed(2)} tons/ha
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 italic">{crop.growing_tip}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                Analyzed {cropSuggestions.total_crops_analyzed} crops to find the best options for your conditions.
              </div>
            </div>
          )}

          {/* Optimization Tips */}
          {prediction && prediction.optimization_tips && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <LightBulbIcon className="h-6 w-6 text-yellow-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">{t('optimizationTips', 'Optimization Tips')}</h3>
              </div>
              
              <ul className="space-y-3">
                {prediction.optimization_tips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3"></div>
                    <p className="text-sm text-gray-700">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sample Data Helper */}
          {!prediction && !loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">{t('sampleValues', 'Sample Values')}</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Area:</strong> 0.5-100 hectares (cultivation area)</p>
                <p><strong>Rainfall:</strong> 500-3000mm/year (depends on crop and region)</p>
                <p><strong>Fertilizer:</strong> 50-300 kg/ha (nutrient application)</p>
                <p><strong>Pesticide:</strong> 5-50 kg/ha (crop protection)</p>
                <p><strong>Examples:</strong> Rice-Kharif: 10ha, 1200mm, 150kg/ha fertilizer, 25kg/ha pesticide</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
