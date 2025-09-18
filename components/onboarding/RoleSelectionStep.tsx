"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, User, Users, BookOpen } from 'lucide-react';

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

interface RoleSelectionStepProps {
  data: OnboardingData;
  onNext: (data?: Partial<OnboardingData>) => void;
  onBack?: () => void;
}

const roleOptions = [
  {
    id: 'learner',
    title: 'Learner',
    description: 'I want to learn new skills and advance my knowledge',
    icon: BookOpen,
    details: 'Perfect for students, career changers, or anyone looking to acquire new skills',
    benefits: ['Personalized learning paths', 'Skill assessments', 'Progress tracking']
  },
  {
    id: 'professional',
    title: 'Professional',
    description: 'I\'m a working professional looking to upskill',
    icon: User,
    details: 'Ideal for professionals wanting to stay current in their field or advance their careers',
    benefits: ['Industry-relevant skills', 'Career advancement paths', 'Professional networking']
  },
  {
    id: 'mentor',
    title: 'Mentor',
    description: 'I want to mentor and teach others',
    icon: Users,
    details: 'Great for experienced professionals who want to share knowledge and guide others',
    benefits: ['Create courses', 'Mentor learners', 'Build your reputation']
  }
];

const RoleSelectionStep: React.FC<RoleSelectionStepProps> = ({ data, onNext, onBack }) => {
  const [selectedRole, setSelectedRole] = useState<string>(data.role || '');

  const handleNext = () => {
    if (selectedRole) {
      onNext({ role: selectedRole });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-poppins font-bold text-foreground">
          What best describes your goals?
        </h2>
        <p className="text-muted-foreground font-inter">
          This helps us tailor your experience and recommend the most relevant content
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roleOptions.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          
          return (
            <Card
              key={role.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                isSelected 
                  ? 'border-accent bg-accent/5 shadow-lg' 
                  : 'border-border/50 hover:border-accent/50'
              }`}
              onClick={() => setSelectedRole(role.id)}
            >
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                  isSelected ? 'bg-accent text-white' : 'bg-accent/10 text-accent'
                }`}>
                  <Icon className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl font-poppins font-semibold">
                  {role.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-muted-foreground font-inter text-center">
                  {role.description}
                </p>
                
                <p className="text-sm text-muted-foreground font-inter">
                  {role.details}
                </p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Key Benefits:</h4>
                  <ul className="space-y-1">
                    {role.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center">
                        <div className="w-1 h-1 bg-accent rounded-full mr-2"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!selectedRole}
          className="btn-hero flex items-center"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default RoleSelectionStep;