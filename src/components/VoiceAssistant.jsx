import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  SpeakerWaveIcon, 
  MicrophoneIcon,
  StopIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

const VoiceAssistant = ({ locationData, weatherData, soilData, recommendations, historicalData, onQuickAction }) => {
  const { t, i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-US';

      recognitionRef.current.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setTranscript(speechResult);
        handleVoiceCommand(speechResult);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [i18n.language]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    let responseText = '';

    // Quick Actions commands
    if (lowerCommand.includes('forecast') || lowerCommand.includes('7 day') || lowerCommand.includes('extended weather') || lowerCommand.includes('मौसम पूर्वानुमान')) {
      if (locationData && onQuickAction) {
        onQuickAction('forecast');
        responseText = t('Opening 7-day weather forecast with detailed farming advice.');
      } else {
        responseText = t('Please capture your location first to get weather forecast.');
      }
    }
    
    // Market price commands
    else if (lowerCommand.includes('market') || lowerCommand.includes('price') || lowerCommand.includes('rates') || lowerCommand.includes('बाजार') || lowerCommand.includes('दाम')) {
      if (locationData && onQuickAction) {
        onQuickAction('market');
        responseText = t('Opening market prices and trends for your area.');
      } else {
        responseText = t('Please capture your location first to get market prices.');
      }
    }
    
    // Pest alert commands
    else if (lowerCommand.includes('pest') || lowerCommand.includes('disease') || lowerCommand.includes('alert') || lowerCommand.includes('कीट') || lowerCommand.includes('रोग')) {
      if (locationData && onQuickAction) {
        onQuickAction('pest');
        responseText = t('Opening pest and disease alerts for your crops.');
      } else {
        responseText = t('Please capture your location first to get pest alerts.');
      }
    }
    
    // Planting calendar commands
    else if (lowerCommand.includes('calendar') || lowerCommand.includes('planting') || lowerCommand.includes('schedule') || lowerCommand.includes('when to plant') || lowerCommand.includes('बुवाई') || lowerCommand.includes('कैलेंडर')) {
      if (locationData && onQuickAction) {
        onQuickAction('calendar');
        responseText = t('Opening planting calendar with seasonal recommendations.');
      } else {
        responseText = t('Please capture your location first to get planting calendar.');
      }
    }

    // Weather commands (current)
    else if (lowerCommand.includes('weather') || lowerCommand.includes('temperature') || lowerCommand.includes('मौसम')) {
      if (weatherData) {
        responseText = `Current weather: Temperature is ${weatherData.temperature} degrees celsius, humidity is ${weatherData.humidity} percent, and rainfall is ${weatherData.rainfall} millimeters.`;
      } else {
        responseText = t('Weather data is not available. Please capture your location first.');
      }
    }
    
    // Soil commands
    else if (lowerCommand.includes('soil') || lowerCommand.includes('मिट्टी')) {
      if (soilData) {
        responseText = `Soil analysis: pH is ${soilData.ph.toFixed(1)}, organic carbon is ${soilData.organic_carbon.toFixed(1)} percent. Nitrogen is ${soilData.nitrogen} ppm, phosphorus is ${soilData.phosphorus} ppm, and potassium is ${soilData.potassium} ppm.`;
      } else {
        responseText = t('Soil data is not available. Please capture your location first.');
      }
    }
    
    // Crop recommendation commands
    else if (lowerCommand.includes('crop') || lowerCommand.includes('recommend') || lowerCommand.includes('फसल')) {
      if (recommendations && recommendations.recommendations && recommendations.recommendations.length > 0) {
        const topCrop = recommendations.recommendations[0];
        responseText = `Top crop recommendation: ${topCrop.crop_name}. Expected yield is ${Math.round(topCrop.expected_yield)} kilograms per hectare with ${Math.round(topCrop.profit_margin)} percent profit margin. Sustainability score is ${Math.round(topCrop.sustainability_score)} out of 100.`;
      } else {
        responseText = t('Crop recommendations are not available. Please complete the location analysis first.');
      }
    }
    
    // Location commands
    else if (lowerCommand.includes('location') || lowerCommand.includes('where') || lowerCommand.includes('स्थान')) {
      if (locationData) {
        responseText = `Your location is ${locationData.address}. You are in ${locationData.district} district, ${locationData.state} state. The climate zone is ${locationData.climatic_zone}.`;
      } else {
        responseText = t('Location data is not available. Please capture your location first.');
      }
    }
    
    // Historical data commands
    else if (lowerCommand.includes('history') || lowerCommand.includes('trend') || lowerCommand.includes('इतिहास')) {
      if (historicalData && historicalData.yield_trends && historicalData.yield_trends.length > 0) {
        const topTrend = historicalData.yield_trends[0];
        responseText = `Historical analysis shows ${topTrend.crop} has a ${topTrend.trend_direction} yield trend with ${Math.abs(topTrend.trend_percentage).toFixed(1)} percent change per year.`;
      } else {
        responseText = t('Historical data is not available yet.');
      }
    }
    
    // Advanced agricultural commands
    else if (lowerCommand.includes('irrigation') || lowerCommand.includes('water') || lowerCommand.includes('सिंचाई')) {
      responseText = t('For irrigation advice, check the 7-day forecast for rainfall predictions and soil moisture recommendations.');
      if (locationData && onQuickAction) {
        setTimeout(() => onQuickAction('forecast'), 2000);
      }
    }
    
    else if (lowerCommand.includes('fertilizer') || lowerCommand.includes('nutrients') || lowerCommand.includes('खाद')) {
      if (soilData) {
        responseText = `Based on soil analysis, your nitrogen level is ${soilData.nitrogen} ppm, phosphorus is ${soilData.phosphorus} ppm, and potassium is ${soilData.potassium} ppm. Check crop recommendations for specific fertilizer advice.`;
      } else {
        responseText = t('Complete soil analysis first for fertilizer recommendations.');
      }
    }
    
    else if (lowerCommand.includes('harvest') || lowerCommand.includes('when to harvest') || lowerCommand.includes('फसल काटना')) {
      responseText = t('Check the planting calendar for harvest timing based on your crops and location.');
      if (locationData && onQuickAction) {
        setTimeout(() => onQuickAction('calendar'), 2000);
      }
    }
    
    // Help commands
    else if (lowerCommand.includes('help') || lowerCommand.includes('मदद')) {
      responseText = t('I can help you with: weather forecast, market prices, pest alerts, planting calendar, soil analysis, crop recommendations, irrigation advice, and more. Try saying "show me market prices" or "open planting calendar".');
    }
    
    // Default response
    else {
      responseText = t('I can help you with weather forecast, market prices, pest alerts, planting calendar, and farming advice. What would you like to know?');
    }

    setResponse(responseText);
    speak(responseText);
  };

  const quickCommands = [
    { text: t('Show me 7-day forecast'), command: 'forecast' },
    { text: t('Check market prices'), command: 'market prices' },
    { text: t('Open pest alerts'), command: 'pest alerts' },
    { text: t('Show planting calendar'), command: 'planting calendar' },
    { text: t('Tell me about the weather'), command: 'weather' },
    { text: t('What about soil conditions?'), command: 'soil' },
    { text: t('Recommend crops for me'), command: 'crop recommendations' },
    { text: t('Where am I located?'), command: 'location' },
  ];

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-2xl p-4 max-w-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
          <SpeakerWaveIcon className="h-5 w-5 mr-2 text-blue-600" />
          {t('Voice Assistant')}
        </h4>
        <div className="flex space-x-2">
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
              title={t('Stop Speaking')}
            >
              <StopIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Voice Input */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!recognitionRef.current}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } disabled:bg-gray-300 disabled:cursor-not-allowed`}
            title={isListening ? t('Stop Listening') : t('Start Listening')}
          >
            {isListening ? (
              <StopIcon className="h-6 w-6" />
            ) : (
              <MicrophoneIcon className="h-6 w-6" />
            )}
          </button>
          
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              {isListening ? t('Listening...') : t('Tap to speak')}
            </p>
            {transcript && (
              <p className="text-sm text-blue-600 font-medium">{transcript}</p>
            )}
          </div>
        </div>

        {!recognitionRef.current && (
          <p className="text-xs text-red-600">
            {t('Speech recognition not supported in this browser')}
          </p>
        )}
      </div>

      {/* Quick Commands */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">{t('Quick Commands')}:</p>
        <div className="space-y-1">
          {quickCommands.map((cmd, index) => (
            <button
              key={index}
              onClick={() => handleVoiceCommand(cmd.command)}
              className="w-full text-left text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors"
            >
              "{cmd.text}"
            </button>
          ))}
        </div>
      </div>

      {/* Response */}
      {response && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">{t('Assistant Response')}:</p>
            <button
              onClick={() => speak(response)}
              disabled={isSpeaking}
              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors disabled:text-gray-400"
              title={t('Repeat')}
            >
              {isSpeaking ? (
                <PauseIcon className="h-4 w-4" />
              ) : (
                <PlayIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-sm text-gray-600">{response}</p>
        </div>
      )}

      {/* Language Support */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          {t('Supports English and Hindi voice commands')}
        </p>
      </div>
    </div>
  );
};

export default VoiceAssistant;
