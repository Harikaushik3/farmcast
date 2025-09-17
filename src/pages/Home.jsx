import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, ChartBarIcon, BeakerIcon, CpuChipIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import farmCastAPI from '../services/api'

export default function Home() {
  const { t } = useTranslation()
  const [modelStats, setModelStats] = useState(null)
  const [featureImportance, setFeatureImportance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modelTrained, setModelTrained] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('Loading data from backend...')
      
      // Add timeout to prevent infinite loading
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
      
      const [statsResponse, importanceResponse] = await Promise.allSettled([
        Promise.race([farmCastAPI.getModelStats(), timeout]),
        Promise.race([farmCastAPI.getFeatureImportance(), timeout])
      ])
      
      console.log('Stats response:', statsResponse)
      console.log('Importance response:', importanceResponse)
      
      if (statsResponse.status === 'fulfilled' && statsResponse.value) {
        setModelStats(statsResponse.value)
      } else {
        console.error('Stats failed:', statsResponse.reason)
        setModelStats(null)
      }
      
      if (importanceResponse.status === 'fulfilled' && importanceResponse.value) {
        // Backend returns { feature_importance: {key: value}, top_features: [...] }
        const fiObj = importanceResponse.value.feature_importance || {}
        // Normalize to array for UI rendering
        const fiArray = Object.entries(fiObj).map(([feature, importance]) => ({ feature, importance }))
        // Sort desc
        fiArray.sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))
        setFeatureImportance(fiArray)
        setModelTrained(fiArray.length > 0)
      } else {
        console.error('Feature importance failed:', importanceResponse.reason)
        setFeatureImportance(null)
        setModelTrained(false)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setModelStats(null)
      setFeatureImportance(null)
      setModelTrained(false)
    } finally {
      setLoading(false)
    }
  }

  const handleTrainModel = async () => {
    try {
      setLoading(true)
      await farmCastAPI.trainModel()
      await loadData()
      setModelTrained(true)
    } catch (error) {
      console.error('Error training model:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      name: t('aiPrediction'),
      description: t('aiPredictionDesc'),
      icon: CpuChipIcon,
      href: '/predict'
    },
    {
      name: t('dataVisualization'),
      description: t('dataVisualizationDesc'),
      icon: ChartBarIcon,
      href: '/visualize'
    },
    {
      name: t('smartRecommendations'),
      description: t('smartRecommendationsDesc'),
      icon: BeakerIcon,
      href: '/predict'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading FarmCast...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
          {t('welcome')}
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
          {t('description')}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/predict"
            className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            {t('getStarted')}
          </Link>
          <Link
            to="/visualize"
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            {t('learnMore')} <ArrowRightIcon className="inline w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>

      {/* Model Status */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {t('modelStatus', 'ML Model Status')}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {modelTrained ? t('modelReady', 'Model is trained and ready for predictions') : t('modelNotTrained', 'Model needs to be trained')}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                modelTrained ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {modelTrained ? t('ready', 'Ready') : t('notTrained', 'Not Trained')}
              </div>
              {!modelTrained && (
                <button
                  onClick={handleTrainModel}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {loading ? t('training', 'Training...') : t('trainModel', 'Train Model')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link
            key={feature.name}
            to={feature.href}
            className="group relative rounded-lg p-6 bg-white shadow hover:shadow-md transition-shadow"
          >
            <div>
              <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-600 group-hover:bg-primary-100">
                <feature.icon className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900">
                {feature.name}
                <span className="absolute inset-0" aria-hidden="true" />
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {feature.description}
              </p>
            </div>
            <span
              className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
              aria-hidden="true"
            >
              <ArrowRightIcon className="h-6 w-6" />
            </span>
          </Link>
        ))}
      </div>

      {/* Stats Overview */}
      {modelStats && (
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {t('datasetOverview', 'Dataset Overview')}
            </h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-gray-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {t('totalSamples', 'Total Samples')}
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {modelStats?.dataset_size?.toLocaleString() || 'N/A'}
                </dd>
              </div>
              <div className="bg-gray-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {t('countries', 'Countries')}
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {Object.keys(modelStats?.state_distribution || {}).length}+
                </dd>
              </div>
              <div className="bg-gray-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {t('avgYield', 'Avg Yield')}
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {(modelStats?.target_stats?.mean_yield / 100)?.toFixed(2) || 'N/A'} t/ha
                </dd>
              </div>
              <div className="bg-gray-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {t('yearRange', 'Year Range')}
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                  {modelStats?.year_range || 'N/A'}
                </dd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Importance */}
      {featureImportance && (
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {t('topFeatures', 'Top Features Affecting Yield')}
            </h3>
            <div className="space-y-3">
              {Array.isArray(featureImportance) && featureImportance.length > 0 ? (
                featureImportance.slice(0, 5).map(({ feature, importance }) => (
                  <div key={feature} className="flex items-center">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {feature}
                        </span>
                        <span className="text-sm text-gray-500">
                          {((importance || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="mt-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${Math.max(0, Math.min(100, (importance || 0) * 100)).toFixed(1)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No feature importance data available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
