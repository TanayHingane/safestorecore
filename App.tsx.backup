import React from "react";
import { ClerkProvider } from "@clerk/clerk-react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { FileSystemProvider } from "./contexts/FileSystemContext";
import { Sidebar } from "./components/Sidebar";
import { MainView } from "./components/MainView";
import { Auth } from "./components/Auth";

// Import Clerk publishable key
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

const Dashboard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Auth />;

  return (
    <FileSystemProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar />
        <MainView />
      </div>
    </FileSystemProvider>
  );
};

const App: React.FC = () => {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    </ClerkProvider>
  );
};

export default App;
