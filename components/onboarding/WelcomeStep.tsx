"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Brain, Users, Target } from 'lucide-react';

// Legacy component - no longer used with conversational onboarding
interface OnboardingData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  role?: string;
  industry?: string;
  careerStage?: string;
  goals?: any[];
  preferences?: any;
}

interface WelcomeStepProps {
  data: OnboardingData;
  onNext: (data?: Partial<OnboardingData>) => void;
  onBack?: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <Card className="w-full max-w-3xl mx-auto bg-card/95 backdrop-blur-sm border-border/50 shadow-elegant">
      <CardContent className="p-8 text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent/60 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-poppins font-bold text-foreground">
              Welcome to SkillSync! 🚀
            </h2>
            <p className="text-lg text-muted-foreground font-inter max-w-2xl mx-auto">
              Your AI-powered learning companion is here to create a personalized journey 
              that adapts to your goals, pace, and learning style.
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
              <Brain className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-poppins font-semibold text-foreground">AI-Powered Roadmaps</h3>
            <p className="text-sm text-muted-foreground font-inter">
              Get personalized learning paths crafted by our intelligent system
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-poppins font-semibold text-foreground">Expert Mentors</h3>
            <p className="text-sm text-muted-foreground font-inter">
              Connect with industry professionals to accelerate your growth
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
              <Target className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-poppins font-semibold text-foreground">Goal Tracking</h3>
            <p className="text-sm text-muted-foreground font-inter">
              Monitor your progress and celebrate achievements along the way
            </p>
          </div>
        </div>

        {/* What We'll Do */}
        <div className="bg-accent/5 rounded-xl p-6 space-y-4">
          <h3 className="text-xl font-poppins font-semibold text-foreground">
            Let's build your learning profile in just a few steps:
          </h3>
          <div className="text-left space-y-2 max-w-xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <span className="font-inter text-muted-foreground">Choose your role and tell us about yourself</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <span className="font-inter text-muted-foreground">Select your industry and career stage</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <span className="font-inter text-muted-foreground">Set your learning goals and preferences</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <span className="font-inter text-muted-foreground">Get your personalized AI-generated roadmap</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <p className="text-muted-foreground font-inter">
            Ready to unlock your potential? This will only take 3-5 minutes.
          </p>
          
          <Button 
            onClick={() => onNext()}
            className="btn-hero h-12 px-8 text-lg"
          >
            Start My Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeStep;