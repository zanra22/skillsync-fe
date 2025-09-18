"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, Briefcase } from 'lucide-react';

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

interface IndustrySelectionStepProps {
  data: OnboardingData;
  onNext: (data?: Partial<OnboardingData>) => void;
  onBack?: () => void;
}

const industries = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'design', label: 'Design' },
  { value: 'sales', label: 'Sales' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'startup', label: 'Startup' },
  { value: 'non_profit', label: 'Non-Profit' },
  { value: 'government', label: 'Government' },
  { value: 'other', label: 'Other' }
];

const careerStages = [
  { value: 'student', label: 'Student' },
  { value: 'entry_level', label: 'Entry Level (0-2 years)' },
  { value: 'mid_level', label: 'Mid Level (3-7 years)' },
  { value: 'senior_level', label: 'Senior Level (8+ years)' },
  { value: 'executive', label: 'Executive' },
  { value: 'career_changer', label: 'Career Changer' },
  { value: 'freelancer', label: 'Freelancer' }
];

const IndustrySelectionStep: React.FC<IndustrySelectionStepProps> = ({ data, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    industry: data.industry || '',
    careerStage: data.careerStage || ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.industry) {
      newErrors.industry = 'Please select your industry';
    }

    if (!formData.careerStage) {
      newErrors.careerStage = 'Please select your career stage';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext(formData);
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user makes selection
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
          <Briefcase className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-2xl font-poppins font-bold text-foreground">
          Your Professional Context
        </h2>
        <p className="text-muted-foreground font-inter">
          Help us understand your industry and experience level
        </p>
      </div>

      <Card className="bg-card/95 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-poppins font-semibold">
            Industry & Career Stage
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="industry" className="font-inter font-medium">
              Primary Industry *
            </Label>
            <Select 
              value={formData.industry} 
              onValueChange={(value) => handleSelectChange('industry', value)}
            >
              <SelectTrigger className={`${errors.industry ? 'border-destructive' : ''}`}>
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry.value} value={industry.value}>
                    {industry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.industry && (
              <p className="text-sm text-destructive font-inter">
                {errors.industry}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="careerStage" className="font-inter font-medium">
              Career Stage *
            </Label>
            <Select 
              value={formData.careerStage} 
              onValueChange={(value) => handleSelectChange('careerStage', value)}
            >
              <SelectTrigger className={`${errors.careerStage ? 'border-destructive' : ''}`}>
                <SelectValue placeholder="Select your career stage" />
              </SelectTrigger>
              <SelectContent>
                {careerStages.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.careerStage && (
              <p className="text-sm text-destructive font-inter">
                {errors.careerStage}
              </p>
            )}
          </div>

          <div className="bg-accent/5 rounded-lg p-4">
            <h4 className="text-sm font-medium text-foreground mb-2">
              How this helps you:
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Get industry-specific skill recommendations</li>
              <li>• Connect with peers at similar career stages</li>
              <li>• Access relevant job market insights</li>
              <li>• Receive targeted learning paths</li>
            </ul>
          </div>

          {formData.industry && formData.careerStage && (
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-accent mb-2">
                Perfect! Based on your selection:
              </h4>
              <p className="text-sm text-muted-foreground">
                We'll focus on {industries.find(i => i.value === formData.industry)?.label} skills 
                appropriate for someone at the {careerStages.find(s => s.value === formData.careerStage)?.label.toLowerCase()} stage.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
          className="btn-hero flex items-center"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default IndustrySelectionStep;