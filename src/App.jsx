import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Prediction from './pages/Prediction'
import Visualization from './pages/Visualization'
import FarmerSupport from './pages/FarmerSupport'
import Chatbot from './components/Chatbot'
import './i18n'

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
        v7_fetcherPersist: true,
        v7_normalizeFormMethod: true,
        v7_partialHydration: true,
        v7_skipActionErrorRevalidation: true
      }}
    >
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predict" element={<Prediction />} />
            <Route path="/visualize" element={<Visualization />} />
            <Route path="/farmer-support" element={<FarmerSupport />} />
          </Routes>
        </main>
        <Chatbot />
      </div>
    </Router>
  )
}

export default App
