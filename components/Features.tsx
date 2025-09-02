import { Card } from "@/components/ui/card";
import { Brain, Target, Shield, Users, Zap, TrendingUp } from "lucide-react";
import aiMentorIcon from "@/assets/ai-mentor-icon.png";
import learningPathIcon from "@/assets/learning-path-icon.png";
import validationIcon from "@/assets/validation-icon.png";

const Features = () => {
  const features = [
    {
      icon: <img src={aiMentorIcon.src} alt="AI Mentor" className="w-12 h-12" />,
      title: "AI Career Coach",
      description: "Get instant, personalized guidance powered by advanced AI that understands your goals, skills, and market trends."
    },
    {
      icon: <img src={learningPathIcon.src} alt="Learning Path" className="w-12 h-12" />,
      title: "Personalized Learning Paths",
      description: "Receive custom-designed curricula that adapt to your pace, learning style, and career objectives."
    },
    {
      icon: <img src={validationIcon.src} alt="Skill Validation" className="w-12 h-12" />,
      title: "Skill Validation",
      description: "Earn industry-recognized certifications and build a portfolio that demonstrates your expertise to employers."
    },
    {
      icon: <Users className="w-12 h-12 text-accent" />,
      title: "Expert Mentorship",
      description: "Connect with seasoned professionals who provide human insight, networking opportunities, and career wisdom."
    },
    {
      icon: <Zap className="w-12 h-12 text-accent" />,
      title: "Real-time Adaptation",
      description: "Your learning path evolves with industry changes, ensuring you stay ahead of market demands."
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-accent" />,
      title: "Progress Analytics",
      description: "Track your growth with detailed insights and predictive analytics about your career trajectory."
    }
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-poppins font-bold mb-6">
            <span className="gradient-text">Intelligent Features</span> for Modern Careers
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
            Our platform combines cutting-edge AI technology with human expertise to create 
            the most effective career development experience available.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="feature-card group animate-fade-in"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-poppins font-semibold mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground font-inter leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-accent text-accent-foreground font-medium font-poppins hover:shadow-elegant transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <Brain className="w-5 h-5 mr-2" />
            Experience the Future of Career Development
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;