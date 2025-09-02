import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-poppins font-bold mb-4">SkillSync</h3>
            <p className="text-primary-foreground/80 font-inter mb-6 leading-relaxed">
              Transforming careers through AI-powered guidance and expert mentorship. 
              Your journey to professional success starts here.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-accent hover:bg-primary-light">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-accent hover:bg-primary-light">
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-accent hover:bg-primary-light">
                <Github className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-lg font-poppins font-semibold mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors font-inter">Features</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors font-inter">How It Works</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors font-inter">Mentorship</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors font-inter">Pricing</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors font-inter">API</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-poppins font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors font-inter">Help Center</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors font-inter">Contact Us</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors font-inter">Community</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors font-inter">Status</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors font-inter">Become a Mentor</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-poppins font-semibold mb-4">Stay Updated</h4>
            <p className="text-primary-foreground/80 font-inter mb-4 text-sm">
              Get the latest career insights and platform updates delivered to your inbox.
            </p>
            <div className="space-y-3">
              <Input 
                type="email" 
                placeholder="Enter your email"
                className="bg-primary-light border-primary-lighter text-primary-foreground placeholder:text-primary-foreground/60"
              />
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-poppins">
                <Mail className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-lighter mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-primary-foreground/60 font-inter text-sm">
            © 2024 SkillSync. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors font-inter text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors font-inter text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors font-inter text-sm">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;