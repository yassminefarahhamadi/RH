const Tesseract = require('tesseract.js');
const Jimp = require('jimp');
const natural = require('natural');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');


const tunisianKeywords = {
  carte_identite: [
    
    'république', 'tunisienne', 'identité', 'nom', 'prénom', 'naissance', 
    'nationalité', 'carte', 'id', 'numéro', 'lieu', 'date', 'adresse',
    
    'الجمهورية', 'التونسية', 'هوية', 'اسم', 'لقب', 'الميلاد', 'جنسية', 
    'بطاقة', 'تعريف', 'رقم', 'مكان', 'تاريخ', 'عنوان', 'تونس',
    // Format du numéro CIN (8 chiffres)
    /\b\d{8}\b/
  ],
  dossier_medical: [
   
    'médecin', 'santé', 'vaccination', 'certificat', 'médical', 'health', 
    'doctor', 'patient', 'diagnostic', 'traitement', 'ordonnance',
    
    'طبيب', 'صحة', 'تلقيح', 'شهادة', 'طبي', 'صحي', 'مستشفى', 'مريض',
    'تشخيص', 'علاج', 'وصفة', 'عافية'
  ],
  diplome: [
    
    'diplôme', 'université', 'république', 'licence', 'master', 'baccalauréat', 
    'diploma', 'degree', 'certificat', 'éducation', 'études',
    
    'دبلوم', 'شهادة', 'جامعة', 'جمهورية', 'إجازة', 'ماستر', 'باكالوريا',
    'تونس', 'التربية', 'التعليم', 'العاليمي', 'الدراسة', 'النجاح', 'امتياز'
  ],
  releve_notes: [
   
    'notes', 'moyenne', 'examen', 'semestre', 'module', 'bulletin', 'note', 
    'score', 'résultat', 'appréciation', 'coefficient',
    
    'نقاط', 'معدل', 'امتحان', 'فصل', 'وحدة', 'كشف', 'نتيجة', 'علامة',
    'الجامعي', 'التربية', 'التعليم', 'العاليمي', 'الدرجات', 'المادة'
  ]
};

class TunisianDocumentAnalyzer {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
  }

  
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

      
      if (!fs.existsSync(filePath)) {
        results.isValid = false;
        results.issues.push('Fichier introuvable');
        return results;
      }

      
      let processedFilePath = filePath;
      if (!filePath.toLowerCase().endsWith('.pdf')) {
        processedFilePath = await this.preprocessImage(filePath);
      }

      
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
        
        results.details.imageQuality = { isPdf: true, note: 'Analyse de qualité non applicable aux PDF' };
      }

      
      const textAnalysis = await this.extractText(processedFilePath);
      results.details.textAnalysis = textAnalysis;
      
      if (textAnalysis.text && textAnalysis.text.length > 10) {
        results.textFound = true;
        results.confidence = textAnalysis.confidence;
        
        
        const relevance = this.checkRelevance(textAnalysis.text, documentType);
        results.isRelevant = relevance.isRelevant;
        results.details.relevance = relevance;
        
       
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

  
  async preprocessImage(imagePath) {
    try {
      const image = await Jimp.read(imagePath);
      
      
      image
        .contrast(0.5) 
        .brightness(0.1) 
        .greyscale() 
        .normalize(); 
      
      
      const processedPath = path.join(path.dirname(imagePath), 'processed_' + path.basename(imagePath));
      await image.writeAsync(processedPath);
      
      return processedPath;
    } catch (error) {
      console.error('Erreur lors du prétraitement de l\'image:', error);
      return imagePath; 
    }
  }

  
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

      
      let totalBrightness = 0;
      image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
        const red = image.bitmap.data[idx];
        const green = image.bitmap.data[idx + 1];
        const blue = image.bitmap.data[idx + 2];
        const brightness = (red + green + blue) / 3;
        totalBrightness += brightness;
      });

      results.brightness = totalBrightness / (image.bitmap.width * image.bitmap.height);
      results.isDark = results.brightness < 50; 
      
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
      results.isBlurry = results.contrast < 50; 

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

  
  async extractText(filePath) {
    try {
      
      if (!fs.existsSync(filePath)) {
        return { text: '', confidence: 0 };
      }

      
      if (filePath.toLowerCase().endsWith('.pdf')) {
        try {
          const dataBuffer = fs.readFileSync(filePath);
          const data = await pdfParse(dataBuffer);
          return {
            text: data.text,
            confidence: 80 
          };
        } catch (pdfError) {
          console.error('Erreur lecture PDF:', pdfError);
          return { text: '', confidence: 0 };
        }
      } else {
        
        const { data } = await Tesseract.recognize(filePath, 'ara+fra', {
          logger: message => {
            if (message.status === 'recognizing text') {
              console.log(`Progression OCR: ${message.progress * 100}%`);
            }
          },
         
          tessedit_pageseg_mode: 6, 
          tessedit_ocr_engine_mode: 3 
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

  
  checkRelevance(text, documentType) {
    const lowerText = text.toLowerCase();
    const keywords = tunisianKeywords[documentType] || [];
    let foundKeywords = [];
    
    keywords.forEach(keyword => {
      if (typeof keyword === 'string') {
        
        if (lowerText.includes(keyword)) {
          foundKeywords.push(keyword);
        }
      } else if (keyword instanceof RegExp) {
        
        if (keyword.test(text)) {
          foundKeywords.push(keyword.toString());
        }
      }
    });
    
    
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

  
  validateTunisianDocument(text, documentType) {
    const patterns = {
      carte_identite: {
        pattern: /\b\d{8}\b/, 
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