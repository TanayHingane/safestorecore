import React from "react";
import { ClerkProvider } from "@clerk/clerk-react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { FileSystemProvider } from "./contexts/FileSystemContext";
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
  const { user, isLoading } = useAuth();

  console.log("Dashboard - Loading:", isLoading, "User:", user?.email);

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

  if (!user) {
    console.log("Dashboard - No user, showing Auth");
    return <Homepage />;
  }

  console.log("Dashboard - User authenticated, showing main app");
  return (
    <FileSystemProvider>
      <div className="flex bg-white h-screen">
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
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/sign-in" element={<SignInUi />} />
          <Route path="/sign-up" element={<SignUpUi />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* fallback */}
          <Route path="*" element={<Homepage />} />
        </Routes>
      </AuthProvider>
    </ClerkProvider>
  );
};

export default App;
