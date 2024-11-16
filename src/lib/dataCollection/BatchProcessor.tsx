import { notifications } from '../../utils/notifications';
import { createWorker } from 'tesseract.js';
import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';
import natural from 'natural';

export class BatchProcessor {
  private tokenizer = new natural.WordTokenizer();
  private classifier = new natural.BayesClassifier();

  async processFiles(files: File[]): Promise<any[]> {
    try {
      const results = await Promise.all(
        files.map(file => this.processFile(file))
      );
      return results.filter(Boolean);
    } catch (error) {
      notifications.show('Error processing files', 'error');
      throw error;
    }
  }

  private async processFile(file: File) {
    const type = file.type;
    try {
      if (type.includes('image')) {
        return await this.processImage(file);
      } else if (type.includes('pdf')) {
        return await this.processPDF(file);
      } else if (type.includes('spreadsheet') || type.includes('excel')) {
        return await this.processSpreadsheet(file);
      } else if (type.includes('text')) {
        return await this.processText(file);
      }
    } catch (error) {
      notifications.show(`Error processing ${file.name}`, 'error');
      console.error(`Error processing ${file.name}:`, error);
      return null;
    }
  }

  private async processImage(file: File) {
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();
    return this.extractStructuredData(text);
  }

  private async processPDF(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    
    const textContent = [];
    for (const page of pages) {
      const { text } = await page.getTextContent();
      textContent.push(text);
    }
    
    return this.extractStructuredData(textContent.join(' '));
  }

  private async processSpreadsheet(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    return this.normalizeSpreadsheetData(jsonData);
  }

  private async processText(file: File) {
    const text = await file.text();
    return this.extractStructuredData(text);
  }

  private extractStructuredData(text: string) {
    const tokens = this.tokenizer.tokenize(text);
    const sentences = natural.SentenceTokenizer.tokenize(text);
    
    // Extract potential entities
    const entities = {
      dates: this.extractDates(text),
      amounts: this.extractAmounts(text),
      locations: this.extractLocations(text),
      people: this.extractPeople(text)
    };

    // Classify content
    const classification = this.classifyContent(text);

    return {
      rawText: text,
      tokens,
      sentences,
      entities,
      classification,
      metadata: {
        processedAt: new Date(),
        confidence: this.calculateConfidence(entities)
      }
    };
  }

  private normalizeSpreadsheetData(data: any[]) {
    // Convert spreadsheet data to consistent format
    return data.map(row => {
      const normalized: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(row)) {
        // Normalize field names
        const normalizedKey = key.toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
        
        // Convert dates
        if (value && XLSX.SSF.is_date(value)) {
          normalized[normalizedKey] = new Date(value);
        } else {
          normalized[normalizedKey] = value;
        }
      }
      
      return normalized;
    });
  }

  private extractDates(text: string): string[] {
    const dateRegex = /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/gi;
    return text.match(dateRegex) || [];
  }

  private extractAmounts(text: string): string[] {
    const amountRegex = /\$\s?\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s?(?:dollars|USD)/gi;
    return text.match(amountRegex) || [];
  }

  private extractLocations(text: string): string[] {
    // Simple location extraction - could be enhanced with NER models
    const locationRegex = /\b(?:[A-Z][a-z]+ )?(?:Street|Avenue|Road|Boulevard|Lane|Drive|Way|Plaza|Court|Circle|Highway|Hwy|Ave|Rd|Blvd|Ln|Dr|Ct|Cir)\b/g;
    return text.match(locationRegex) || [];
  }

  private extractPeople(text: string): string[] {
    // Simple person name extraction - could be enhanced with NER models
    const nameRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
    return text.match(nameRegex) || [];
  }

  private classifyContent(text: string): string {
    // Train classifier with sample data
    this.classifier.addDocument('accident vehicle collision crash', 'accident_report');
    this.classifier.addDocument('medical hospital injury treatment', 'medical_record');
    this.classifier.addDocument('insurance policy coverage claim', 'insurance_document');
    this.classifier.addDocument('police report incident investigation', 'police_report');
    this.classifier.train();

    return this.classifier.classify(text);
  }

  private calculateConfidence(entities: any): number {
    // Simple confidence calculation based on entity extraction
    const totalEntities = Object.values(entities).flat().length;
    const uniqueEntities = new Set(Object.values(entities).flat()).size;
    return Math.min(totalEntities / 10, 1) * (uniqueEntities / totalEntities);
  }
}