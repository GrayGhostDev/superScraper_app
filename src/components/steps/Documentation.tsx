import React, { useRef } from 'react';
import { FormData } from '../../types/forms';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';

interface DocumentationProps {
  formData: FormData;
  updateFormData: (section: keyof FormData, data: Partial<FormData[keyof FormData]>) => void;
}

export const Documentation: React.FC<DocumentationProps> = ({
  formData,
  updateFormData,
}) => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const { photos, documents, additionalNotes } = formData.documentation;

  const handleFileUpload = (type: 'photos' | 'documents', files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    updateFormData('documentation', {
      [type]: [...formData.documentation[type], ...newFiles]
    });
  };

  const removeFile = (type: 'photos' | 'documents', index: number) => {
    const newFiles = formData.documentation[type].filter((_, i) => i !== index);
    updateFormData('documentation', { [type]: newFiles });
  };

  const handleNotesChange = (value: string) => {
    updateFormData('documentation', { additionalNotes: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Photos
          </label>
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            <Upload className="h-4 w-4 mr-1" />
            Upload Photos
          </button>
        </div>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload('photos', e.target.files)}
        />
        <div className="grid grid-cols-2 gap-4 mt-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeFile('photos', index)}
                className="absolute top-2 right-2 p-1 bg-red-100 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Documents
          </label>
          <button
            type="button"
            onClick={() => documentInputRef.current?.click()}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            <Upload className="h-4 w-4 mr-1" />
            Upload Documents
          </button>
        </div>
        <input
          ref={documentInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload('documents', e.target.files)}
        />
        <div className="space-y-2 mt-2">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-900">{doc.name}</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile('documents', index)}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700">
          Additional Notes
        </label>
        <textarea
          id="additionalNotes"
          value={additionalNotes}
          onChange={(e) => handleNotesChange(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Any additional information or context..."
        />
      </div>
    </div>
  );
};