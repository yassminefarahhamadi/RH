const Tesseract = require('tesseract.js');
const Jimp = require('jimp');
const natural = require('natural');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

// Configuration des mots-clés spécifiques aux documents tunisiens
const tunisianKeywords = {
  carte_identite: [
    // Français
    'république', 'tunisienne', 'identité', 'nom', 'prénom', 'naissance', 
    'nationalité', 'carte', 'id', 'numéro', 'lieu', 'date', 'adresse',
    // Arabe
    'الجمهورية', 'التونسية', 'هوية', 'اسم', 'لقب', 'الميلاد', 'جنسية', 
    'بطاقة', 'تعريف', 'رقم', 'مكان', 'تاريخ', 'عنوان', 'تونس',
    // Format du numéro CIN (8 chiffres)
    /\b\d{8}\b/
  ],
  dossier_medical: [
    // Français
    'médecin', 'santé', 'vaccination', 'certificat', 'médical', 'health', 
    'doctor', 'patient', 'diagnostic', 'traitement', 'ordonnance',
    // Arabe
    'طبيب', 'صحة', 'تلقيح', 'شهادة', 'طبي', 'صحي', 'مستشفى', 'مريض',
    'تشخيص', 'علاج', 'وصفة', 'عافية'
  ],
  diplome: [
    // Français
    'diplôme', 'université', 'république', 'licence', 'master', 'baccalauréat', 
    'diploma', 'degree', 'certificat', 'éducation', 'études',
    // Arabe
    'دبلوم', 'شهادة', 'جامعة', 'جمهورية', 'إجازة', 'ماستر', 'باكالوريا',
    'تونس', 'التربية', 'التعليم', 'العاليمي', 'الدراسة', 'النجاح', 'امتياز'
  ],
  releve_notes: [
    // Français
    'notes', 'moyenne', 'examen', 'semestre', 'module', 'bulletin', 'note', 
    'score', 'résultat', 'appréciation', 'coefficient',
    // Arabe
    'نقاط', 'معدل', 'امتحان', 'فصل', 'وحدة', 'كشف', 'نتيجة', 'علامة',
    'الجامعي', 'التربية', 'التعليم', 'العاليمي', 'الدرجات', 'المادة'
  ]
};

class TunisianDocumentAnalyzer {
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

      // Vérifier si le fichier existe
      if (!fs.existsSync(filePath)) {
        results.isValid = false;
        results.issues.push('Fichier introuvable');
        return results;
      }

      // Prétraiter l'image (uniquement pour les images)
      let processedFilePath = filePath;
      if (!filePath.toLowerCase().endsWith('.pdf')) {
        processedFilePath = await this.preprocessImage(filePath);
      }

      // 1. Vérifier la qualité de l'image (uniquement pour les images)
      if (!filePath.toLowerCase().endsWith('.pdf')) {
        const imageAnalysis = await this.analyzeImageQuality(processedFilePath);
        results.details.imageQuality = imageAnalysis;
        
        if (imageAnalysis.isDark) {
          results.isValid = false;
          results.isDark = true;
          results.issues.push('Image trop sombre');
        }

        if (imageAnalysis.isBlurry) {
          results.isValid = false;
          results.isBlurry = true;
          results.issues.push('Image floue');
        }
      } else {
        // Pour les PDF, on ajoute une indication
        results.details.imageQuality = { isPdf: true, note: 'Analyse de qualité non applicable aux PDF' };
      }

      // 2. Extraire le texte avec support de l'arabe et du français
      const textAnalysis = await this.extractText(processedFilePath);
      results.details.textAnalysis = textAnalysis;
      
      if (textAnalysis.text && textAnalysis.text.length > 10) {
        results.textFound = true;
        results.confidence = textAnalysis.confidence;
        
        // 3. Vérifier la pertinence du contenu
        const relevance = this.checkRelevance(textAnalysis.text, documentType);
        results.isRelevant = relevance.isRelevant;
        results.details.relevance = relevance;
        
        // 4. Validation spécifique aux documents tunisiens
        const validation = this.validateTunisianDocument(textAnalysis.text, documentType);
        results.details.validation = validation;
        
        if (!relevance.isRelevant) {
          results.isValid = false;
          results.issues.push('Document non pertinent: ' + relevance.reason);
        }
        
        if (!validation.isValid) {
          results.isValid = false;
          results.issues.push('Document invalide: ' + validation.reason);
        }
        
        if (textAnalysis.confidence < 40 && !filePath.toLowerCase().endsWith('.pdf')) {
          results.isValid = false;
          results.issues.push('Texte illisible (confiance OCR faible)');
        }
      } else {
        results.isValid = false;
        results.issues.push('Aucun texte significatif détecté');
      }

