import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Cloud } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen gradient-hero pt-24 pb-16 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-pulse-soft" />
        <div
          className="absolute bottom-1/4 -left-32 w-80 h-80 rounded-full bg-accent/10 blur-3xl animate-pulse-soft"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Secure • Fast • Simple
            </span>
          </div>

          {/* Main Heading */}
          <h1
            className="text-3xl md:text-6xl font-bold text-foreground mb-16 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            Secure{" "}
            <span className="relative">
              Cloud Storage
              <span className="absolute bottom-0 sm:-bottom-1 left-0 right-0 h-2 sm:h-3 bg-blue-400 dark:bg-blue-500 -z-10 transform -rotate-1"></span>
            </span>
            <br /> Built for Speed and Simplicity
          </h1>

          {/* Subheading */}
          <p
            className="text-base sm:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            SafeStore03 gives you a simple, intuitive cloud storage experience.
            Upload files up to 2GB, organize with folders, and preview
            everything right in your browser.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <a href="/sign-in">
              <Button variant="hero" size="xl">
                Sign In
                <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
            <a href="/sign-up">
              <Button variant="hero-outline" size="lg">
                Sign Up Free
              </Button>
            </a>
          </div>

          {/* Trust Indicators */}
          <div
            className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm">Clerk Authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              <span className="text-sm">Appwrite Database</span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-primary" />
              <span className="text-sm">2GB File Uploads</span>
            </div>
          </div>
        </div>

        {/* Hero Image/Preview */}
        <div
          className="mt-16 max-w-5xl mx-auto animate-scale-in"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="relative rounded-2xl overflow-hidden shadow-card bg-card border border-border/50">
            <div className="aspect-[16/10] bg-gradient-to-br from-secondary to-muted p-6">
              {/* Mock Dashboard UI */}
              <div className="h-full rounded-xl bg-card shadow-soft overflow-hidden">
                {/* Mock Header */}
                <div className="h-14 border-b border-border flex items-center px-4 gap-4">
                  <div className="w-8 h-8 rounded-lg gradient-bg" />
                  <div className="flex-1 h-9 bg-secondary rounded-lg max-w-md" />
                  <div className="flex gap-2">
                    <div className="w-9 h-9 rounded-lg bg-secondary" />
                    <div className="w-9 h-9 rounded-lg bg-secondary" />
                  </div>
                </div>

                {/* Mock Content */}
                <div className="flex h-[calc(100%-3.5rem)]">
                  {/* Sidebar */}
                  <div className="w-56 border-r border-border p-4 hidden sm:block">
                    <div className="space-y-2">
                      <div className="h-10 rounded-lg gradient-bg opacity-20" />
                      <div className="h-10 rounded-lg bg-secondary" />
                      <div className="h-10 rounded-lg bg-secondary" />
                      <div className="h-10 rounded-lg bg-secondary" />
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-xl bg-secondary flex flex-col items-center justify-center gap-2 hover:bg-primary/10 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/20" />
                          <div className="w-16 h-2 rounded bg-muted-foreground/20" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl gradient-bg shadow-hover flex items-center justify-center animate-float hidden lg:flex">
            <Cloud className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
