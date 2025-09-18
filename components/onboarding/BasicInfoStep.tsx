"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft, User } from 'lucide-react';

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

interface BasicInfoStepProps {
  data: OnboardingData;
  onNext: (data?: Partial<OnboardingData>) => void;
  onBack?: () => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    bio: data.bio || ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext(formData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
          <User className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-2xl font-poppins font-bold text-foreground">
          Tell us about yourself
        </h2>
        <p className="text-muted-foreground font-inter">
          Help us personalize your learning experience
        </p>
      </div>

      <Card className="bg-card/95 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-poppins font-semibold">
            Basic Information
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="font-inter font-medium">
                First Name *
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`border-border focus:border-accent focus:ring-accent/20 ${
                  errors.firstName ? 'border-destructive' : ''
                }`}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive font-inter">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="font-inter font-medium">
                Last Name *
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`border-border focus:border-accent focus:ring-accent/20 ${
                  errors.lastName ? 'border-destructive' : ''
                }`}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive font-inter">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="font-inter font-medium">
              Bio (Optional)
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell us a bit about yourself, your background, and what you hope to achieve..."
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className={`border-border focus:border-accent focus:ring-accent/20 min-h-[100px] ${
                errors.bio ? 'border-destructive' : ''
              }`}
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              {errors.bio ? (
                <p className="text-sm text-destructive font-inter">
                  {errors.bio}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground font-inter">
                  This helps us understand your background and goals
                </p>
              )}
              <p className="text-sm text-muted-foreground font-inter">
                {formData.bio.length}/500
              </p>
            </div>
          </div>

          <div className="bg-accent/5 rounded-lg p-4">
            <h4 className="text-sm font-medium text-foreground mb-2">
              Why do we ask for this?
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Personalize your learning recommendations</li>
              <li>• Connect you with relevant mentors and peers</li>
              <li>• Tailor content to your experience level</li>
            </ul>
          </div>
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

export default BasicInfoStep;