import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Ghost } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Ghost className="h-12 w-12 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to Gray Ghost Scraper
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please sign in to continue
          </p>
        </div>

        <div className="mt-8">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "rounded-lg shadow-xl border border-gray-100",
                headerTitle: "text-xl font-bold text-gray-900",
                headerSubtitle: "text-sm text-gray-600",
                formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white",
                formFieldInput: "rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500",
                footerActionLink: "text-indigo-600 hover:text-indigo-700"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};