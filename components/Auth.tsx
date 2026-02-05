import React from "react";
import { SignIn } from "@clerk/clerk-react";
import { Wallet2 } from "lucide-react";
import Logo from "./Logo";

export const metadata = {
  title: "Sign In - SmartBalance",
  description: "Sign in to your SmartBalance account to manage your finances.",
};

export const Auth: React.FC = () => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-white">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/">
            <Logo />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm md:max-w-xs">
            <SignIn />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block h-screen w-full overflow-hidden">
        {/* Light mode */}
        <img
          src="/login-white.png"
          alt="Login background"
          className="absolute inset-0 h-full w-full object-cover "
        />
      </div>
    </div>
  );
};
