"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Brain, Target, CheckCircle } from 'lucide-react';

interface LoadingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: number; // in milliseconds
}

const loadingSteps: LoadingStep[] = [
  {
    id: 'processing',
    title: 'Processing Your Profile',
    description: 'Analyzing your background and learning preferences...',
    icon: <Sparkles className="w-6 h-6 text-accent animate-pulse" />,
    duration: 2000
  },
  {
    id: 'analyzing',
    title: 'Analyzing Learning Goals',
    description: 'Understanding your skill targets and career objectives...',
    icon: <Target className="w-6 h-6 text-accent animate-pulse" />,
    duration: 2500
  },
  {
    id: 'generating',
    title: 'Generating AI Roadmap',
    description: 'Creating a personalized learning path with our AI engine...',
    icon: <Brain className="w-6 h-6 text-accent animate-pulse" />,
    duration: 4000
  },
  {
    id: 'finalizing',
    title: 'Finalizing Your Journey',
    description: 'Preparing your dashboard and recommendations...',
    icon: <CheckCircle className="w-6 h-6 text-green-500 animate-pulse" />,
    duration: 1500
  }
];

interface DynamicLoadingScreenProps {
  onComplete?: () => void;
}

export default function DynamicLoadingScreen({ onComplete }: DynamicLoadingScreenProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (currentStepIndex >= loadingSteps.length) {
      onComplete?.();
      return;
    }

    const currentStep = loadingSteps[currentStepIndex];
    let startTime = Date.now();
    
    // Start transition to new step
    setIsTransitioning(true);
    
    // Reset step progress after a brief transition delay
    const transitionTimeout = setTimeout(() => {
      setStepProgress(0);
      setIsTransitioning(false);
    }, 150);
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const stepProgressValue = Math.min((elapsed / currentStep.duration) * 100, 100);
      
      if (!isTransitioning) {
        setStepProgress(stepProgressValue);
      }
      
      // Calculate overall progress - ensure it never goes backward
      const completedStepsProgress = (currentStepIndex / loadingSteps.length) * 100;
      const currentStepContribution = isTransitioning ? 0 : (stepProgressValue / 100) * (100 / loadingSteps.length);
      const totalProgress = completedStepsProgress + currentStepContribution;
      
      setProgress(prev => Math.max(prev, totalProgress)); // Prevent backward movement
      
      if (stepProgressValue < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        // Step completed - only add if not already completed
        setCompletedSteps(prev => {
          if (!prev.includes(currentStep.id)) {
            return [...prev, currentStep.id];
          }
          return prev;
        });
        setTimeout(() => {
          setCurrentStepIndex(prev => prev + 1);
        }, 300); // Small delay before moving to next step
      }
    };
    
    // Start the progress animation
    const startTimeout = setTimeout(() => {
      requestAnimationFrame(updateProgress);
    }, 100);
    
    return () => {
      clearTimeout(startTimeout);
      clearTimeout(transitionTimeout);
    };
  }, [currentStepIndex, onComplete, isTransitioning]);

  const currentStep = loadingSteps[currentStepIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="p-8 text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent/60 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-white animate-spin" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-poppins font-bold text-foreground">
                Creating Your Learning Journey
              </h2>
              <p className="text-muted-foreground font-inter">
                Our AI is working hard to craft the perfect roadmap for you
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <Progress value={progress} className="w-full h-3" />
            <p className="text-sm text-muted-foreground font-inter">
              {Math.round(progress)}% Complete
            </p>
          </div>

          {/* Current Step */}
          {currentStep && (
            <div className="space-y-4 bg-accent/5 rounded-xl p-6">
              <div className="flex items-center justify-center space-x-3">
                {currentStep.icon}
                <h3 className="text-lg font-poppins font-semibold text-foreground">
                  {currentStep.title}
                </h3>
              </div>
              
              <p className="text-muted-foreground font-inter">
                {currentStep.description}
              </p>
              
              {/* Step Progress */}
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-accent h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${stepProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Completed Steps */}
          {completedSteps.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-poppins font-medium text-muted-foreground">
                Completed Steps:
              </h4>
              <div className="flex flex-wrap gap-2 justify-center">
                {completedSteps.map((stepId) => {
                  const step = loadingSteps.find(s => s.id === stepId);
                  return step ? (
                    <div 
                      key={stepId}
                      className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-inter"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>{step.title}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Fun Facts */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-inter">
              💡 Did you know? Our AI analyzes thousands of career paths to create your perfect learning journey
            </p>
            <p className="text-xs text-muted-foreground font-inter">
              🚀 This usually takes 10-15 seconds, but the results are worth it!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}