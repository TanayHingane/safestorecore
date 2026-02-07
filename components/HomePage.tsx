import BenefitsSection from "./Benefits";
import FeaturesSection from "./Features";
import Footer from "./Footer";
import Header from "./Header";
import HeroSection from "./HeroSection";
import HowItWorksSection from "./Working";

const Homepage = () => {
  return (
    <div className="flex flex-col w-full bg-background ">
      <Header />
      <main className="flex-grow overflow-y-auto pt-16">
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <HowItWorksSection />
      </main>
      <Footer />
    </div>
  );
};

export default Homepage;
