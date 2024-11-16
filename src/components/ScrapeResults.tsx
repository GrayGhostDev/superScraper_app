import React from 'react';
import { Link, Image, FileText, ChevronDown, ChevronRight, FormInput, Globe, Hash, Calendar, MapPin, Phone, Mail, Download, BrainCircuit } from 'lucide-react';
import { ScrapedData } from '../types/scraper';
import { formatDistanceToNow } from 'date-fns';

interface ScrapeResultsProps {
  data: ScrapedData[];
  isExpanded: boolean;
  onToggle: () => void;
}

export const ScrapeResults: React.FC<ScrapeResultsProps> = ({
  data,
  isExpanded,
  onToggle,
}) => {
  if (!data?.length) return null;

  const result = data[0];

  const renderStructuredContent = () => {
    if (!result.structuredContent) return null;

    const { 
      pricing, 
      dates, 
      locations, 
      contactInfo, 
      socialMedia, 
      fileDownloads, 
      keywords 
    } = result.structuredContent;

    return (
      <div className="space-y-6">
        {pricing.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Hash className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">Pricing Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {pricing.map((price, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded-md">
                  <p className="text-sm text-gray-900">{price.raw}</p>
                  <p className="text-xs text-gray-500">${price.value.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {dates.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">Dates Found</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {dates.map((date, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-sm text-gray-700">
                  {date}
                </span>
              ))}
            </div>
          </div>
        )}

        {locations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">Locations</h3>
            </div>
            <div className="space-y-2">
              {locations.map((location, index) => (
                <p key={index} className="text-sm text-gray-700">{location}</p>
              ))}
            </div>
          </div>
        )}

        {(contactInfo.phones.length > 0 || contactInfo.emails.length > 0) && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">Contact Information</h3>
            </div>
            <div className="space-y-2">
              {contactInfo.phones.map((phone, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${phone}`} className="text-sm text-blue-600 hover:text-blue-800">
                    {phone}
                  </a>
                </div>
              ))}
              {contactInfo.emails.map((email, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${email}`} className="text-sm text-blue-600 hover:text-blue-800">
                    {email}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {socialMedia.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">Social Media</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {socialMedia.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 rounded-md bg-gray-50 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}
                </a>
              ))}
            </div>
          </div>
        )}

        {fileDownloads.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">Available Downloads</h3>
            </div>
            <div className="space-y-2">
              {fileDownloads.map((file, index) => (
                <a
                  key={index}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <FileText className="h-4 w-4" />
                  {file.text || file.url.split('/').pop()} ({file.type})
                </a>
              ))}
            </div>
          </div>
        )}

        {keywords.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">Key Topics</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"
                  title={`Relevance: ${(keyword.score * 100).toFixed(1)}%`}
                >
                  {keyword.term}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-4 border-t pt-4">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        View Results
        <span className="text-xs text-gray-500 ml-2">
          Scraped {formatDistanceToNow(result.timestamp)} ago
        </span>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-6">
          {result.title && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">Page Title</h3>
              <p className="mt-1 text-sm text-gray-900">{result.title}</p>
            </div>
          )}

          {result.text && (
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-700">Content Preview</h3>
              </div>
              <p className="mt-1 text-sm text-gray-900 line-clamp-3">
                {result.text}
              </p>
            </div>
          )}

          {renderStructuredContent()}

          {result.links?.length > 0 && (
            <div>
              <div className="flex items-center gap-2">
                <Link className="h-4 w-4 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-700">
                  Links Found ({result.links.length})
                </h3>
              </div>
              <div className="mt-1 max-h-32 overflow-y-auto">
                <ul className="space-y-1">
                  {result.links.slice(0, 5).map((link, index) => (
                    <li key={index} className="text-sm">
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 truncate block"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                  {result.links.length > 5 && (
                    <li className="text-sm text-gray-500">
                      And {result.links.length - 5} more links...
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {result.images?.length > 0 && (
            <div>
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-700">
                  Images Found ({result.images.length})
                </h3>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {result.images.slice(0, 3).map((image, index) => (
                  <a
                    key={index}
                    href={image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-video bg-gray-100 rounded-md overflow-hidden hover:opacity-75 transition-opacity"
                  >
                    <img
                      src={image}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect width="18" height="18" x="3" y="3" rx="2" ry="2"%3E%3C/rect%3E%3Ccircle cx="9" cy="9" r="2"%3E%3C/circle%3E%3Cpath d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"%3E%3C/path%3E%3C/svg%3E';
                      }}
                    />
                  </a>
                ))}
                {result.images.length > 3 && (
                  <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                    +{result.images.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}

          {result.performance && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Performance Metrics</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Page Size</p>
                  <p className="font-medium">{(result.performance.size / 1024).toFixed(1)} KB</p>
                </div>
                <div>
                  <p className="text-gray-500">Load Time</p>
                  <p className="font-medium">{(result.performance.loadTime / 1000).toFixed(2)}s</p>
                </div>
                <div>
                  <p className="text-gray-500">Resources</p>
                  <p className="font-medium">{result.performance.resourceCount}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};