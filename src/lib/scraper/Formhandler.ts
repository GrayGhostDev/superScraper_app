import { Page } from 'playwright';
import { Page as PuppeteerPage } from 'puppeteer';
import { WebDriver } from 'selenium-webdriver';
import { notifications } from '../../utils/notifications';

interface FormField {
  name: string;
  type: string;
  value: string;
  required: boolean;
}

interface FormData {
  action: string;
  method: string;
  fields: FormField[];
}

export class FormHandler {
  async detectForms(page: Page | PuppeteerPage | WebDriver): Promise<FormData[]> {
    try {
      return await page.evaluate(() => {
        const forms = Array.from(document.forms);
        return forms.map(form => ({
          action: form.action,
          method: form.method.toUpperCase(),
          fields: Array.from(form.elements)
            .filter((el): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement => 
              el instanceof HTMLInputElement ||
              el instanceof HTMLSelectElement ||
              el instanceof HTMLTextAreaElement
            )
            .map(field => ({
              name: field.name,
              type: field.type,
              value: field.value,
              required: field.required
            }))
        }));
      });
    } catch (error) {
      console.error('Form detection error:', error);
      notifications.show('Failed to detect forms', 'error');
      return [];
    }
  }

  async fillForm(page: any, formIndex: number, data: Record<string, string>): Promise<boolean> {
    try {
      return await page.evaluate(
        ({ formIndex, data }) => {
          const form = document.forms[formIndex];
          if (!form) return false;

          for (const [name, value] of Object.entries(data)) {
            const field = form.elements.namedItem(name);
            if (!field) continue;

            if (field instanceof HTMLInputElement) {
              switch (field.type) {
                case 'checkbox':
                case 'radio':
                  field.checked = Boolean(value);
                  break;
                case 'file':
                  // File inputs need special handling
                  break;
                default:
                  field.value = value;
              }
            } else if (
              field instanceof HTMLSelectElement ||
              field instanceof HTMLTextAreaElement
            ) {
              field.value = value;
            }

            // Trigger change event
            field.dispatchEvent(new Event('change', { bubbles: true }));
            field.dispatchEvent(new Event('input', { bubbles: true }));
          }

          return true;
        },
        { formIndex, data }
      );
    } catch (error) {
      console.error('Form fill error:', error);
      notifications.show('Failed to fill form', 'error');
      return false;
    }
  }

  async submitForm(page: any, formIndex: number): Promise<boolean> {
    try {
      const submitted = await page.evaluate((index: number) => {
        const form = document.forms[index];
        if (!form) return false;

        // Check form validity
        if (!form.checkValidity()) {
          const invalidFields = Array.from(form.elements)
            .filter((el: any) => !el.validity.valid)
            .map((el: any) => el.name || el.id);
          throw new Error(`Invalid fields: ${invalidFields.join(', ')}`);
        }

        // Submit form
        form.submit();
        return true;
      }, formIndex);

      if (submitted) {
        // Wait for navigation or response
        await Promise.race([
          page.waitForNavigation({ timeout: 30000 }),
          page.waitForResponse(response => response.status() === 200)
        ]);
      }

      return submitted;
    } catch (error) {
      console.error('Form submission error:', error);
      notifications.show('Failed to submit form', 'error');
      return false;
    }
  }

  async validateForm(page: any, formIndex: number): Promise<{ valid: boolean; errors: string[] }> {
    try {
      return await page.evaluate((index: number) => {
        const form = document.forms[index];
        if (!form) return { valid: false, errors: ['Form not found'] };

        const errors: string[] = [];
        let valid = true;

        Array.from(form.elements).forEach((element: any) => {
          if (!element.checkValidity()) {
            valid = false;
            errors.push(`${element.name || element.id}: ${element.validationMessage}`);
          }
        });

        return { valid, errors };
      }, formIndex);
    } catch (error) {
      console.error('Form validation error:', error);
      return { valid: false, errors: ['Validation failed'] };
    }
  }

  async extractFormData(page: any, formIndex: number): Promise<Record<string, string>> {
    try {
      return await page.evaluate((index: number) => {
        const form = document.forms[index];
        if (!form) return {};

        const formData = new FormData(form);
        const data: Record<string, string> = {};

        formData.forEach((value, key) => {
          data[key] = value.toString();
        });

        return data;
      }, formIndex);
    } catch (error) {
      console.error('Form data extraction error:', error);
      notifications.show('Failed to extract form data', 'error');
      return {};
    }
  }

  async waitForFormSuccess(page: any, options: {
    successSelector?: string;
    successMessage?: string;
    timeout?: number;
  } = {}): Promise<boolean> {
    const {
      successSelector = '.success-message, [data-success]',
      successMessage,
      timeout = 30000
    } = options;

    try {
      if (successMessage) {
        await page.waitForFunction(
          (message: string) => document.body.innerText.includes(message),
          timeout,
          successMessage
        );
      } else {
        await page.waitForSelector(successSelector, { timeout });
      }
      return true;
    } catch (error) {
      console.error('Form success wait error:', error);
      return false;
    }
  }
}