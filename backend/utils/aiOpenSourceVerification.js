const Tesseract = require('tesseract.js');
const Jimp = require('jimp');
const natural = require('natural');
const path = require('path');

// Configuration des mots-clés attendus par type de document
const expectedKeywords = {
  carte_identite: ['république', 'identité', 'nom', 'prénom', 'naissance', 'nationalité', 'carte', 'id'],
  diplome: ['diplôme', 'université', 'république', 'licence', 'master', 'baccalauréat', 'diploma', 'degree'],
  releve_notes: ['notes', 'moyenne', 'examen', 'semestre', 'module', 'bulletin', 'note', 'score'],
  doc_sante: ['médecin', 'santé', 'vaccination', 'certificat', 'medical', 'health', 'doctor']
};

class AIOpenSourceVerification {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
  }

  // Analyser un document
  async analyzeDocument(filePath, documentType) {
    try {
      const results = {
        isValid: true,
        issues: [],
        confidence: 0,
        textFound: false,
        isDark: false,
        isBlurry: false,
        isRelevant: false,
        details: {}
      };

      // 1. Vérifier la qualité de l'image
      const imageAnalysis = await this.analyzeImageQuality(filePath);
      results.details.imageQuality = imageAnalysis;
      
      if (imageAnalysis.isDark) {
        results.isValid = false;
        results.isDark = true;
        results.issues.push('Image trop sombre');
      }

      // 2. Extraire le texte
      const textAnalysis = await this.extractText(filePath);
      results.details.textAnalysis = textAnalysis;
      
      if (textAnalysis.text && textAnalysis.text.length > 10) {
        results.textFound = true;
        results.confidence = textAnalysis.confidence;
        
        // 3. Vérifier la pertinence du contenu
        const relevance = this.checkRelevance(textAnalysis.text, documentType);
        results.isRelevant = relevance.isRelevant;
        results.details.relevance = relevance;
        
        if (!relevance.isRelevant) {
          results.isValid = false;
          results.issues.push('Document non pertinent: ' + relevance.reason);
        }
        
        if (textAnalysis.confidence < 50) {
          results.isValid = false;
          results.issues.push('Texte illisible (confiance OCR faible)');
        }
      } else {
        results.isValid = false;
        results.issues.push('Aucun texte significatif détecté');
      }

      return results;
    } catch (error) {
      console.error('Erreur lors de l\'analyse open source:', error);
      return { 
        isValid: false, 
        issues: ['Échec de l\'analyse'], 
        error: error.message,
        details: {}
      };
    }
  }

  // Analyser la qualité de l'image
  async analyzeImageQuality(imagePath) {
    try {
      const image = await Jimp.read(imagePath);
      const results = {
        isDark: false,
        isBlurry: false,
        brightness: 0,
        contrast: 0,
        width: image.bitmap.width,
        height: image.bitmap.height
      };

      // Calculer la luminosité moyenne
      let totalBrightness = 0;
      image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
        const red = image.bitmap.data[idx];
        const green = image.bitmap.data[idx + 1];
        const blue = image.bitmap.data[idx + 2];
        const brightness = (red + green + blue) / 3;
        totalBrightness += brightness;
      });

      results.brightness = totalBrightness / (image.bitmap.width * image.bitmap.height);
      results.isDark = results.brightness < 50; // Seuil de luminosité

      // Calculer le contraste (approximation simple)
      const samplePoints = [
        {x: 10, y: 10}, 
        {x: image.bitmap.width - 10, y: 10},
        {x: 10, y: image.bitmap.height - 10},
        {x: image.bitmap.width - 10, y: image.bitmap.height - 10}
      ];

      let minBrightness = 255;
      let maxBrightness = 0;

      samplePoints.forEach(point => {
        const idx = (point.y * image.bitmap.width + point.x) * 4;
        const red = image.bitmap.data[idx];
        const green = image.bitmap.data[idx + 1];
        const blue = image.bitmap.data[idx + 2];
        const brightness = (red + green + blue) / 3;
        
        minBrightness = Math.min(minBrightness, brightness);
        maxBrightness = Math.max(maxBrightness, brightness);
      });

      results.contrast = maxBrightness - minBrightness;
      results.isBlurry = results.contrast < 50; // Seuil de contraste

      if (results.isBlurry) {
        results.issues.push('Image floue (contraste faible)');
      }

      return results;
    } catch (error) {
      console.error('Erreur lors de l\'analyse de l\'image:', error);
      return {
        isDark: false,
        isBlurry: false,
        brightness: 0,
        contrast: 0,
        error: error.message
      };
    }
  }

  // Extraire le texte avec Tesseract
  async extractText(imagePath) {
    try {
      const { data } = await Tesseract.recognize(imagePath, 'fra', {
        logger: message => {
          // Optionnel: logger les messages de progression
          if (message.status === 'recognizing text') {
            console.log(`Progression OCR: ${message.progress * 100}%`);
          }
        }
      });
      
      return {
        text: data.text,
        confidence: data.confidence
      };
    } catch (error) {
      console.error('Erreur OCR:', error);
      return { text: '', confidence: 0 };
    }
  }

  // Vérifier la pertinence du contenu
  checkRelevance(text, documentType) {
    const lowerText = text.toLowerCase();
    const keywords = expectedKeywords[documentType] || [];
    let foundKeywords = [];
    
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    });
    
    // Si au moins 2 mots-clés sont trouvés, le document est considéré comme pertinent
    const isRelevant = foundKeywords.length >= 2;
    
    return {
      isRelevant,
      foundKeywords,
      totalKeywords: keywords.length,
      reason: isRelevant ? 
        `Document pertinent (${foundKeywords.length} mots-clés trouvés)` : 
        `Seulement ${foundKeywords.length} mot(s)-clé(s) trouvé(s) sur ${keywords.length} attendus`
    };
  }
}

module.exports = new AIOpenSourceVerification();