import { notifications } from '../../../utils/notifications';
import natural from 'natural';

interface ClassificationResult {
  category: string;
  confidence: number;
  keywords: string[];
}

export class ContentClassifier {
  private classifier: natural.BayesClassifier;
  private tfidf: natural.TfIdf;
  private tokenizer: natural.WordTokenizer;

  constructor() {
    this.classifier = new natural.BayesClassifier();
    this.tfidf = new natural.TfIdf();
    this.tokenizer = new natural.WordTokenizer();

    // Train the classifier with sample data
    this.trainClassifier();
  }

  async classifyContent(text: string): Promise<ClassificationResult> {
    try {
      const tokens = this.tokenizer.tokenize(text);
      const category = this.classifier.classify(text);
      const classifications = this.classifier.getClassifications(text);
      const confidence = classifications.find(c => c.label === category)?.value || 0;

      // Extract keywords using TF-IDF
      this.tfidf.addDocument(text);
      const keywords = this.tfidf.listTerms(0)
        .sort((a, b) => b.tfidf - a.tfidf)
        .slice(0, 10)
        .map(term => term.term);

      return {
        category,
        confidence,
        keywords
      };
    } catch (error) {
      console.error('Content classification error:', error);
      notifications.show('Failed to classify content', 'error');
      throw error;
    }
  }

  private trainClassifier() {
    // Add training data for different categories
    this.classifier.addDocument('contact us email phone address', 'contact');
    this.classifier.addDocument('about company history mission', 'about');
    this.classifier.addDocument('product price cost buy purchase', 'product');
    this.classifier.addDocument('blog news article post', 'blog');
    this.classifier.addDocument('login sign in account register', 'authentication');
    this.classifier.addDocument('privacy policy terms conditions', 'legal');
    this.classifier.addDocument('help support faq question', 'support');
    
    // Train the classifier
    this.classifier.train();
  }
}