import { GraduationCap, User, CheckCircle2 } from "lucide-react";

const studentBenefits = [
  "Store all your assignments and projects in one place",
  "Access your files from any device, anywhere",
  "Preview documents without downloading",
  "Share files easily with classmates",
  "Keep your academic work organized by semester",
];

const individualBenefits = [
  "Back up important personal documents securely",
  "Store and preview photos and videos",
  "Organize files with custom folder structures",
  "Star frequently accessed items for quick access",
  "Upload large files up to 2GB",
];

const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Built for
            <span className="text-blue-600"> everyone</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Whether you're a student managing coursework or an individual
            organizing personal files, SafeStore03 adapts to your needs.
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Students Card */}
          <div className="p-8 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-hover transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  For Students
                </h3>
                <p className="text-muted-foreground">Ace your academic game</p>
              </div>
            </div>
            <ul className="space-y-3">
              {studentBenefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Individuals Card */}
          <div className="p-8 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-hover transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center">
                <User className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  For Individuals
                </h3>
                <p className="text-muted-foreground">
                  Simplify your digital life
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {individualBenefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
