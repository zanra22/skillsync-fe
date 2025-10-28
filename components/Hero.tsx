"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getDashboardUrl } from "@/lib/auth-redirect";

const Hero = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient with new Aurora colors */}
      <div className="absolute inset-0 bg-gradient-hero opacity-95"></div>

      {/* Hero Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage.src}
          alt="Professional team collaborating on career development"
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent-light/20 border border-accent/30 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent mr-2" />
            <span className="text-sm font-medium text-accent font-inter">
              AI-Powered Career Development
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-poppins font-bold mb-6 animate-slide-up">
            <span className="text-white">Transform Your Career with</span>
            <br />
            <span className="gradient-text">Intelligent Guidance</span>
          </h1>

          {/* Subheading */}
          <p
            className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed font-inter animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            SkillSync combines AI-powered mentorship with human experts to
            create personalized learning paths that align with your career goals
            and market demands.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            <Button 
              size="xl" 
              className="btn-hero text-lg py-4 glow-accent"
              onClick={() => {
                // If authenticated, redirect to appropriate dashboard
                if (isAuthenticated && user) {
                  const dashboardUrl = getDashboardUrl(user);
                  router.push(dashboardUrl);
                } else {
                  // Not authenticated, go to signin
                  router.push('/signin');
                }
              }}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start Your Journey'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="text-lg py-4 bg-transparent border-white/30 text-white hover:bg-white hover:text-primary hover:border-white font-poppins transition-all duration-300"
            >
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 animate-slide-up"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-poppins font-bold text-accent mb-2">
                50K+
              </div>
              <div className="text-white/80 font-inter">
                Professionals Upskilled
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-poppins font-bold text-accent mb-2">
                95%
              </div>
              <div className="text-white/80 font-inter">
                Career Goal Achievement
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-poppins font-bold text-accent mb-2">
                500+
              </div>
              <div className="text-white/80 font-inter">Expert Mentors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-accent/20 rounded-full blur-xl animate-float"></div>
      <div
        className="absolute bottom-40 right-10 w-32 h-32 bg-secondary/20 rounded-full blur-xl animate-float"
        style={{ animationDelay: "1s" }}
      ></div>
    </section>
  );
};

export default Hero;
