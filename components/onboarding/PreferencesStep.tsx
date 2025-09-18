"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowRight, ArrowLeft, Settings, CheckCircle } from 'lucide-react';

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

interface PreferencesStepProps {
  data: OnboardingData;
  onNext: (data?: Partial<OnboardingData>) => void;
  onBack?: () => void;
}

const learningStyles = [
  { value: 'visual', label: 'Visual (diagrams, charts, videos)' },
  { value: 'auditory', label: 'Auditory (podcasts, lectures, discussions)' },
  { value: 'reading', label: 'Reading/Writing (articles, notes, text)' },
  { value: 'kinesthetic', label: 'Hands-on (practice, projects, experiments)' },
  { value: 'mixed', label: 'Mixed (combination of all styles)' }
];

const timeCommitments = [
  { value: '1-2', label: '1-2 hours per week' },
  { value: '3-5', label: '3-5 hours per week' },
  { value: '6-10', label: '6-10 hours per week' },
  { value: '10+', label: '10+ hours per week' }
];

const PreferencesStep: React.FC<PreferencesStepProps> = ({ data, onNext, onBack }) => {
  const [preferences, setPreferences] = useState({
    learningStyle: data.preferences?.learningStyle || '',
    timeCommitment: data.preferences?.timeCommitment || '',
    notifications: data.preferences?.notifications ?? true
  });

  const handleNext = () => {
    onNext({ preferences });
  };

  const updatePreference = (field: string, value: string | boolean) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
          <Settings className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-2xl font-poppins font-bold text-foreground">
          Customize Your Experience
        </h2>
        <p className="text-muted-foreground font-inter">
          Help us tailor the platform to your learning preferences
        </p>
      </div>

      <Card className="bg-card/95 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-poppins font-semibold">
            Learning Preferences
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="font-inter font-medium">
              Preferred Learning Style
            </Label>
            <Select 
              value={preferences.learningStyle} 
              onValueChange={(value) => updatePreference('learningStyle', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="How do you learn best?" />
              </SelectTrigger>
              <SelectContent>
                {learningStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground font-inter">
              We'll prioritize content that matches your learning style
            </p>
          </div>

          <div className="space-y-2">
            <Label className="font-inter font-medium">
              Weekly Time Commitment
            </Label>
            <Select 
              value={preferences.timeCommitment} 
              onValueChange={(value) => updatePreference('timeCommitment', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="How much time can you dedicate?" />
              </SelectTrigger>
              <SelectContent>
                {timeCommitments.map((time) => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground font-inter">
              Helps us create realistic learning schedules
            </p>
          </div>

          <div className="flex items-center justify-between py-4 border-t border-border/50">
            <div className="space-y-1">
              <Label className="font-inter font-medium">
                Learning Reminders
              </Label>
              <p className="text-sm text-muted-foreground font-inter">
                Get notifications about your learning goals and progress
              </p>
            </div>
            <Switch
              checked={preferences.notifications}
              onCheckedChange={(checked) => updatePreference('notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-accent mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-poppins font-semibold text-foreground">
                You're almost done!
              </h3>
              <p className="text-sm text-muted-foreground font-inter">
                Once you complete this step, our AI will analyze your profile and create 
                personalized learning roadmaps for your goals. This usually takes just a few seconds.
              </p>
            </div>
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
          Complete Setup
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PreferencesStep;