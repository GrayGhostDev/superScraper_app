import React from 'react';
import { AlertTriangle, KeyRound, XCircle } from 'lucide-react';
import { Header } from '../Header';

interface UnauthenticatedAppProps {
  reason?: 'missing' | 'invalid' | 'error';
}

export const UnauthenticatedApp: React.FC<UnauthenticatedAppProps> = ({ reason = 'missing' }) => {
  const getContent = () => {
    switch (reason) {
      case 'invalid':
        return {
          icon: <KeyRound className="h-6 w-6" />,
          title: 'Invalid API Key Format',
          message: 'The Clerk API key format is invalid. Please ensure you\'re using the correct publishable key format.',
        };
      case 'error':
        return {
          icon: <XCircle className="h-6 w-6" />,
          title: 'Authentication Error',
          message: 'An error occurred while setting up authentication. Please check your configuration.',
        };
      default:
        return {
          icon: <AlertTriangle className="h-6 w-6" />,
          title: 'Authentication Not Configured',
          message: 'The application is running in development mode without authentication configured.',
        };
    }
  };

  const { icon, title, message } = getContent();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 text-amber-600 mb-4">
            {icon}
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
          <p className="text-gray-600 mb-4">{message}</p>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
            <li>Sign up for a free account at <a href="https://clerk.com" className="text-indigo-600 hover:text-indigo-800" target="_blank" rel="noopener noreferrer">Clerk.com</a></li>
            <li>Create a new application in the Clerk dashboard</li>
            <li>Copy your Publishable Key from the API Keys section</li>
            <li>Add the key to your <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file:
              <pre className="bg-gray-100 p-3 rounded-md mt-2 text-sm">
                VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
              </pre>
            </li>
            <li>Ensure the key starts with <code className="bg-gray-100 px-2 py-1 rounded">pk_test_</code> or <code className="bg-gray-100 px-2 py-1 rounded">pk_live_</code></li>
            <li>Restart the development server</li>
          </ol>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-700">
              For development purposes, you can continue using the application without authentication.
              All features will be available, but no user data will be persisted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};