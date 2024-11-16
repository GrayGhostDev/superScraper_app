import { Page } from 'playwright';
import { notifications } from '../../../utils/notifications';

interface FormField {
  name: string;
  type: string;
  label?: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  value?: string;
}

interface FormStructure {
  id?: string;
  action?: string;
  method: string;
  fields: FormField[];
  submitButton?: {
    text: string;
    selector: string;
  };
}

export class FormAnalyzer {
  async analyzeForms(page: Page): Promise<FormStructure[]> {
    try {
      return await page.evaluate(() => {
        const forms = Array.from(document.forms);
        return forms.map(form => {
          const fields = Array.from(form.elements)
            .filter((el): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement => 
              el instanceof HTMLInputElement ||
              el instanceof HTMLSelectElement ||
              el instanceof HTMLTextAreaElement
            )
            .map(field => {
              const label = field.labels?.[0]?.textContent?.trim() ||
                document.querySelector(`label[for="${field.id}"]`)?.textContent?.trim();

              const fieldData: FormField = {
                name: field.name,
                type: field.type,
                label,
                required: field.required,
                placeholder: field.placeholder
              };

              if (field instanceof HTMLSelectElement) {
                fieldData.options = Array.from(field.options).map(opt => opt.text);
              }

              return fieldData;
            });

          const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');

          return {
            id: form.id,
            action: form.action,
            method: form.method.toUpperCase(),
            fields,
            submitButton: submitButton ? {
              text: submitButton.textContent?.trim() || 'Submit',
              selector: this.getUniqueSelector(submitButton)
            } : undefined
          };
        });
      });
    } catch (error) {
      console.error('Form analysis error:', error);
      notifications.show('Failed to analyze forms', 'error');
      return [];
    }
  }

  private getUniqueSelector(element: Element): string {
    if (element.id) {
      return `#${element.id}`;
    }

    let path = [];
    let current = element;

    while (current) {
      let selector = current.tagName.toLowerCase();
      
      if (current.className) {
        selector += `.${current.className.split(' ').join('.')}`;
      }

      const siblings = Array.from(current.parentElement?.children || [])
        .filter(el => el.tagName === current.tagName);

      if (siblings.length > 1) {
        const index = siblings.indexOf(current as Element) + 1;
        selector += `:nth-child(${index})`;
      }

      path.unshift(selector);
      current = current.parentElement as Element;
    }

    return path.join(' > ');
  }
}