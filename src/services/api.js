import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
})

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message)
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('Backend server is not running or not accessible')
    }
    return Promise.reject(error)
  }
)

export const farmCastAPI = {
  // Train the ML model
  trainModel: async () => {
    const response = await api.post('/train')
    return response.data
  },

  // Make yield prediction
  predictYield: async (data) => {
    const response = await api.post('/predict', data)
    return response.data
  },

  // Get feature importance
  getFeatureImportance: async () => {
    const response = await api.get('/feature-importance')
    return response.data
  },

  // Get model statistics
  getModelStats: async () => {
    const response = await api.get('/model-stats')
    return response.data
  },

  // Get available crop options
  getCropOptions: async () => {
    const response = await api.get('/crop-options')
    return response.data
  },

  // Get available area/country options
  getAreaOptions: async () => {
    const response = await api.get('/area-options')
    return response.data
  },

  // Get available state options
  getStateOptions: async () => {
    const response = await api.get('/state-options')
    return response.data
  },

  // Get available season options
  getSeasonOptions: async () => {
    const response = await api.get('/season-options')
    return response.data
  },

  // Get crop suggestions for given conditions
  suggestCrops: async (data) => {
    const response = await api.post('/suggest-crops', data)
    return response.data
  },

  // Get historical data for specific crop and region
  getHistoricalData: async (crop, region) => {
    const response = await api.get(`/historical-data/${encodeURIComponent(crop)}/${encodeURIComponent(region)}`)
    return response.data
  },

  // Get predictions for specific crop and region
  getPredictions: async (crop, region, startYear = 2024, endYear = 2030) => {
    const response = await api.get(`/predictions/${encodeURIComponent(crop)}/${encodeURIComponent(region)}?start_year=${startYear}&end_year=${endYear}`)
    return response.data
  },

  // Get custom prediction for user-specified conditions
  getCustomPrediction: async (data) => {
    const response = await api.post('/custom-prediction', data)
    return response.data
  },

  // ==================== FARMER SUPPORT API ENDPOINTS ====================

  // Get comprehensive location-based data (weather, soil, location info)
  getLocationData: async (latitude, longitude) => {
    const response = await api.post('/farmer-support/location-data', {
      latitude,
      longitude
    })
    return response.data
  },

  // Get SoilGrids data from ISRIC API
  getSoilGridsData: async (latitude, longitude) => {
    try {
      const soilGridsUrl = `https://rest.isric.org/soilgrids/v2.0/properties/query?lat=${latitude}&lon=${longitude}&property=phh2o&property=soc&property=clay&property=sand&property=silt&property=nitrogen&property=cec&property=bdod&depth=0-5cm&value=mean`
      const response = await fetch(soilGridsUrl)
      return await response.json()
    } catch (error) {
      console.error('SoilGrids API error:', error)
      throw error
    }
  },

  // Get intelligent crop recommendations
  getCropRecommendations: async (latitude, longitude, season = null) => {
    const response = await api.post('/farmer-support/crop-recommendations', {
      latitude,
      longitude,
      season
    })
    return response.data
  },

  // Get weather forecast
  getWeatherForecast: async (latitude, longitude, days = 7) => {
    const response = await api.post('/farmer-support/weather-forecast', {
      latitude,
      longitude,
      days
    })
    return response.data
  },

  // Get historical analysis and insights
  getHistoricalAnalysis: async (latitude, longitude, yearsBack = 5) => {
    const response = await api.post('/farmer-support/historical-analysis', {
      latitude,
      longitude,
      years_back: yearsBack
    })
    return response.data
  },

  // Get cache statistics
  getCacheStats: async () => {
    const response = await api.get('/farmer-support/cache-stats')
    return response.data
  },

  // Clear cache
  clearCache: async (dataType = null) => {
    const response = await api.post('/farmer-support/clear-cache', null, {
      params: { data_type: dataType }
    })
    return response.data
  },

  // Chat with AI assistant
  chat: async (message, language = 'en') => {
    const response = await api.post('/chat', { message, language })
    return response.data
  },
}

export default farmCastAPI
