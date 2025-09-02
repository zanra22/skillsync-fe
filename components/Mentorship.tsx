import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock, Users, Star, Zap, Heart } from "lucide-react";

const Mentorship = () => {
  return (
    <section id="mentorship" className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-poppins font-bold mb-6">
            <span className="gradient-text">Hybrid Mentorship</span> That Actually Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
            Combine the instant availability of AI guidance with the wisdom and networking power of human mentors.
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* AI Mentor Card */}
          <Card className="feature-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-accent/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center mr-4">
                  <Zap className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="text-2xl font-poppins font-semibold">AI Career Coach</h3>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-muted-foreground font-inter">
                  <Clock className="w-5 h-5 text-accent mr-3" />
                  Available 24/7 for instant guidance
                </div>
                <div className="flex items-center text-muted-foreground font-inter">
                  <MessageSquare className="w-5 h-5 text-accent mr-3" />
                  Data-driven insights and recommendations
                </div>
                <div className="flex items-center text-muted-foreground font-inter">
                  <Star className="w-5 h-5 text-accent mr-3" />
                  Personalized learning path optimization
                </div>
              </div>

              <div className="bg-accent-light/20 p-4 rounded-lg border border-accent/20">
                <p className="text-sm font-inter text-foreground/80 italic">
                  "Your AI coach analyzes thousands of career paths to provide instant, 
                  personalized guidance whenever you need it."
                </p>
              </div>
            </div>
          </Card>

          {/* Human Mentor Card */}
          <Card className="feature-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-secondary to-secondary/80 rounded-xl flex items-center justify-center mr-4">
                  <Heart className="w-6 h-6 text-secondary-foreground" />
                </div>
                <h3 className="text-2xl font-poppins font-semibold">Expert Mentors</h3>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-muted-foreground font-inter">
                  <Users className="w-5 h-5 text-secondary mr-3" />
                  Real-world experience and networking
                </div>
                <div className="flex items-center text-muted-foreground font-inter">
                  <MessageSquare className="w-5 h-5 text-secondary mr-3" />
                  Empathy and emotional support
                </div>
                <div className="flex items-center text-muted-foreground font-inter">
                  <Star className="w-5 h-5 text-secondary mr-3" />
                  Industry-specific career navigation
                </div>
              </div>

              <div className="bg-secondary-light/20 p-4 rounded-lg border border-secondary/20">
                <p className="text-sm font-inter text-foreground/80 italic">
                  "Connect with professionals who've walked your path and can open doors 
                  you didn't know existed."
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <Card className="feature-card relative">
            <div className="text-center">
              <h4 className="text-xl font-poppins font-semibold mb-2">Starter</h4>
              <div className="text-3xl font-poppins font-bold mb-1">Free</div>
              <p className="text-muted-foreground font-inter mb-6">Perfect for getting started</p>
              
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center font-inter">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                  Full AI Career Coach access
                </li>
                <li className="flex items-center font-inter">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                  Personalized learning paths
                </li>
                <li className="flex items-center font-inter">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                  Skill validation tools
                </li>
              </ul>

              <Button className="w-full btn-outline">
                Get Started Free
              </Button>
            </div>
          </Card>

          {/* Pro Tier */}
          <Card className="feature-card relative border-accent/50 scale-105">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium font-poppins">
                Most Popular
              </span>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-poppins font-semibold mb-2">Professional</h4>
              <div className="text-3xl font-poppins font-bold mb-1">$49<span className="text-lg text-muted-foreground">/mo</span></div>
              <p className="text-muted-foreground font-inter mb-6">Everything + human mentorship</p>
              
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center font-inter">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                  Everything in Starter
                </li>
                <li className="flex items-center font-inter">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                  2 mentor sessions/month
                </li>
                <li className="flex items-center font-inter">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                  Priority AI support
                </li>
                <li className="flex items-center font-inter">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                  Advanced analytics
                </li>
              </ul>

              <Button className="w-full btn-hero">
                Start Free Trial
              </Button>
            </div>
          </Card>

          {/* Enterprise Tier */}
          <Card className="feature-card relative">
            <div className="text-center">
              <h4 className="text-xl font-poppins font-semibold mb-2">Enterprise</h4>
              <div className="text-3xl font-poppins font-bold mb-1">$149<span className="text-lg text-muted-foreground">/mo</span></div>
              <p className="text-muted-foreground font-inter mb-6">For serious career advancement</p>
              
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center font-inter">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                  Everything in Professional
                </li>
                <li className="flex items-center font-inter">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                  Unlimited mentor access
                </li>
                <li className="flex items-center font-inter">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                  1-on-1 career coaching
                </li>
                <li className="flex items-center font-inter">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                  Networking events
                </li>
              </ul>

              <Button className="w-full btn-secondary">
                Contact Sales
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Mentorship;