      // Nettoyer le fichier traité temporaire
      if (processedFilePath !== filePath && fs.existsSync(processedFilePath)) {
        fs.unlinkSync(processedFilePath);
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

  // Prétraiter l'image pour améliorer l'OCR
  async preprocessImage(imagePath) {
    try {
      const image = await Jimp.read(imagePath);
      
      // Améliorations pour les documents tunisiens
      image
        .contrast(0.5) // Ajuster le contraste
        .brightness(0.1) // Ajuster la luminosité
        .greyscale() // Convertir en niveaux de gris
        .normalize(); // Normaliser l'image
      
      // Sauvegarder l'image traitée
      const processedPath = path.join(path.dirname(imagePath), 'processed_' + path.basename(imagePath));
      await image.writeAsync(processedPath);
      
      return processedPath;
    } catch (error) {
      console.error('Erreur lors du prétraitement de l\'image:', error);
      return imagePath; // Retourner le chemin original en cas d'erreur
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

  // Extraire le texte avec Tesseract (images) ou pdf-parse (PDF)
  async extractText(filePath) {
    try {
      // Vérifier si le fichier existe
      if (!fs.existsSync(filePath)) {
        return { text: '', confidence: 0 };
      }

      // Si c'est un PDF, utiliser pdf-parse
      if (filePath.toLowerCase().endsWith('.pdf')) {
        try {
          const dataBuffer = fs.readFileSync(filePath);
          const data = await pdfParse(dataBuffer);
          return {
            text: data.text,
            confidence: 80 // Valeur par défaut pour les PDF
          };
        } catch (pdfError) {
          console.error('Erreur lecture PDF:', pdfError);
          return { text: '', confidence: 0 };
        }
      } else {
        // Pour les images, utiliser Tesseract avec les langues arabe et française
        const { data } = await Tesseract.recognize(filePath, 'ara+fra', {
          logger: message => {
            if (message.status === 'recognizing text') {
              console.log(`Progression OCR: ${message.progress * 100}%`);
            }
          },
          // Configuration pour les documents
          tessedit_pageseg_mode: 6, // Mode de segmentation pour document unique
          tessedit_ocr_engine_mode: 3 // Mode de moteur OCR par défaut
        });
        
        return {
          text: data.text,
          confidence: data.confidence
        };
      }
    } catch (error) {
      console.error('Erreur extraction texte:', error);
      return { text: '', confidence: 0 };
    }
  }

  // Vérifier la pertinence du contenu
  checkRelevance(text, documentType) {
    const lowerText = text.toLowerCase();
    const keywords = tunisianKeywords[documentType] || [];
    let foundKeywords = [];
    
    keywords.forEach(keyword => {
      if (typeof keyword === 'string') {
        // Vérifier à la fois la version arabe et française
        if (lowerText.includes(keyword)) {
          foundKeywords.push(keyword);
        }
      } else if (keyword instanceof RegExp) {
        // Vérifier les expressions régulières (comme le format CIN)
        if (keyword.test(text)) {
          foundKeywords.push(keyword.toString());
        }
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
        `Seulement ${foundKeywords.length} mot(s)-clé(s) trouvé(s) sur ${keywords.filter(k => typeof k === 'string').length} attendus`
    };
  }

  // Validation spécifique aux documents tunisiens
  validateTunisianDocument(text, documentType) {
    const patterns = {
      carte_identite: {
        pattern: /\b\d{8}\b/, // Format du numéro CIN (8 chiffres)
        reason: "Numéro CIN non trouvé"
      },
      diplome: {
        pattern: /(diplôme|شهادة|دبلوم)/i,
        reason: "Mot-clé de diplôme non trouvé"
      },
      releve_notes: {
        pattern: /(note|نقطة|معدل)/i,
        reason: "Mot-clé de relevé de notes non trouvé"
      },
      dossier_medical: {
        pattern: /(médical|طبي|صحة)/i,
        reason: "Mot-clé médical non trouvé"
      }
    };

    const validationPattern = patterns[documentType];
    if (!validationPattern) {
      return { isValid: true, reason: "Aucun pattern de validation défini pour ce type de document" };
    }

    const isValid = validationPattern.pattern.test(text);
    return {
      isValid,
      reason: isValid ? "Document valide" : validationPattern.reason
    };
  }
}

module.exports = new TunisianDocumentAnalyzer();