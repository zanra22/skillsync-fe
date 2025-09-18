"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, ArrowLeft, Target, Plus, Trash2 } from 'lucide-react';

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

interface GoalsSetupStepProps {
  data: OnboardingData;
  onNext: (data?: Partial<OnboardingData>) => void;
  onBack?: () => void;
}

const skillLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' }
];

const defaultGoal = {
  skillName: '',
  description: '',
  targetSkillLevel: 'beginner',
  priority: 1
};

const GoalsSetupStep: React.FC<GoalsSetupStepProps> = ({ data, onNext, onBack }) => {
  const [goals, setGoals] = useState(data.goals || [defaultGoal]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (goals.length === 0) {
      newErrors.general = 'Please add at least one learning goal';
    }

    goals.forEach((goal, index) => {
      if (!goal.skillName.trim()) {
        newErrors[`goal-${index}-skillName`] = 'Skill name is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext({ goals });
    }
  };

  const addGoal = () => {
    setGoals(prev => [...prev, { ...defaultGoal, priority: prev.length + 1 }]);
  };

  const removeGoal = (index: number) => {
    setGoals(prev => prev.filter((_, i) => i !== index));
  };

  const updateGoal = (index: number, field: string, value: string | number) => {
    setGoals(prev => prev.map((goal, i) => 
      i === index ? { ...goal, [field]: value } : goal
    ));
    
    // Clear errors for this field
    const errorKey = `goal-${index}-${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
          <Target className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-2xl font-poppins font-bold text-foreground">
          Set Your Learning Goals
        </h2>
        <p className="text-muted-foreground font-inter">
          What skills do you want to develop? Our AI will create personalized roadmaps for each goal.
        </p>
      </div>

      <div className="space-y-4">
        {goals.map((goal, index) => (
          <Card key={index} className="bg-card/95 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-poppins font-semibold">
                Goal {index + 1}
              </CardTitle>
              {goals.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGoal(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-inter font-medium">
                    Skill Name *
                  </Label>
                  <Input
                    placeholder="e.g., Python Programming, Data Analysis"
                    value={goal.skillName}
                    onChange={(e) => updateGoal(index, 'skillName', e.target.value)}
                    className={`${errors[`goal-${index}-skillName`] ? 'border-destructive' : ''}`}
                  />
                  {errors[`goal-${index}-skillName`] && (
                    <p className="text-sm text-destructive font-inter">
                      {errors[`goal-${index}-skillName`]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="font-inter font-medium">
                    Target Level
                  </Label>
                  <Select 
                    value={goal.targetSkillLevel} 
                    onValueChange={(value) => updateGoal(index, 'targetSkillLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {skillLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-inter font-medium">
                  Description (Optional)
                </Label>
                <Textarea
                  placeholder="Describe what you want to achieve with this skill..."
                  value={goal.description}
                  onChange={(e) => updateGoal(index, 'description', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {goals.length < 5 && (
          <Card className="border-dashed border-2 border-border/50 hover:border-accent/50 transition-colors cursor-pointer" onClick={addGoal}>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <Plus className="w-8 h-8 text-accent mx-auto" />
                <p className="text-muted-foreground font-inter">
                  Add Another Goal
                </p>
                <p className="text-sm text-muted-foreground font-inter">
                  You can add up to 5 goals based on your subscription
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {errors.general && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-destructive font-inter">
            {errors.general}
          </p>
        </div>
      )}

      <div className="bg-accent/5 rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-2">
          What happens next?
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Our AI will analyze your goals and create personalized learning roadmaps</li>
          <li>• You'll get step-by-step guidance for each skill</li>
          <li>• Progress tracking and milestone celebrations</li>
          <li>• Recommended resources, courses, and mentors</li>
        </ul>
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
          className="btn-hero flex items-center"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default GoalsSetupStep;