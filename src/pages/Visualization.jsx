import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from 'recharts'
import { useTranslation } from 'react-i18next'
import farmCastAPI from '../services/api'

export default function Visualization() {
  const { t } = useTranslation()
  const [cropOptions, setCropOptions] = useState([])
  const [areaOptions, setAreaOptions] = useState([])
  const [selectedCrop, setSelectedCrop] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [historicalData, setHistoricalData] = useState([])
  const [predictionsData, setPredictionsData] = useState([])
  const [customPrediction, setCustomPrediction] = useState(null)
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  useEffect(() => {
    loadOptions()
    loadPredictionFromStorage()
  }, [])

  const loadPredictionFromStorage = () => {
    try {
      const storedPrediction = localStorage.getItem('farmcast_prediction')
      if (storedPrediction) {
        const predictionData = JSON.parse(storedPrediction)
        setCustomPrediction(predictionData)
        setSelectedCrop(predictionData.crop)
        // Visualization uses 'region' as UI term but Prediction stores 'state'
        setSelectedRegion(predictionData.state)
      }
    } catch (error) {
      console.error('Error loading prediction from storage:', error)
    }
  }

  const loadOptions = async () => {
    try {
      console.log('Loading visualization options from backend...')
      const [cropsResponse, areasResponse] = await Promise.allSettled([
        farmCastAPI.getCropOptions(),
        farmCastAPI.getAreaOptions()
      ])
      
      console.log('Visualization crops response:', cropsResponse)
      console.log('Visualization areas response:', areasResponse)
      
      if (cropsResponse.status === 'fulfilled' && cropsResponse.value?.crops) {
        console.log('Setting visualization crop options:', cropsResponse.value.crops)
        setCropOptions(cropsResponse.value.crops)
      } else {
        console.error('Visualization crops failed:', cropsResponse.reason)
        // Fallback crop options
        setCropOptions([
          'Rice', 'Wheat', 'Maize', 'Cotton(lint)', 'Sugarcane', 'Arhar/Tur', 
          'Gram', 'Groundnut', 'Soybean', 'Bajra', 'Jowar', 'Barley', 
          'Ragi', 'Small millets', 'Sesamum', 'Niger seed', 'Safflower'
        ])
      }
      
      if (areasResponse.status === 'fulfilled' && areasResponse.value?.areas) {
        console.log('Setting visualization area options:', areasResponse.value.areas)
        setAreaOptions(areasResponse.value.areas)
      } else {
        console.error('Visualization areas failed:', areasResponse.reason)
        // Fallback area options (states)
        setAreaOptions([
          'Andhra Pradesh', 'Assam', 'Bihar', 'Gujarat', 'Haryana', 'Karnataka', 
          'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 
          'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
        ])
      }
    } catch (error) {
      console.error('Error loading visualization options:', error)
      // Set fallback options if all API calls fail
      setCropOptions([
        'Rice', 'Wheat', 'Maize', 'Cotton(lint)', 'Sugarcane', 'Arhar/Tur', 
        'Gram', 'Groundnut', 'Soybean', 'Bajra', 'Jowar', 'Barley'
      ])
      setAreaOptions([
        'Andhra Pradesh', 'Assam', 'Bihar', 'Gujarat', 'Haryana', 'Karnataka', 
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 
        'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
      ])
      setError('Backend not available. Using fallback data for dropdowns.')
    }
  }

  const loadVisualizationData = async () => {
    if (!selectedCrop || !selectedRegion) return
    
    try {
      setLoading(true)
      setError(null)
      
      const [historicalResponse, predictionsResponse] = await Promise.allSettled([
        farmCastAPI.getHistoricalData(selectedCrop, selectedRegion),
        farmCastAPI.getPredictions(selectedCrop, selectedRegion, 2024, 2030)
      ])
      
      let historical = []
      let predictions = []
      
      if (historicalResponse.status === 'fulfilled' && !historicalResponse.value.error) {
        historical = historicalResponse.value.historical_data || []
        setHistoricalData(historical)
      } else {
        setHistoricalData([])
      }
      
      if (predictionsResponse.status === 'fulfilled') {
        predictions = predictionsResponse.value.predictions || []
        setPredictionsData(predictions)
      } else {
        setPredictionsData([])
      }
      
      // Combine historical and prediction data for the chart
      const combinedData = []
      
      // Add historical data
      historical.forEach(item => {
        combinedData.push({
          year: item.year,
          historical: item.yield_tons,
          predicted: null,
          type: 'historical'
        })
      })
      
      // Add prediction data
      predictions.forEach(item => {
        const existingIndex = combinedData.findIndex(d => d.year === item.year)
        if (existingIndex >= 0) {
          combinedData[existingIndex].predicted = item.predicted_yield_tons
        } else {
          combinedData.push({
            year: item.year,
            historical: null,
            predicted: item.predicted_yield_tons,
            type: 'predicted'
          })
        }
      })
      
      // Add custom prediction point to chart data if it exists
      if (customPrediction && customPrediction.year && customPrediction.predicted_yield_tons) {
        const existingIndex = combinedData.findIndex(d => d.year === customPrediction.year)
        if (existingIndex >= 0) {
          combinedData[existingIndex].custom = customPrediction.predicted_yield_tons
        } else {
          combinedData.push({
            year: customPrediction.year,
            historical: null,
            predicted: null,
            custom: customPrediction.predicted_yield_tons,
            type: 'custom'
          })
        }
      }

      // Sort by year
      combinedData.sort((a, b) => a.year - b.year)
      setChartData(combinedData)
      
    } catch (error) {
      console.error('Error loading visualization data:', error)
      setError('Failed to load data. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }
  
  
  useEffect(() => {
    if (selectedCrop && selectedRegion) {
      loadVisualizationData()
    }
  }, [selectedCrop, selectedRegion, customPrediction])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`Year: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey === 'historical' ? 'Historical' : 'Predicted'}: ${entry.value?.toFixed(2)} tons/ha`}
            </p>
          ))}
          {customPrediction && customPrediction.year === parseInt(label) && (
            <p className="text-purple-600 font-medium">
              {`Your Prediction: ${customPrediction.predicted_yield_tons?.toFixed(2)} tons/ha`}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center py-8">
        <p className="text-gray-500">{t('visualization.selectBothMessage')}</p>
      </div>

      {/* Selection Controls */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('visualization.selectCropRegion')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('CropType')}</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900 shadow-sm"
            >
              <option value="">{cropOptions.length > 0 ? t('prediction.selectCrop') : t('prediction.loadingCrops')}</option>
              {cropOptions.map((crop) => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('Region')}</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900 shadow-sm"
            >
              <option value="">{areaOptions.length > 0 ? t('prediction.selectRegion') : t('prediction.loadingRegions')}</option>
              {areaOptions.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{t('common.error')}: {error}</p>
        </div>
      )}

      {selectedCrop && selectedRegion && (
        <div className="space-y-8">
          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          )}

          {/* Main Line Chart */}
          {!loading && chartData.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {selectedCrop} Yield Trends in {selectedRegion}
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Historical data (blue) and future predictions (green) for crop yield over time
              </p>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: 'Yield (tons/ha)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="historical" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    name={t('visualization.historicalYield')}
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                    name={t('visualization.predictedYield')}
                    connectNulls={false}
                  />
                  {/* Custom prediction line to ensure visibility */}
                  <Line 
                    type="monotone" 
                    dataKey="custom" 
                    stroke="#8b5cf6" 
                    strokeWidth={4}
                    dot={{ fill: '#8b5cf6', strokeWidth: 3, r: 8, stroke: '#ffffff' }}
                    name={t('visualization.yourPrediction', 'Your Prediction')}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* User Prediction Display */}
          {customPrediction && (
            <div className="bg-white shadow rounded-lg p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">{t('visualization.yourPrediction')}</h4>
              <p className="text-sm text-gray-600 mb-4">
                Based on the values you entered in the prediction page
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Year</div>
                  <div className="font-medium">{customPrediction.year}</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">Rainfall</div>
                  <div className="font-medium">{customPrediction.input_conditions?.rainfall?.toFixed(0)} mm</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">Pesticide</div>
                  <div className="font-medium">{customPrediction.input_conditions?.pesticide?.toFixed(1)} kg/ha</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-sm text-gray-600">Fertilizer</div>
                  <div className="font-medium">{customPrediction.input_conditions?.fertilizer?.toFixed(1)} kg/ha</div>
                </div>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-medium text-purple-900 mb-2">Predicted Yield</h3>
                <p className="text-2xl font-bold text-purple-800">
                  {customPrediction.predicted_yield_tons?.toFixed(2)} tons/ha
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  This prediction appears as a purple dot on the chart above
                </p>
              </div>
            </div>
          )}

          {/* Data Summary */}
          {(historicalData.length > 0 || predictionsData.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {historicalData.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Historical Data Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Years Available:</span>
                      <span className="font-medium">
                        {Math.min(...historicalData.map(d => d.year))} - {Math.max(...historicalData.map(d => d.year))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Yield:</span>
                      <span className="font-medium">
                        {(historicalData.reduce((sum, d) => sum + d.yield_tons, 0) / historicalData.length).toFixed(2)} tons/ha
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Best Year:</span>
                      <span className="font-medium">
                        {historicalData.reduce((max, d) => d.yield_tons > max.yield_tons ? d : max).year} 
                        ({historicalData.reduce((max, d) => d.yield_tons > max.yield_tons ? d : max).yield_tons.toFixed(2)} tons/ha)
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {predictionsData.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('visualization.yieldTrends')}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prediction Range:</span>
                      <span className="font-medium">
                        {Math.min(...predictionsData.map(d => d.year))} - {Math.max(...predictionsData.map(d => d.year))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Predicted:</span>
                      <span className="font-medium">
                        {(predictionsData.reduce((sum, d) => sum + d.predicted_yield_tons, 0) / predictionsData.length).toFixed(2)} tons/ha
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trend:</span>
                      <span className="font-medium">
                        {predictionsData[predictionsData.length - 1]?.predicted_yield_tons > predictionsData[0]?.predicted_yield_tons ? '↗ Increasing' : '↘ Decreasing'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && chartData.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">No Data Available</h3>
                <p className="text-yellow-600">
                  No historical or prediction data found for {selectedCrop} in {selectedRegion}.
                  Try selecting a different crop or region combination.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
