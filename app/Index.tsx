import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Mentorship from "@/components/Mentorship";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";


const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Features />
      <HowItWorks />
      <Mentorship />
      <Footer />
    </div>
  );
};

export default Index;
