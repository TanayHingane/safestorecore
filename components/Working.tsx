import { UserPlus, FolderUp, Eye } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Account",
    description:
      "Sign up in seconds with our secure Clerk authentication. No complicated setup required.",
  },
  {
    icon: FolderUp,
    step: "02",
    title: "Upload Your Files",
    description:
      "Drag and drop your files or create folders to organize your content. Upload files up to 2GB.",
  },
  {
    icon: Eye,
    step: "03",
    title: "Access Anywhere",
    description:
      "Preview, download, or share your files from any device. Your data is always at your fingertips.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Get started in
            <span className="text-blue-600"> 3 simple steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            SafeStore03 is designed to be effortless. Here's how easy it is to
            get going.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-0.5 bg-gradient-to-r from-primary to-accent" />
                )}

                <div className="text-center">
                  {/* Icon */}
                  <div className="relative inline-flex">
                    <div className="w-24 h-24 rounded-2xl gradient-bg flex items-center justify-center shadow-soft">
                      <step.icon className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center">
                      {step.step}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
