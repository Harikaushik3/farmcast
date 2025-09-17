import { Link, useLocation } from 'react-router-dom'
import { HomeIcon, ChartBarIcon, BeakerIcon, LightBulbIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import LanguageSelector from './LanguageSelector'

export default function Navbar() {
  const location = useLocation()
  const { t } = useTranslation()
  
  const navigation = [
    { name: t('dashboard'), href: '/', icon: HomeIcon },
    { name: t('predict'), href: '/predict', icon: BeakerIcon },
    { name: t('visualize'), href: '/visualize', icon: ChartBarIcon },
    { name: 'Farmer Support', href: '/farmer-support', icon: LightBulbIcon },
  ]

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🌾</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Farm Cast</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="flex space-x-8">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                      isActive
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
            <LanguageSelector />
          </div>
        </div>
      </div>
    </nav>
  )
}
