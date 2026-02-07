import {
  FolderPlus,
  Upload,
  Star,
  Eye,
  Shield,
  Database,
  Zap,
  FileSearch,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Secure Authentication",
    description:
      "Industry-leading security with Clerk. Your account is protected with enterprise-grade authentication.",
  },
  {
    icon: Database,
    title: "Powered by Appwrite",
    description:
      "Reliable and fast database infrastructure ensures your files are always available when you need them.",
  },
  {
    icon: FolderPlus,
    title: "Easy Folder Creation",
    description:
      "Organize your files with intuitive folder structures. Create, rename, and manage folders effortlessly.",
  },
  {
    icon: Upload,
    title: "2GB File Uploads",
    description:
      "Upload large files up to 2GB with ease. Perfect for documents, photos, videos, and more.",
  },
  {
    icon: Star,
    title: "Star Important Items",
    description:
      "Mark your most important files and folders with stars for quick access anytime.",
  },
  {
    icon: Eye,
    title: "In-Browser Preview",
    description:
      "Preview documents, images, videos, and more directly in your browser. No downloads needed.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Optimized for speed. Upload, download, and access your files with minimal latency.",
  },
  {
    icon: FileSearch,
    title: "Smart Search",
    description:
      "Find any file instantly with powerful search capabilities across all your stored content.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background gradient-hero2">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything you need for
            <span className="text-blue-600"> seamless storage</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            SafeStore03 combines powerful features with a simple interface,
            giving you the best cloud storage experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl gradient-card border border-border/50 shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
