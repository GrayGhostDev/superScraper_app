import React from 'react';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Header } from './components/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthScreen } from './components/auth/AuthScreen';
import { UnauthenticatedApp } from './components/auth/UnauthenticatedApp';

// Get the Clerk publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Validate the Clerk key format
const isValidClerkKey = (key: string | undefined): boolean => {
  if (!key) return false;
  return /^pk_(live|test)_[a-zA-Z0-9]+$/.test(key);
};

function App() {
  // Show UnauthenticatedApp if no key or invalid key format
  if (!isValidClerkKey(clerkPubKey)) {
    return <UnauthenticatedApp reason={!clerkPubKey ? 'missing' : 'invalid'} />;
  }

  return (
    <ErrorBoundary fallback={<UnauthenticatedApp reason="error" />}>
      <ClerkProvider 
        publishableKey={clerkPubKey}
        navigate={(to) => window.history.pushState(null, '', to)}
      >
        <div className="min-h-screen bg-gray-100">
          <Header />
          <SignedIn>
            <Dashboard />
          </SignedIn>
          <SignedOut>
            <AuthScreen />
          </SignedOut>
        </div>
      </ClerkProvider>
    </ErrorBoundary>
  );
}

export default App;
