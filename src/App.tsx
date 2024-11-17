import React from 'react';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Header } from './components/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthScreen } from './components/auth/AuthScreen';
import { UnauthenticatedApp } from './components/auth/UnauthenticatedApp';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  if (!clerkPubKey) {
    return <UnauthenticatedApp reason="missing" />;
  }

  return (
    <ErrorBoundary>
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