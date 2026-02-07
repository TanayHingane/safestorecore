import React from "react";
import { ClerkProvider } from "@clerk/clerk-react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { FileSystemProvider, useFileSystem } from "./contexts/FileSystemContext";
import { Sidebar } from "./components/Sidebar";
import { MainView } from "./components/MainView";
import { Route, Routes } from "react-router-dom";
import Homepage from "./components/HomePage";
import { SignInUi } from "./components/Sign-in";
import { SignUpUi } from "./components/Sign-up";

// Import Clerk publishable key
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log("=== APP INITIALIZATION ===");
console.log("Clerk Key Present:", !!CLERK_PUBLISHABLE_KEY);
console.log("Clerk Key Preview:", CLERK_PUBLISHABLE_KEY?.substring(0, 15));

if (!CLERK_PUBLISHABLE_KEY) {
  console.error("❌ Missing VITE_CLERK_PUBLISHABLE_KEY");
  throw new Error("Missing Clerk Publishable Key. Check your .env.local file.");
}

const Dashboard = () => {
  const { user, isLoading: isAuthLoading } = useAuth();

  console.log("Dashboard - Loading:", isAuthLoading, "User:", user?.email);

  if (!user && !isAuthLoading) { // Only show homepage if no user AND not loading auth
    console.log("Dashboard - No user and not loading auth, showing Auth");
    return <Homepage />;
  }

  console.log("Dashboard - User authenticated or auth loading, showing main app");
  return (
    <FileSystemProvider>
      {/* Pass isAuthLoading to FileSystemLoader to consolidate loading states */}
      <FileSystemLoader isAuthLoading={isAuthLoading} />
      <div className="flex bg-white h-screen">
        <Sidebar />
        <MainView />
      </div>
    </FileSystemProvider>
  );
};

// New component to display FileSystem loading states
const FileSystemLoader = ({ isAuthLoading }: { isAuthLoading: boolean }) => {
  const { isLoading, isUploading } = useFileSystem();

  if (isLoading || isUploading || isAuthLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="text-white text-lg">
          {isAuthLoading ? "Authenticating..." : isUploading ? "Uploading files..." : "Loading data..."}
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mt-2"></div>
        </div>
      </div>
    );
  }
  return null;
};

const App: React.FC = () => {
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/sign-in" element={<SignInUi />} />
          <Route path="/sign-up" element={<SignUpUi />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Homepage />} />
        </Routes>
      </AuthProvider>
    </ClerkProvider>
  );
};

export default App;
