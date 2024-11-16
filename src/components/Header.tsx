import React from 'react';
import { Ghost } from 'lucide-react';
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { NotificationCenter } from './notifications/NotificationCenter';

export const Header: React.FC = () => {
  const clerkAvailable = isValidClerkKey(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

  return (
    <header className="bg-gray-900 text-white p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Ghost className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Gray Ghost Scraper</h1>
        </div>
        <div className="flex items-center gap-4">
          <NotificationCenter />
          {clerkAvailable && (
            <div>
              <SignedIn>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                      userButtonPopoverCard: "shadow-xl",
                      userButtonPopoverFooter: "hidden"
                    }
                  }}
                />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Validate the Clerk key format
const isValidClerkKey = (key: string | undefined): boolean => {
  if (!key) return false;
  return /^pk_(live|test)_[a-zA-Z0-9]+$/.test(key);
};