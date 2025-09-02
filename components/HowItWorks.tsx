import { Card } from "@/components/ui/card";
import { ArrowRight, Target, BookOpen, Award, Users } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      icon: <Target className="w-8 h-8 text-accent" />,
      title: "Define Your Goals",
      description: "Tell us about your current role, skills, and where you want to be. Our AI analyzes your profile and industry trends to understand your unique career landscape."
    },
    {
      step: "02", 
      icon: <BookOpen className="w-8 h-8 text-accent" />,
      title: "Get Your Learning Path",
      description: "Receive a personalized curriculum with courses, projects, and milestones tailored to your goals, learning style, and schedule preferences."
    },
    {
      step: "03",
      icon: <Users className="w-8 h-8 text-accent" />,
      title: "Connect with Mentors",
      description: "Access our AI coach 24/7 for guidance, and optionally connect with expert human mentors for deep insights and networking opportunities."
    },
    {
      step: "04",
      icon: <Award className="w-8 h-8 text-accent" />,
      title: "Validate & Advance",
      description: "Complete projects, earn certifications, and showcase your new skills. Track your progress as you advance toward your career goals."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-poppins font-bold mb-6">
            Your Journey to <span className="gradient-text">Career Success</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
            Four simple steps to transform your career with AI-powered guidance and expert mentorship.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-6 animate-fade-in" style={{animationDelay: `${index * 0.2}s`}}>
              {/* Step Number */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center text-accent-foreground font-poppins font-bold text-lg shadow-soft">
                  {step.step}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <Card className="p-6 bg-card hover:bg-accent-light/5 transition-all duration-300 hover:shadow-soft border-l-4 border-l-accent">
                  <div className="flex items-center mb-4">
                    {step.icon}
                    <h3 className="text-xl font-poppins font-semibold ml-3">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground font-inter leading-relaxed">
                    {step.description}
                  </p>
                </Card>
              </div>

              {/* Arrow (except for last item) */}
              {index < steps.length - 1 && index % 2 === 1 && (
                <div className="hidden lg:block flex-shrink-0 mt-8">
                  <ArrowRight className="w-6 h-6 text-accent/50" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress Visualization */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-4 p-6 bg-gradient-to-r from-accent-light/20 to-secondary-light/20 rounded-2xl border border-accent/20">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-accent rounded-full animate-glow-pulse"></div>
              <span className="text-sm font-inter text-foreground/80">AI-Powered</span>
            </div>
            <ArrowRight className="w-4 h-4 text-accent" />
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-secondary rounded-full animate-glow-pulse" style={{animationDelay: '0.5s'}}></div>
              <span className="text-sm font-inter text-foreground/80">Human-Guided</span>
            </div>
            <ArrowRight className="w-4 h-4 text-accent" />
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full animate-glow-pulse" style={{animationDelay: '1s'}}></div>
              <span className="text-sm font-inter text-foreground/80">Career Success</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;