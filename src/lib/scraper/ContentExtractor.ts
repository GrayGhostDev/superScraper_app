import { Page } from 'playwright';
import { Page as PuppeteerPage } from 'puppeteer';
import { WebDriver } from 'selenium-webdriver';
import { notifications } from '../../utils/notifications';
import natural from 'natural';

export class ContentExtractor {
  private tokenizer = new natural.WordTokenizer();
  private sentenceTokenizer = new natural.SentenceTokenizer();
  private tfidf = new natural.TfIdf();

  async extractStructuredContent(page: Page | PuppeteerPage | WebDriver) {
    try {
      const content = await this.getAllContent(page);
      const structuredData = {
        mainContent: await this.extractMainContent(content),
        pricing: await this.extractPricing(content),
        dates: await this.extractDates(content),
        locations: await this.extractLocations(content),
        contactInfo: await this.extractContactInfo(content),
        socialMedia: await this.extractSocialMedia(page),
        tables: await this.extractTables(page),
        lists: await this.extractLists(page),
        keywords: await this.extractKeywords(content),
        fileDownloads: await this.extractFileDownloads(page),
        microdata: await this.extractMicrodata(page),
        openGraph: await this.extractOpenGraph(page)
      };

      return structuredData;
    } catch (error) {
      console.error('Content extraction error:', error);
      notifications.show('Failed to extract structured content', 'error');
      throw error;
    }
  }

  private async getAllContent(page: any): Promise<string> {
    return page.evaluate(() => document.body.innerText);
  }

  private async extractMainContent(content: string) {
    const sentences = this.sentenceTokenizer.tokenize(content);
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 50);
    
    return {
      sentences: sentences.filter(s => s.length > 20),
      paragraphs: paragraphs.map(p => ({
        text: p,
        wordCount: this.tokenizer.tokenize(p).length
      }))
    };
  }

  private async extractPricing(content: string) {
    const priceRegex = /\$\s?\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s?(?:USD|dollars)/gi;
    const matches = content.match(priceRegex) || [];
    return matches.map(price => ({
      raw: price,
      value: parseFloat(price.replace(/[^\d.]/g, ''))
    }));
  }

  private async extractDates(content: string) {
    const dateRegex = /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/gi;
    return content.match(dateRegex) || [];
  }

  private async extractLocations(content: string) {
    const locationRegex = /\b(?:[A-Z][a-z]+ ){1,2}(?:Road|Street|Avenue|Boulevard|Lane|Drive|Circle|Square|Plaza|Court|Park|Way|Trail|Pike|Highway|Alley),?(?:\s+[A-Z][a-z]+,?)?\s+(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\s+\d{5}(?:-\d{4})?\b/g;
    return content.match(locationRegex) || [];
  }

  private async extractContactInfo(content: string) {
    const phoneRegex = /(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    return {
      phones: content.match(phoneRegex) || [],
      emails: content.match(emailRegex) || []
    };
  }

  private async extractSocialMedia(page: any) {
    return page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="facebook.com"], a[href*="twitter.com"], a[href*="instagram.com"], a[href*="linkedin.com"]'));
      return links.map(link => ({
        platform: link.href.match(/(?:facebook|twitter|instagram|linkedin)/i)?.[0].toLowerCase(),
        url: link.href
      }));
    });
  }

  private async extractTables(page: any) {
    return page.evaluate(() => {
      const tables = Array.from(document.querySelectorAll('table'));
      return tables.map(table => {
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent?.trim());
        const rows = Array.from(table.querySelectorAll('tr')).map(tr => 
          Array.from(tr.querySelectorAll('td')).map(td => td.textContent?.trim())
        ).filter(row => row.length > 0);
        return { headers, rows };
      });
    });
  }

  private async extractLists(page: any) {
    return page.evaluate(() => {
      const lists = Array.from(document.querySelectorAll('ul, ol'));
      return lists.map(list => ({
        type: list.tagName.toLowerCase(),
        items: Array.from(list.querySelectorAll('li')).map(li => li.textContent?.trim())
      }));
    });
  }

  private async extractKeywords(content: string) {
    this.tfidf.addDocument(content);
    const terms: { [key: string]: number } = {};
    
    this.tfidf.listTerms(0).forEach(item => {
      terms[item.term] = item.tfidf;
    });

    return Object.entries(terms)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([term, score]) => ({ term, score }));
  }

  private async extractFileDownloads(page: any) {
    return page.evaluate(() => {
      const fileExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'zip'];
      const links = Array.from(document.querySelectorAll('a[href]'));
      return links
        .filter(link => fileExtensions.some(ext => link.href.toLowerCase().endsWith(ext)))
        .map(link => ({
          url: link.href,
          text: link.textContent?.trim(),
          type: link.href.split('.').pop()?.toLowerCase()
        }));
    });
  }

  private async extractMicrodata(page: any) {
    return page.evaluate(() => {
      const microdata: any[] = [];
      const elements = document.querySelectorAll('[itemscope]');
      
      elements.forEach(element => {
        const properties: { [key: string]: string } = {};
        element.querySelectorAll('[itemprop]').forEach(prop => {
          const name = prop.getAttribute('itemprop');
          if (name) {
            properties[name] = prop.getAttribute('content') || prop.textContent?.trim() || '';
          }
        });
        
        microdata.push({
          type: element.getAttribute('itemtype'),
          properties
        });
      });
      
      return microdata;
    });
  }

  private async extractOpenGraph(page: any) {
    return page.evaluate(() => {
      const ogTags = document.querySelectorAll('meta[property^="og:"]');
      const data: { [key: string]: string } = {};
      
      ogTags.forEach(tag => {
        const property = tag.getAttribute('property');
        const content = tag.getAttribute('content');
        if (property && content) {
          data[property.replace('og:', '')] = content;
        }
      });
      
      return data;
    });
  }
}