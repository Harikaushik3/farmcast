import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      dashboard: "Dashboard",
      predict: "Predict",
      visualize: "Visualize",
      chat: "Chat Assistant",
      
      // Common
      loading: "Loading...",
      error: "Error",
      common: {
        error: "Error"
      },
      submit: "Submit",
      cancel: "Cancel",
      save: "Save",
      close: "Close",
      
      // Home page
      welcome: "Welcome to Farm Cast",
      subtitle: "AI-Powered Crop Yield Prediction for Smart Farming",
      description: "Get accurate crop yield predictions using advanced machine learning algorithms. Make informed decisions about your farming operations with data-driven insights.",
      getStarted: "Get Started",
      learnMore: "Learn More",
      
      // Model Status
      modelStatus: "ML Model Status",
      modelReady: "Model is trained and ready for predictions",
      modelNotTrained: "Model needs to be trained",
      ready: "Ready",
      notTrained: "Not Trained",
      training: "Training...",
      trainModel: "Train Model",
      
      // Dataset Overview
      datasetOverview: "Dataset Overview",
      totalSamples: "Total Samples",
      countries: "Countries",
      avgYield: "Avg Yield",
      yearRange: "Year Range",
      topFeatures: "Top Features Affecting Yield",
      
      // Features
      features: "Features",
      aiPrediction: "AI Prediction",
      aiPredictionDesc: "Advanced machine learning models for accurate yield forecasting",
      dataVisualization: "Data Visualization",
      dataVisualizationDesc: "Interactive charts and graphs to understand your data better",
      smartRecommendations: "Smart Recommendations",
      smartRecommendationsDesc: "Personalized farming tips based on your specific conditions",
      
      // Prediction page
      cropYieldPrediction: "Crop Yield Prediction",
      enterDetails: "Enter your farming details below to get AI-powered yield predictions",
      cropType: "Crop Type",
      selectCrop: "Select a crop",
      loadingCrops: "Loading crops...",
      region: "Region",
      selectRegion: "Select a region",
      loadingRegions: "Loading regions...",
      country: "Country",
      selectCountry: "Select a country",
      year: "Year",
      rainfall: "Rainfall (mm)",
      pesticides: "Pesticides (tonnes)",
      avgTemp: "Average Temperature (°C)",
      area: "Area (hectares)",
      getPrediction: "Get Prediction",
      
      // Results
      predictedYield: "Predicted Yield",
      confidence: "Confidence",
      recommendations: "Recommendations",
      
      // Chatbot
      chatAssistant: "Farm Assistant",
      chatPlaceholder: "Ask me anything about farming, crops, or predictions...",
      sendMessage: "Send Message",
      chatWelcome: "Hello! I'm your Farm Assistant. How can I help you today?",
      
      // Language selector
      language: "Language",
      selectLanguage: "Select Language",
      
      // Visualization page
      dataVisualizationTitle: "Data Visualization & Analytics",
      visualization: {
        title: "Data Visualization",
        subtitle: "Interactive charts and insights from your crop yield data",
        selectCropRegion: "Select Crop and Region",
        selectBothMessage: "Please select both crop and region to view the visualization.",
        loadingData: "Loading visualization data...",
        yieldTrends: "Yield Trends Over Time",
        historicalYield: "Historical Yield",
        predictedYield: "Predicted Yield",
        yourPrediction: "Your Prediction"
      },
      featureImportance: "Feature Importance",
      featureImportanceDesc: "Shows which factors have the most impact on crop yield predictions",
      featureCorrelation: "Feature Correlation with Yield",
      featureCorrelationDesc: "Positive correlations (green) increase yield, negative correlations (red) decrease yield",
      cropDistribution: "Crop Distribution in Dataset",
      cropDistributionDesc: "Distribution of different crop types in the training dataset",
      topCountries: "Top Countries/Regions in Dataset",
      topCountriesDesc: "Distribution of top 10 countries/regions by sample count",
      correlationAnalysis: "Feature Correlation Analysis",
      correlationAnalysisDesc: "Detailed correlation analysis between features and crop yield",
      feature: "Feature",
      correlation: "Correlation (%)",
      direction: "Direction",
      strength: "Strength",
      positive: "Positive",
      negative: "Negative",
      strong: "Strong",
      moderate: "Moderate",
      weak: "Weak",
      noDataAvailable: "No Data Available",
      backendNotRunning: "Backend server is not running or model is not trained.",
      quickSetup: "Quick Setup:",
      openTerminal: "Open terminal in backend folder",
      runCommand: "Run: python main.py",
      waitMessage: "Wait for 'Model trained successfully' message",
      refreshPage: "Refresh this page",
      checkAgain: "Check Again",
      retryConnection: "Retry Connection"
    }
  },
  es: {
    translation: {
      // Navigation
      dashboard: "Panel de Control",
      predict: "Predecir",
      visualize: "Visualizar",
      chat: "Asistente de Chat",
      
      // Common
      loading: "Cargando...",
      error: "Error",
      common: {
        error: "Error"
      },
      submit: "Enviar",
      cancel: "Cancelar",
      save: "Guardar",
      close: "Cerrar",
      
      // Home page
      welcome: "Bienvenido a Farm Cast",
      subtitle: "Predicción de Rendimiento de Cultivos Impulsada por IA para Agricultura Inteligente",
      description: "Obtenga predicciones precisas del rendimiento de cultivos utilizando algoritmos avanzados de aprendizaje automático. Tome decisiones informadas sobre sus operaciones agrícolas con información basada en datos.",
      getStarted: "Comenzar",
      learnMore: "Aprender Más",
      
      // Model Status
      modelStatus: "Estado del Modelo ML",
      modelReady: "El modelo está entrenado y listo para predicciones",
      modelNotTrained: "El modelo necesita ser entrenado",
      ready: "Listo",
      notTrained: "No Entrenado",
      training: "Entrenando...",
      trainModel: "Entrenar Modelo",
      
      // Dataset Overview
      datasetOverview: "Resumen del Dataset",
      totalSamples: "Muestras Totales",
      countries: "Países",
      avgYield: "Rendimiento Promedio",
      yearRange: "Rango de Años",
      topFeatures: "Principales Características que Afectan el Rendimiento",
      
      // Features
      features: "Características",
      aiPrediction: "Predicción IA",
      aiPredictionDesc: "Modelos avanzados de aprendizaje automático para pronósticos precisos de rendimiento",
      dataVisualization: "Visualización de Datos",
      dataVisualizationDesc: "Gráficos interactivos para entender mejor sus datos",
      smartRecommendations: "Recomendaciones Inteligentes",
      smartRecommendationsDesc: "Consejos de agricultura personalizados basados en sus condiciones específicas",
      
      // Prediction page
      cropYieldPrediction: "Predicción de Rendimiento de Cultivos",
      enterDetails: "Ingrese los detalles de su agricultura a continuación para obtener predicciones de rendimiento impulsadas por IA",
      cropType: "Tipo de Cultivo",
      selectCrop: "Seleccionar un cultivo",
      loadingCrops: "Cargando cultivos...",
      region: "Región",
      selectRegion: "Seleccionar una región",
      loadingRegions: "Cargando regiones...",
      country: "País",
      selectCountry: "Seleccionar un país",
      year: "Año",
      rainfall: "Lluvia (mm)",
      pesticides: "Pesticidas (toneladas)",
      avgTemp: "Temperatura Promedio (°C)",
      area: "Área (hectáreas)",
      getPrediction: "Obtener Predicción",
      
      // Results
      predictedYield: "Rendimiento Predicho",
      confidence: "Confianza",
      recommendations: "Recomendaciones",
      
      // Chatbot
      chatAssistant: "Asistente Agrícola",
      chatPlaceholder: "Pregúntame cualquier cosa sobre agricultura, cultivos o predicciones...",
      sendMessage: "Enviar Mensaje",
      chatWelcome: "¡Hola! Soy tu Asistente Agrícola. ¿Cómo puedo ayudarte hoy?",
      
      // Language selector
      language: "Idioma",
      selectLanguage: "Seleccionar Idioma",
      
      // Visualization page
      dataVisualizationTitle: "Visualización de Datos y Análisis",
      visualization: {
        title: "Visualización de Datos",
        subtitle: "Gráficos interactivos e información de sus datos de rendimiento de cultivos",
        selectCropRegion: "Seleccionar Cultivo y Región",
        selectBothMessage: "Por favor seleccione tanto el cultivo como la región para ver la visualización.",
        loadingData: "Cargando datos de visualización...",
        yieldTrends: "Tendencias de Rendimiento a lo Largo del Tiempo",
        historicalYield: "Rendimiento Histórico",
        predictedYield: "Rendimiento Predicho",
        yourPrediction: "Tu Predicción"
      },
      featureImportance: "Importancia de Características",
      featureImportanceDesc: "Muestra qué factores tienen el mayor impacto en las predicciones de rendimiento de cultivos",
      featureCorrelation: "Correlación de Características con Rendimiento",
      featureCorrelationDesc: "Las correlaciones positivas (verde) aumentan el rendimiento, las correlaciones negativas (rojo) lo disminuyen",
      cropDistribution: "Distribución de Cultivos en el Dataset",
      cropDistributionDesc: "Distribución de diferentes tipos de cultivos en el dataset de entrenamiento",
      topCountries: "Principales Países/Regiones en el Dataset",
      topCountriesDesc: "Distribución de los 10 principales países/regiones por número de muestras",
      correlationAnalysis: "Análisis de Correlación de Características",
      correlationAnalysisDesc: "Análisis detallado de correlación entre características y rendimiento de cultivos",
      feature: "Característica",
      correlation: "Correlación (%)",
      direction: "Dirección",
      strength: "Fuerza",
      positive: "Positiva",
      negative: "Negativa",
      strong: "Fuerte",
      moderate: "Moderada",
      weak: "Débil",
      noDataAvailable: "No Hay Datos Disponibles",
      backendNotRunning: "El servidor backend no está ejecutándose o el modelo no está entrenado.",
      quickSetup: "Configuración Rápida:",
      openTerminal: "Abrir terminal en la carpeta backend",
      runCommand: "Ejecutar: python main.py",
      waitMessage: "Esperar el mensaje 'Modelo entrenado exitosamente'",
      refreshPage: "Actualizar esta página",
      checkAgain: "Verificar Nuevamente",
      retryConnection: "Reintentar Conexión"
    }
  },
  fr: {
    translation: {
      // Navigation
      dashboard: "Tableau de Bord",
      predict: "Prédire",
      visualize: "Visualiser",
      chat: "Assistant Chat",
      
      // Common
      loading: "Chargement...",
      error: "Erreur",
      common: {
        error: "Erreur"
      },
      submit: "Soumettre",
      cancel: "Annuler",
      save: "Sauvegarder",
      close: "Fermer",
      
      // Home page
      welcome: "Bienvenue à Farm Cast",
      subtitle: "Prédiction de Rendement des Cultures Alimentée par IA pour l'Agriculture Intelligente",
      description: "Obtenez des prédictions précises du rendement des cultures en utilisant des algorithmes d'apprentissage automatique avancés. Prenez des décisions éclairées sur vos opérations agricoles avec des insights basés sur les données.",
      getStarted: "Commencer",
      learnMore: "En Savoir Plus",
      
      // Model Status
      modelStatus: "État du Modèle ML",
      modelReady: "Le modèle est entraîné et prêt pour les prédictions",
      modelNotTrained: "Le modèle doit être entraîné",
      ready: "Prêt",
      notTrained: "Non Entraîné",
      training: "Entraînement...",
      trainModel: "Entraîner le Modèle",
      
      // Dataset Overview
      datasetOverview: "Aperçu du Dataset",
      totalSamples: "Échantillons Totaux",
      countries: "Pays",
      avgYield: "Rendement Moyen",
      yearRange: "Plage d'Années",
      topFeatures: "Principales Caractéristiques Affectant le Rendement",
      
      // Features
      features: "Fonctionnalités",
      aiPrediction: "Prédiction IA",
      aiPredictionDesc: "Modèles d'apprentissage automatique avancés pour des prévisions de rendement précises",
      dataVisualization: "Visualisation de Données",
      dataVisualizationDesc: "Graphiques interactifs pour mieux comprendre vos données",
      smartRecommendations: "Recommandations Intelligentes",
      smartRecommendationsDesc: "Conseils agricoles personnalisés basés sur vos conditions spécifiques",
      
      // Prediction page
      cropYieldPrediction: "Prédiction de Rendement des Cultures",
      enterDetails: "Entrez vos détails agricoles ci-dessous pour obtenir des prédictions de rendement alimentées par IA",
      cropType: "Type de Culture",
      selectCrop: "Sélectionner une culture",
      loadingCrops: "Chargement des cultures...",
      region: "Région",
      selectRegion: "Sélectionner une région",
      loadingRegions: "Chargement des régions...",
      country: "Pays",
      selectCountry: "Sélectionner un pays",
      year: "Année",
      rainfall: "Précipitations (mm)",
      pesticides: "Pesticides (tonnes)",
      avgTemp: "Température Moyenne (°C)",
      area: "Superficie (hectares)",
      getPrediction: "Obtenir la Prédiction",
      
      // Results
      predictedYield: "Rendement Prédit",
      confidence: "Confiance",
      recommendations: "Recommandations",
      
      // Chatbot
      chatAssistant: "Assistant Agricole",
      chatPlaceholder: "Demandez-moi n'importe quoi sur l'agriculture, les cultures ou les prédictions...",
      sendMessage: "Envoyer le Message",
      chatWelcome: "Bonjour! Je suis votre Assistant Agricole. Comment puis-je vous aider aujourd'hui?",
      
      // Language selector
      language: "Langue",
      selectLanguage: "Sélectionner la Langue",
      
      // Visualization page
      dataVisualizationTitle: "Visualisation de Données et Analyses",
      visualization: {
        title: "Visualisation de Données",
        subtitle: "Graphiques interactifs et informations de vos données de rendement des cultures",
        selectCropRegion: "Sélectionner Culture et Région",
        selectBothMessage: "Veuillez sélectionner à la fois la culture et la région pour voir la visualisation.",
        loadingData: "Chargement des données de visualisation...",
        yieldTrends: "Tendances de Rendement au Fil du Temps",
        historicalYield: "Rendement Historique",
        predictedYield: "Rendement Prédit",
        yourPrediction: "Votre Prédiction"
      },
      featureImportance: "Importance des Caractéristiques",
      featureImportanceDesc: "Montre quels facteurs ont le plus d'impact sur les prédictions de rendement des cultures",
      featureCorrelation: "Corrélation des Caractéristiques avec le Rendement",
      featureCorrelationDesc: "Les corrélations positives (vert) augmentent le rendement, les corrélations négatives (rouge) le diminuent",
      cropDistribution: "Distribution des Cultures dans le Dataset",
      cropDistributionDesc: "Distribution des différents types de cultures dans le dataset d'entraînement",
      topCountries: "Principaux Pays/Régions dans le Dataset",
      topCountriesDesc: "Distribution des 10 principaux pays/régions par nombre d'échantillons",
      correlationAnalysis: "Analyse de Corrélation des Caractéristiques",
      correlationAnalysisDesc: "Analyse détaillée de corrélation entre les caractéristiques et le rendement des cultures",
      feature: "Caractéristique",
      correlation: "Corrélation (%)",
      direction: "Direction",
      strength: "Force",
      positive: "Positive",
      negative: "Négative",
      strong: "Forte",
      moderate: "Modérée",
      weak: "Faible",
      noDataAvailable: "Aucune Donnée Disponible",
      backendNotRunning: "Le serveur backend n'est pas en cours d'exécution ou le modèle n'est pas entraîné.",
      quickSetup: "Configuration Rapide :",
      openTerminal: "Ouvrir le terminal dans le dossier backend",
      runCommand: "Exécuter : python main.py",
      waitMessage: "Attendre le message 'Modèle entraîné avec succès'",
      refreshPage: "Actualiser cette page",
      checkAgain: "Vérifier à Nouveau",
      retryConnection: "Réessayer la Connexion"
    }
  },
  hi: {
    translation: {
      // Navigation
      dashboard: "डैशबोर्ड",
      predict: "भविष्यवाणी",
      visualize: "दृश्यीकरण",
      chat: "चैट सहायक",
      
      // Common
      loading: "लोड हो रहा है...",
      error: "त्रुटि",
      common: {
        error: "त्रुटि"
      },
      submit: "जमा करें",
      cancel: "रद्द करें",
      save: "सहेजें",
      close: "बंद करें",
      
      // Home page
      welcome: "Farm Cast में आपका स्वागत है",
      subtitle: "स्मार्ट खेती के लिए AI-संचालित फसल उत्पादन भविष्यवाणी",
      description: "उन्नत मशीन लर्निंग एल्गोरिदम का उपयोग करके सटीक फसल उत्पादन भविष्यवाणी प्राप्त करें। डेटा-संचालित अंतर्दृष्टि के साथ अपने खेती के संचालन के बारे में सूचित निर्णय लें।",
      getStarted: "शुरू करें",
      learnMore: "और जानें",
      
      // Model Status
      modelStatus: "ML मॉडल स्थिति",
      modelReady: "मॉडल प्रशिक्षित है और भविष्यवाणियों के लिए तैयार है",
      modelNotTrained: "मॉडल को प्रशिक्षित करने की आवश्यकता है",
      ready: "तैयार",
      notTrained: "प्रशिक्षित नहीं",
      training: "प्रशिक्षण...",
      trainModel: "मॉडल प्रशिक्षित करें",
      
      // Dataset Overview
      datasetOverview: "डेटासेट अवलोकन",
      totalSamples: "कुल नमूने",
      countries: "देश",
      avgYield: "ौसत उत्पादन",
      yearRange: "वर्ष रेंज",
      topFeatures: "उत्पादन को प्रभावित करने वाले मुख्य कारक",
      
      // Features
      features: "सुविधाएं",
      aiPrediction: "AI भविष्यवाणी",
      aiPredictionDesc: "सटीक उत्पादन पूर्वानुमान के लिए उन्नत मशीन लर्निंग मॉडल",
      dataVisualization: "डेटा दृश्यीकरण",
      dataVisualizationDesc: "अपने डेटा को बेहतर समझने के लिए इंटरैक्टिव चार्ट और ग्राफ",
      smartRecommendations: "स्मार्ट सिफारिशें",
      smartRecommendationsDesc: "आपकी विशिष्ट स्थितियों के आधार पर व्यक्तिगत खेती सुझाव",
      
      // Prediction page
      cropYieldPrediction: "फसल उत्पादन भविष्यवाणी",
      enterDetails: "AI-संचालित उत्पादन भविष्यवाणी प्राप्त करने के लिए नीचे अपनी खेती का विवरण दर्ज करें",
      cropType: "फसल का प्रकार",
      selectCrop: "एक फसल चुनें",
      loadingCrops: "फसलें लोड हो रही हैं...",
      region: "क्षेत्र",
      selectRegion: "एक क्षेत्र चुनें",
      loadingRegions: "क्षेत्र लोड हो रहे हैं...",
      country: "देश",
      selectCountry: "एक देश चुनें",
      year: "वर्ष",
      rainfall: "वर्षा (मिमी)",
      pesticides: "कीटनाशक (टन)",
      avgTemp: "औसत तापमान (°C)",
      area: "क्षेत्रफल (हेक्टेयर)",
      getPrediction: "भविष्यवाणी प्राप्त करें",
      
      // Results
      predictedYield: "अनुमानित उत्पादन",
      confidence: "विश्वास",
      recommendations: "सिफारिशें",
      
      // Chatbot
      chatAssistant: "कृषि सहायक",
      chatPlaceholder: "खेती, फसलों या भविष्यवाणियों के बारे में मुझसे कुछ भी पूछें...",
      sendMessage: "संदेश भेजें",
      chatWelcome: "नमस्ते! मैं आपका कृषि सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
      
      // Language selector
      language: "भाषा",
      selectLanguage: "भाषा चुनें",
      
      // Visualization page
      dataVisualizationTitle: "डेटा दृश्यीकरण और विश्लेषण",
      visualization: {
        title: "डेटा दृश्यीकरण",
        subtitle: "आपके फसल उत्पादन डेटा से इंटरैक्टिव चार्ट और अंतर्दृष्टि",
        selectCropRegion: "फसल और क्षेत्र चुनें",
        selectBothMessage: "दृश्यीकरण देखने के लिए कृपया फसल और क्षेत्र दोनों चुनें।",
        loadingData: "दृश्यीकरण डेटा लोड हो रहा है...",
        yieldTrends: "समय के साथ उत्पादन रुझान",
        historicalYield: "ऐतिहासिक उत्पादन",
        predictedYield: "अनुमानित उत्पादन",
        yourPrediction: "आपकी भविष्यवाणी"
      },
      featureImportance: "विशेषता महत्व",
      featureImportanceDesc: "दिखाता है कि कौन से कारक फसल उत्पादन भविष्यवाणी पर सबसे अधिक प्रभाव डालते हैं",
      featureCorrelation: "उत्पादन के साथ विशेषता सहसंबंध",
      featureCorrelationDesc: "सकारात्मक सहसंबंध (हरा) उत्पादन बढ़ाते हैं, नकारात्मक सहसंबंध (लाल) इसे कम करते हैं",
      cropDistribution: "डेटासेट में फसल वितरण",
      cropDistributionDesc: "प्रशिक्षण डेटासेट में विभिन्न फसल प्रकारों का वितरण",
      topCountries: "डेटासेट में शीर्ष देश/क्षेत्र",
      topCountriesDesc: "नमूना संख्या के आधार पर शीर्ष 10 देशों/क्षेत्रों का वितरण",
      correlationAnalysis: "विशेषता सहसंबंध विश्लेषण",
      correlationAnalysisDesc: "विशेषताओं और फसल उत्पादन के बीच विस्तृत सहसंबंध विश्लेषण",
      feature: "विशेषता",
      correlation: "सहसंबंध (%)",
      direction: "दिशा",
      strength: "शक्ति",
      positive: "सकारात्मक",
      negative: "नकारात्मक",
      strong: "मजबूत",
      moderate: "मध्यम",
      weak: "कमजोर",
      noDataAvailable: "कोई डेटा उपलब्ध नहीं",
      backendNotRunning: "बैकएंड सर्वर चल नहीं रहा है या मॉडल प्रशिक्षित नहीं है।",
      quickSetup: "त्वरित सेटअप:",
      openTerminal: "बैकएंड फ़ोल्डर में टर्मिनल खोलें",
      runCommand: "चलाएं: python main.py",
      waitMessage: "'मॉडल सफलतापूर्वक प्रशिक्षित' संदेश की प्रतीक्षा करें",
      refreshPage: "इस पृष्ठ को रीफ्रेश करें",
      checkAgain: "फिर से जांचें",
      retryConnection: "कनेक्शन पुनः प्रयास करें"
    }
  },
  te: {
    translation: {
      // Navigation
      dashboard: "డాష్‌బోర్డ్",
      predict: "అంచనా",
      visualize: "దృశ్యీకరణ",
      chat: "చాట్ సహాయకుడు",
      
      // Common
      loading: "లోడ్ అవుతోంది...",
      error: "లోపం",
      common: {
        error: "లోపం"
      },
      submit: "సమర్పించు",
      cancel: "రద్దు చేయి",
      save: "భద్రపరచు",
      close: "మూసివేయి",
      
      // Home page
      welcome: "Farm Cast కు స్వాగతం",
      subtitle: "స్మార్ట్ వ్యవసాయం కోసం AI-శక్తితో కూడిన పంట దిగుబడి అంచనా",
      description: "అధునాతన మెషిన్ లెర్నింగ్ అల్గోరిథమ్‌లను ఉపయోగించి ఖచ్చితమైన పంట దిగుబడి అంచనాలను పొందండి. డేటా-ఆధారిత అంతర్దృష్టులతో మీ వ్యవసాయ కార్యకలాపాల గురించి సమాచార నిర్ణయాలు తీసుకోండి.",
      getStarted: "ప్రారంభించండి",
      learnMore: "మరింత తెలుసుకోండి",
      
      // Model Status
      modelStatus: "ML మోడల్ స్థితి",
      modelReady: "మోడల్ శిక్షణ పొందింది మరియు అంచనాలకు సిద్ధంగా ఉంది",
      modelNotTrained: "మోడల్‌కు శిక్షణ అవసరం",
      ready: "సిద్ధం",
      notTrained: "శిక్షణ పొందలేదు",
      training: "శిక్షణ పొందుతోంది...",
      trainModel: "మోడల్‌కు శిక్షణ ఇవ్వండి",
      
      // Dataset Overview
      datasetOverview: "డేటాసెట్ అవలోకనం",
      totalSamples: "మొత్తం నమూనాలు",
      countries: "దేశాలు",
      avgYield: "సగటు దిగుబడి",
      yearRange: "సంవత్సరాల పరిధి",
      topFeatures: "దిగుబడిని ప్రభావితం చేసే ముఖ్య లక్షణాలు",
      
      // Features
      features: "లక్షణాలు",
      aiPrediction: "AI అంచనా",
      aiPredictionDesc: "ఖచ్చితమైన దిగుబడి అంచనా కోసం అధునాతన మెషిన్ లెర్నింగ్ మోడల్‌లు",
      dataVisualization: "డేటా దృశ్యీకరణ",
      dataVisualizationDesc: "మీ డేటాను బాగా అర్థం చేసుకోవడానికి ఇంటరాక్టివ్ చార్ట్‌లు మరియు గ్రాఫ్‌లు",
      smartRecommendations: "స్మార్ట్ సిఫార్సులు",
      smartRecommendationsDesc: "మీ నిర్దిష్ట పరిస్థితుల ఆధారంగా వ్యక్తిగతీకరించిన వ్యవసాయ చిట్కాలు",
      
      // Prediction page
      cropYieldPrediction: "పంట దిగుబడి అంచనా",
      enterDetails: "AI-శక్తితో కూడిన దిగుబడి అంచనాలను పొందడానికి దిగువ మీ వ్యవసాయ వివరాలను నమోదు చేయండి",
      cropType: "పంట రకం",
      selectCrop: "ఒక పంటను ఎంచుకోండి",
      loadingCrops: "పంటలు లోడ్ అవుతున్నాయి...",
      region: "ప్రాంతం",
      selectRegion: "ఒక ప్రాంతాన్ని ఎంచుకోండి",
      loadingRegions: "ప్రాంతాలు లోడ్ అవుతున్నాయి...",
      country: "దేశం",
      selectCountry: "ఒక దేశాన్ని ఎంచుకోండి",
      year: "సంవత్సరం",
      rainfall: "వర్షపాతం (మిమీ)",
      pesticides: "పురుగుమందులు (టన్నులు)",
      avgTemp: "సగటు ఉష్ణోగ్రత (°C)",
      area: "వైశాల్యం (హెక్టార్లు)",
      getPrediction: "అంచనా పొందండి",
      
      // Results
      predictedYield: "అంచనా వేసిన దిగుబడి",
      confidence: "విశ్వాసం",
      recommendations: "సిఫార్సులు",
      
      // Chatbot
      chatAssistant: "వ్యవసాయ సహాయకుడు",
      chatPlaceholder: "వ్యవసాయం, పంటలు లేదా అంచనాల గురించి నన్ను ఏదైనా అడగండి...",
      sendMessage: "సందేశం పంపండి",
      chatWelcome: "నమస్కారం! నేను మీ వ్యవసాయ సహాయకుడిని. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?",
      
      // Language selector
      language: "భాష",
      selectLanguage: "భాషను ఎంచుకోండి",
      
      // Visualization page
      dataVisualizationTitle: "డేటా దృశ్యీకరణ మరియు విశ్లేషణ",
      visualization: {
        title: "డేటా దృశ్యీకరణ",
        subtitle: "మీ పంట దిగుబడి డేటా నుండి ఇంటరాక్టివ్ చార్ట్‌లు మరియు అంతర్దృష్టులు",
        selectCropRegion: "పంట మరియు ప్రాంతాన్ని ఎంచుకోండి",
        selectBothMessage: "దృశ్యీకరణను చూడటానికి దయచేసి పంట మరియు ప్రాంతం రెండింటినీ ఎంచుకోండి.",
        loadingData: "దృశ్యీకరణ డేటా లోడ్ అవుతోంది...",
        yieldTrends: "కాలక్రమేణా దిగుబడి ధోరణులు",
        historicalYield: "చారిత్రక దిగుబడి",
        predictedYield: "అంచనా వేసిన దిగుబడి",
        yourPrediction: "మీ అంచనా"
      },
      featureImportance: "లక్షణ ప్రాముఖ్యత",
      featureImportanceDesc: "పంట దిగుబడి అంచనాలపై ఏ కారకాలు అత్యధిక ప్రభావం చూపుతాయో చూపిస్తుంది",
      featureCorrelation: "దిగుబడితో లక్షణ సహసంబంధం",
      featureCorrelationDesc: "సానుకూల సహసంబంధాలు (ఆకుపచ్చ) దిగుబడిని పెంచుతాయి, ప్రతికూల సహసంబంధాలు (ఎరుపు) దానిని తగ్గిస్తాయి",
      cropDistribution: "డేటాసెట్‌లో పంట పంపిణీ",
      cropDistributionDesc: "శిక్షణ డేటాసెట్‌లో వివిధ పంట రకాల పంపిణీ",
      topCountries: "డేటాసెట్‌లో అగ్ర దేశాలు/ప్రాంతాలు",
      topCountriesDesc: "నమూనా సంఖ్య ఆధారంగా అగ్ర 10 దేశాలు/ప్రాంతాల పంపిణీ",
      correlationAnalysis: "లక్షణ సహసంబంధ విశ్లేషణ",
      correlationAnalysisDesc: "లక్షణాలు మరియు పంట దిగుబడి మధ్య వివరణాత్మక సహసంబంధ విశ్లేషణ",
      feature: "లక్షణం",
      correlation: "సహసంబంధం (%)",
      direction: "దిశ",
      strength: "బలం",
      positive: "సానుకూలం",
      negative: "ప్రతికూలం",
      strong: "బలమైన",
      moderate: "మధ్యస్థం",
      weak: "బలహీనమైన",
      noDataAvailable: "డేటా అందుబాటులో లేదు",
      backendNotRunning: "బ్యాకెండ్ సర్వర్ నడుస్తోలేదు లేదా మోడల్ శిక్షణ పొందలేదు.",
      quickSetup: "త్వరిత సెటప్:",
      openTerminal: "బ్యాకెండ్ ఫోల్డర్‌లో టర్మినల్ తెరవండి",
      runCommand: "చలాయించండి: python main.py",
      waitMessage: "'మోడల్ విజయవంతంగా శిక్షణ పొందింది' సందేశం కోసం వేచి ఉండండి",
      refreshPage: "ఈ పేజీని రిఫ్రెష్ చేయండి",
      checkAgain: "మళ్లీ తనిఖీ చేయండి",
      retryConnection: "కనెక్షన్ మళ్లీ ప్రయత్నించండి"
    }
  },
  ta: {
    translation: {
      // Navigation
      dashboard: "டாஷ்போர்டு",
      predict: "முன்னறிவிப்பு",
      visualize: "காட்சிப்படுத்தல்",
      chat: "அரட்டை உதவியாளர்",
      
      // Common
      loading: "ஏற்றுகிறது...",
      error: "பிழை",
      common: {
        error: "பிழை"
      },
      submit: "சமர்ப்பிக்கவும்",
      cancel: "ரத்துசெய்",
      save: "சேமி",
      close: "மூடு",
      
      // Home page
      welcome: "Farm Cast இல் வரவேற்கிறோம்",
      subtitle: "ஸ்மார்ட் விவசாயத்திற்கான AI-இயங்கும் பயிர் விளைச்சல் முன்னறிவிப்பு",
      description: "மேம்பட்ட இயந்திர கற்றல் அல்காரிதங்களைப் பயன்படுத்தி துல்லியமான பயிர் விளைச்சல் முன்னறிவிப்புகளைப் பெறுங்கள். தரவு-உந்துதல் நுண்ணறிவுகளுடன் உங்கள் விவசாய நடவடிக்கைகள் பற்றி தகவலறிந்த முடிவுகளை எடுங்கள்.",
      getStarted: "தொடங்குங்கள்",
      learnMore: "மேலும் அறிக",
      
      // Model Status
      modelStatus: "ML மாதிரி நிலை",
      modelReady: "மாதிரி பயிற்சி பெற்று முன்னறிவிப்புகளுக்கு தயாராக உள்ளது",
      modelNotTrained: "மாதிரிக்கு பயிற்சி தேவை",
      ready: "தயார்",
      notTrained: "பயிற்சி பெறாத",
      training: "பயிற்சி அளிக்கிறது...",
      trainModel: "மாதிரிக்கு பயிற்சி அளிக்கவும்",
      
      // Dataset Overview
      datasetOverview: "தரவுத்தொகுப்பு கண்ணோட்டம்",
      totalSamples: "மொத்த மாதிரிகள்",
      countries: "நாடுகள்",
      avgYield: "சராசரி விளைச்சல்",
      yearRange: "ஆண்டு வரம்பு",
      topFeatures: "விளைச்சலை பாதிக்கும் முக்கிய அம்சங்கள்",
      
      // Features
      features: "அம்சங்கள்",
      aiPrediction: "AI முன்னறிவிப்பு",
      aiPredictionDesc: "துல்லியமான விளைச்சல் முன்னறிவிப்புக்கான மேம்பட்ட இயந்திர கற்றல் மாதிரிகள்",
      dataVisualization: "தரவு காட்சிப்படுத்தல்",
      dataVisualizationDesc: "உங்கள் தரவை சிறப்பாக புரிந்துகொள்ள ஊடாடும் விளக்கப்படங்கள் மற்றும் வரைபடங்கள்",
      smartRecommendations: "ஸ்மார்ட் பரிந்துரைகள்",
      smartRecommendationsDesc: "உங்கள் குறிப்பிட்ட நிலைமைகளின் அடிப்படையில் தனிப்பயனாக்கப்பட்ட விவசாய குறிப்புகள்",
      
      // Prediction page
      cropYieldPrediction: "பயிர் விளைச்சல் முன்னறிவிப்பு",
      enterDetails: "AI-இயங்கும் விளைச்சல் முன்னறிவிப்புகளைப் பெற கீழே உங்கள் விவசாய விவரங்களை உள்ளிடவும்",
      cropType: "பயிர் வகை",
      selectCrop: "ஒரு பயிரைத் தேர்ந்தெடுக்கவும்",
      loadingCrops: "பயிர்கள் ஏற்றப்படுகின்றன...",
      region: "பகுதி",
      selectRegion: "ஒரு பகுதியைத் தேர்ந்தெடுக்கவும்",
      loadingRegions: "பகுதிகள் ஏற்றப்படுகின்றன...",
      country: "நாடு",
      selectCountry: "ஒரு நாட்டைத் தேர்ந்தெடுக்கவும்",
      year: "ஆண்டு",
      rainfall: "மழைப்பொழிவு (மிமீ)",
      pesticides: "பூச்சிக்கொல்லிகள் (டன்கள்)",
      avgTemp: "சராசரி வெப்பநிலை (°C)",
      area: "பரப்பளவு (ஹெக்டேர்கள்)",
      getPrediction: "முன்னறிவிப்பு பெறுங்கள்",
      
      // Results
      predictedYield: "முன்னறிவிக்கப்பட்ட விளைச்சல்",
      confidence: "நம்பிக்கை",
      recommendations: "பரிந்துரைகள்",
      
      // Chatbot
      chatAssistant: "விவசாய உதவியாளர்",
      chatPlaceholder: "விவசாயம், பயிர்கள் அல்லது முன்னறிவிப்புகள் பற்றி என்னிடம் ஏதையும் கேளுங்கள்...",
      sendMessage: "செய்தி அனுப்பவும்",
      chatWelcome: "வணக்கம்! நான் உங்கள் விவசாய உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
      
      // Language selector
      language: "மொழி",
      selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
      
      // Visualization page
      dataVisualizationTitle: "தரவு காட்சிப்படுத்தல் மற்றும் பகுப்பாய்வு",
      visualization: {
        title: "தரவு காட்சிப்படுத்தல்",
        subtitle: "உங்கள் பயிர் விளைச்சல் தரவிலிருந்து ஊடாடும் விளக்கப்படங்கள் மற்றும் நுண்ணறிவுகள்",
        selectCropRegion: "பயிர் மற்றும் பகுதியைத் தேர்ந்தெடுக்கவும்",
        selectBothMessage: "காட்சிப்படுத்தலைக் காண தயவுசெய்து பயிர் மற்றும் பகுதி இரண்டையும் தேர்ந்தெடுக்கவும்.",
        loadingData: "காட்சிப்படுத்தல் தரவு ஏற்றப்படுகிறது...",
        yieldTrends: "காலப்போக்கில் விளைச்சல் போக்குகள்",
        historicalYield: "வரலாற்று விளைச்சல்",
        predictedYield: "கணிக்கப்பட்ட விளைச்சல்",
        yourPrediction: "உங்கள் கணிப்பு"
      },
      featureImportance: "அம்ச முக்கியத்துவம்",
      featureImportanceDesc: "பயிர் விளைச்சல் முன்னறிவிப்புகளில் எந்த காரணிகள் அதிக தாக்கத்தை ஏற்படுத்துகின்றன என்பதைக் காட்டுகிறது",
      featureCorrelation: "விளைச்சலுடன் அம்ச தொடர்பு",
      featureCorrelationDesc: "நேர்மறை தொடர்புகள் (பச்சை) விளைச்சலை அதிகரிக்கும், எதிர்மறை தொடர்புகள் (சிவப்பு) அதைக் குறைக்கும்",
      cropDistribution: "தரவுத்தொகுப்பில் பயிர் விநியோகம்",
      cropDistributionDesc: "பயிற்சி தரவுத்தொகுப்பில் வெவ்வேறு பயிர் வகைகளின் விநியோகம்",
      topCountries: "தரவுத்தொகுப்பில் முதன்மை நாடுகள்/பகுதிகள்",
      topCountriesDesc: "மாதிரி எண்ணிக்கையின் அடிப்படையில் முதல் 10 நாடுகள்/பகுதிகளின் விநியோகம்",
      correlationAnalysis: "அம்ச தொடர்பு பகுப்பாய்வு",
      correlationAnalysisDesc: "அம்சங்கள் மற்றும் பயிர் விளைச்சல் இடையே விரிவான தொடர்பு பகுப்பாய்வு",
      feature: "அம்சம்",
      correlation: "தொடர்பு (%)",
      direction: "திசை",
      strength: "வலிமை",
      positive: "நேர்மறை",
      negative: "எதிர்மறை",
      strong: "வலுவான",
      moderate: "மிதமான",
      weak: "பலவீனமான",
      noDataAvailable: "தரவு கிடைக்கவில்லை",
      backendNotRunning: "பின்தள சேவையகம் இயங்கவில்லை அல்லது மாதிரி பயிற்சி பெறவில்லை.",
      quickSetup: "விரைவு அமைப்பு:",
      openTerminal: "பின்தள கோப்புறையில் டெர்மினலைத் திறக்கவும்",
      runCommand: "இயக்கவும்: python main.py",
      waitMessage: "'மாதிரி வெற்றிகரமாக பயிற்சி பெற்றது' செய்திக்காக காத்திருக்கவும்",
      refreshPage: "இந்தப் பக்கத்தை புதுப்பிக்கவும்",
      checkAgain: "மீண்டும் சரிபார்க்கவும்",
      retryConnection: "இணைப்பை மீண்டும் முயற்சிக்கவும்"
    }
  },
  bn: {
    translation: {
      // Navigation
      dashboard: "ড্যাশবোর্ড",
      predict: "পূর্বাভাস",
      visualize: "দৃশ্যায়ন",
      chat: "চ্যাট সহায়ক",
      
      // Common
      loading: "লোড হচ্ছে...",
      error: "ত্রুটি",
      submit: "জমা দিন",
      cancel: "বাতিল",
      save: "সংরক্ষণ",
      close: "বন্ধ",
      
      // Home page
      welcome: "Farm Cast এ স্বাগতম",
      subtitle: "স্মার্ট কৃষির জন্য AI-চালিত ফসলের ফলন পূর্বাভাস",
      description: "উন্নত মেশিন লার্নিং অ্যালগরিদম ব্যবহার করে নির্ভুল ফসলের ফলন পূর্বাভাস পান। ডেটা-চালিত অন্তর্দৃষ্টি দিয়ে আপনার কৃষি কার্যক্রম সম্পর্কে সচেতন সিদ্ধান্ত নিন।",
      getStarted: "শুরু করুন",
      learnMore: "আরও জানুন",
      
      // Features
      features: "বৈশিষ্ট্য",
      aiPrediction: "AI পূর্বাভাস",
      aiPredictionDesc: "নির্ভুল ফলন পূর্বাভাসের জন্য উন্নত মেশিন লার্নিং মডেল",
      dataVisualization: "ডেটা দৃশ্যায়ন",
      dataVisualizationDesc: "আপনার ডেটা ভালোভাবে বুঝতে ইন্টারঅ্যাক্টিভ চার্ট এবং গ্রাফ",
      smartRecommendations: "স্মার্ট সুপারিশ",
      smartRecommendationsDesc: "আপনার নির্দিষ্ট অবস্থার উপর ভিত্তি করে ব্যক্তিগতকৃত কৃষি টিপস",
      
      // Prediction page
      cropYieldPrediction: "ফসলের ফলন পূর্বাভাস",
      enterDetails: "AI-চালিত ফলন পূর্বাভাস পেতে নিচে আপনার কৃষি বিবরণ প্রবেশ করান",
      cropType: "ফসলের ধরন",
      selectCrop: "একটি ফসল নির্বাচন করুন",
      country: "দেশ",
      selectCountry: "একটি দেশ নির্বাচন করুন",
      year: "বছর",
      rainfall: "বৃষ্টিপাত (মিমি)",
      pesticides: "কীটনাশক (টন)",
      avgTemp: "গড় তাপমাত্রা (°C)",
      area: "এলাকা (হেক্টর)",
      getPrediction: "পূর্বাভাস পান",
      
      // Results
      predictedYield: "পূর্বাভাসিত ফলন",
      confidence: "আস্থা",
      recommendations: "সুপারিশ",
      
      // Chatbot
      chatAssistant: "কৃষি সহায়ক",
      chatPlaceholder: "কৃষি, ফসল বা পূর্বাভাস সম্পর্কে আমাকে যেকোনো কিছু জিজ্ঞাসা করুন...",
      sendMessage: "বার্তা পাঠান",
      chatWelcome: "নমস্কার! আমি আপনার কৃষি সহায়ক। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
      
      // Language selector
      language: "ভাষা",
      selectLanguage: "ভাষা নির্বাচন করুন",
      
      // Visualization page
      dataVisualizationTitle: "ডেটা দৃশ্যায়ন এবং বিশ্লেষণ",
      featureImportance: "বৈশিষ্ট্যের গুরুত্ব",
      featureImportanceDesc: "ফসলের ফলন পূর্বাভাসে কোন কারণগুলি সবচেয়ে বেশি প্রভাব ফেলে তা দেখায়",
      featureCorrelation: "ফলনের সাথে বৈশিষ্ট্যের সম্পর্ক",
      featureCorrelationDesc: "ইতিবাচক সম্পর্ক (সবুজ) ফলন বৃদ্ধি করে, নেতিবাচক সম্পর্ক (লাল) তা হ্রাস করে",
      cropDistribution: "ডেটাসেটে ফসল বিতরণ",
      cropDistributionDesc: "প্রশিক্ষণ ডেটাসেটে বিভিন্ন ফসলের ধরনের বিতরণ",
      topCountries: "ডেটাসেটে শীর্ষ দেশ/অঞ্চল",
      topCountriesDesc: "নমুনা সংখ্যার ভিত্তিতে শীর্ষ ১০ দেশ/অঞ্চলের বিতরণ",
      correlationAnalysis: "বৈশিষ্ট্য সম্পর্ক বিশ্লেষণ",
      correlationAnalysisDesc: "বৈশিষ্ট্য এবং ফসলের ফলনের মধ্যে বিস্তারিত সম্পর্ক বিশ্লেষণ",
      feature: "বৈশিষ্ট্য",
      correlation: "সম্পর্ক (%)",
      direction: "দিক",
      strength: "শক্তি",
      positive: "ইতিবাচক",
      negative: "নেতিবাচক",
      strong: "শক্তিশালী",
      moderate: "মাঝারি",
      weak: "দুর্বল",
      noDataAvailable: "কোনো ডেটা উপলব্ধ নেই",
      backendNotRunning: "ব্যাকএন্ড সার্ভার চালু নেই বা মডেল প্রশিক্ষিত নয়।",
      quickSetup: "দ্রুত সেটআপ:",
      openTerminal: "ব্যাকএন্ড ফোল্ডারে টার্মিনাল খুলুন",
      runCommand: "চালান: python main.py",
      waitMessage: "'মডেল সফলভাবে প্রশিক্ষিত' বার্তার জন্য অপেক্ষা করুন",
      refreshPage: "এই পৃষ্ঠা রিফ্রেশ করুন",
      checkAgain: "আবার পরীক্ষা করুন",
      retryConnection: "সংযোগ পুনরায় চেষ্টা করুন"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  });

export default i18n;
