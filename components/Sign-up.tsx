import Logo from "./Logo";
import { SignIn, SignUp } from "@clerk/clerk-react";
import React from "react";

export const SignUpUi: React.FC = () => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background">
      {/* Left Panel - Sign In Form */}
      <div className="flex flex-col p-6 md:p-10 lg:p-16">
        <div className="flex justify-center lg:justify-start animate-fade-in">
          <a href="/" className="transition-opacity hover:opacity-80">
            <Logo />
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center py-12">
          <div
            className="w-full max-w-sm animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-3xl font-display font-semibold text-foreground mb-2">
                Welcome back
              </h1>
              <p className="text-muted-foreground">
                Enter your credentials to access your account
              </p>
            </div>

            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              afterSignInUrl="/dashboard"
            />
          </div>
        </div>

        <footer
          className="text-center lg:text-left text-sm text-muted-foreground animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <p>© 2026 SafeStore03. All rights reserved.</p>
        </footer>
      </div>

      {/* Right Panel - Hero Image */}
      <div className="relative hidden lg:block overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-accent z-10" />
        <img
          src="/sign-in.jpg"
          alt="Modern office interior"
          className="absolute inset-0 h-full w-full object-cover animate-slide-in-right"
        />

        {/* Overlay Content */}
        <div className="relative z-20 flex flex-col justify-end h-full p-12 lg:p-16">
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <blockquote className="space-y-4">
              <p className="text-xl lg:text-xl font-display text-primary-foreground/90 leading-relaxed">
                "I created SafeStore03 to make cloud storage simple, fast, and
                secure. No clutter, no confusion-just a smart drive where you
                can organize folders, upload large files up to 2 GB, and access
                your data anytime with confidence."
              </p>
              <footer className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <span className="text-primary-foreground font-medium">
                    TH
                  </span>
                </div>
                <div>
                  <p className="font-medium text-primary-foreground">
                    Tanay Hingane
                  </p>
                  <p className="text-sm text-primary-foreground/70">
                    Founder, SafeStore03.
                  </p>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpUi;
