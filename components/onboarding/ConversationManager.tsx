"use client";

import { ChatMessage } from './AIConversationInterface';

export interface ConversationStep {
  id: string;
  type: 'question' | 'confirmation' | 'completion';
  aiMessage: string;
  options?: string[];
  expectsInput: boolean;
  nextStep?: string | ((response: string) => string);
  dataField?: string; // Which field in onboarding data this maps to
  validation?: (response: string) => boolean;
  errorMessage?: string;
}

export interface ExtractedData {
  firstName?: string;
  lastName?: string;
  role?: string;
  industry?: string;
  careerStage?: string;
  goals?: Array<{
    skillName: string;
    description: string;
    targetSkillLevel: string;
    priority: number;
  }>;
  preferences?: {
    learningStyle?: string;
    timeCommitment?: string;
    notifications?: boolean;
  };
  bio?: string;
}

// Define the conversation flow
export const conversationSteps: Record<string, ConversationStep> = {
  welcome: {
    id: 'welcome',
    type: 'question',
    aiMessage: "Hi there! 🦉 I'm your SkillSync AI assistant, and I'm excited to help you create a personalized learning journey! What's your first name?",
    expectsInput: true,
    nextStep: 'role_discovery',
    dataField: 'firstName'
  },

  role_discovery: {
    id: 'role_discovery',
    type: 'question',
    aiMessage: "Nice to meet you! Now, I'd love to understand your background better. Are you currently a student, working professional, or someone looking to change careers?",
    options: [
      "I'm a student 📚",
      "I'm a working professional 💼", 
      "I'm looking to change careers 🔄",
      "I'm between jobs/other 🤔"
    ],
    expectsInput: false,
    nextStep: (response: string) => {
      if (response.includes('student')) return 'student_path';
      if (response.includes('professional')) return 'professional_path';
      if (response.includes('change careers')) return 'career_changer_path';
      return 'other_path';
    },
    dataField: 'role'
  },

  student_path: {
    id: 'student_path',
    type: 'question',
    aiMessage: "That's exciting! Learning never stops. What field or industry do you want to develop skills in? This could be related to your studies, or something completely different you're passionate about!",
    options: [
      "Software Development 💻",
      "Data Science & Analytics 📊",
      "Digital Marketing 📱",
      "UX/UI Design 🎨",
      "Business & Finance 💼",
      "Healthcare & Medicine 🏥",
      "Other (I'll type it) ✏️"
    ],
    expectsInput: true,
    nextStep: 'goals_exploration', // Students skip experience level and go directly to goals
    dataField: 'industry'
  },

  professional_path: {
    id: 'professional_path',
    type: 'question',
    aiMessage: "Awesome! Continuous learning is key to professional growth. What field or industry do you want to develop skills in? This could be to advance in your current field or transition to something new!",
    options: [
      "Software Development 💻",
      "Data Science & Analytics 📊",
      "Digital Marketing 📱",
      "UX/UI Design 🎨",
      "Project Management 📋",
      "Leadership & Management 👥",
      "Other (I'll type it) ✏️"
    ],
    expectsInput: true,
    nextStep: 'experience_level',
    dataField: 'industry'
  },

  career_changer_path: {
    id: 'career_changer_path',
    type: 'question',
    aiMessage: "That's exciting - career changes can be incredibly rewarding! What field are you looking to transition into? This will help me tailor your learning path for your new career goals.",
    options: [
      "Software Development 💻",
      "Data Science & Analytics 📊",
      "Digital Marketing 📱",
      "UX/UI Design 🎨",
      "Cloud Computing ☁️",
      "Cybersecurity 🔒",
      "Other (I'll type it) ✏️"
    ],
    expectsInput: true,
    nextStep: 'transition_timeline',
    dataField: 'industry'
  },

  other_path: {
    id: 'other_path',
    type: 'question',
    aiMessage: "No worries! Everyone's journey is unique. What area or industry interests you most for skill development? This could be anything from technology and creative fields to business or personal development.",
    options: [
      "Software Development 💻",
      "Creative Arts & Design 🎨",
      "Business & Entrepreneurship 💼",
      "Health & Wellness 🌱",
      "Education & Training 📚",
      "Personal Development 🚀",
      "Other (I'll type it) ✏️"
    ],
    expectsInput: true,
    nextStep: 'goals_exploration',
    dataField: 'industry'
  },

  experience_level: {
    id: 'experience_level',
    type: 'question',
    aiMessage: "Perfect! Now, how would you describe your professional experience level in your current field?",
    options: [
      "Just starting out (0-2 years) 🌱",
      "Getting comfortable (2-5 years) 📈",
      "Experienced (5-10 years) 💪",
      "Senior/Expert (10+ years) 🎯"
    ],
    expectsInput: false,
    nextStep: 'goals_exploration',
    dataField: 'careerStage'
  },

  transition_timeline: {
    id: 'transition_timeline',
    type: 'question',
    aiMessage: "What's your timeline for making this career transition?",
    options: [
      "I'm actively job searching now 🏃‍♂️",
      "Within the next 6 months ⏰",
      "Within the next year 📅",
      "It's a longer-term goal (1+ years) 🎯"
    ],
    expectsInput: false,
    nextStep: 'goals_exploration',
    dataField: 'careerStage'
  },

  industry_from_field: {
    id: 'industry_from_field',
    type: 'confirmation',
    aiMessage: "Great! I can see you're passionate about learning. Now let's talk about your goals - what specific skills would you like to develop or improve? You can mention anything from technical skills to soft skills like communication or leadership.",
    expectsInput: true,
    nextStep: 'goals_deep_dive',
    dataField: 'bio'
  },

  goals_exploration: {
    id: 'goals_exploration',
    type: 'question',
    aiMessage: "Now for the exciting part! What's the ONE main skill you'd like to focus on developing? This could be a technical skill relevant to your field or a soft skill like communication or leadership. Please choose your top priority learning goal.",
    expectsInput: true,
    nextStep: 'goals_deep_dive',
    dataField: 'goals'
  },

  goals_deep_dive: {
    id: 'goals_deep_dive',
    type: 'question',
    aiMessage: "That's an excellent goal! What's your current skill level in this learning area?",
    options: [
      "Complete beginner 🌱",
      "Some basics �",
      "Intermediate �", 
      "Advanced 🎯"
    ],
    expectsInput: false,
    nextStep: 'learning_preferences',
    dataField: 'currentSkillLevel'
  },

  learning_preferences: {
    id: 'learning_preferences',
    type: 'question',
    aiMessage: "Almost done! How do you prefer to learn? This helps me recommend the best resources for you.",
    options: [
      "Hands-on projects and practice 🛠️",
      "Reading and research 📚",
      "Video tutorials and courses 🎥",
      "Interactive discussions and mentoring 💬",
      "Mix of everything 🎨"
    ],
    expectsInput: false,
    nextStep: 'time_commitment',
    dataField: 'learningStyle'
  },

  time_commitment: {
    id: 'time_commitment',
    type: 'question',
    aiMessage: "Last question! How much time can you realistically dedicate to learning each week?",
    options: [
      "1-3 hours (casual learning) ⏳",
      "4-7 hours (steady progress) 📅",
      "8-15 hours (focused growth) 🎯",
      "15+ hours (intensive learning) 🚀"
    ],
    expectsInput: false,
    nextStep: 'completion',
    dataField: 'timeCommitment'
  },

  completion: {
    id: 'completion',
    type: 'completion',
    aiMessage: "Perfect! 🎉 I have everything I need to create your personalized learning roadmap. Give me a moment to analyze your goals and craft a tailored plan that will help you achieve your objectives efficiently. This is going to be exciting!",
    expectsInput: false,
    nextStep: ''
  }
};

export class ConversationManager {
  private currentStep: string = 'welcome';
  private extractedData: ExtractedData = {};
  private conversationHistory: ChatMessage[] = [];
  private retryAttempts: Record<string, number> = {};

  constructor() {
    // Add initial welcome message
    this.addAIMessage(conversationSteps.welcome.aiMessage, conversationSteps.welcome.options);
  }

  // Smart validation for industry input
  private validateIndustry(input: string): { isValid: boolean; message?: string; normalizedValue?: string } {
    const cleanInput = input.toLowerCase().trim();
    
    // Check if it's gibberish or completely unrelated
    if (cleanInput.length < 2) {
      return { isValid: false, message: "Could you tell me a bit more about what field interests you?" };
    }
    
    // Define industry keywords for validation
    const validKeywords = [
      // Technology
      'technology', 'tech', 'software', 'programming', 'coding', 'development', 'web', 'mobile', 'app',
      'data', 'analytics', 'science', 'ai', 'artificial intelligence', 'machine learning', 'cybersecurity',
      'cloud', 'devops', 'blockchain', 'crypto', 'computer', 'it', 'information technology',
      
      // Business & Finance
      'business', 'finance', 'financial', 'accounting', 'banking', 'investment', 'economics',
      'management', 'leadership', 'project management', 'consulting', 'strategy', 'operations',
      'marketing', 'sales', 'advertising', 'pr', 'public relations', 'social media',
      
      // Creative & Design
      'design', 'creative', 'art', 'graphics', 'visual', 'ui', 'ux', 'user experience',
      'branding', 'photography', 'video', 'animation', 'multimedia', 'content creation',
      
      // Healthcare & Science
      'healthcare', 'health', 'medical', 'medicine', 'nursing', 'pharmacy', 'therapy',
      'psychology', 'research', 'science', 'biology', 'chemistry', 'physics',
      
      // Education & Training
      'education', 'teaching', 'training', 'learning', 'instruction', 'curriculum',
      'academic', 'university', 'school',
      
      // Other fields
      'engineering', 'manufacturing', 'construction', 'agriculture', 'environment',
      'legal', 'law', 'government', 'nonprofit', 'retail', 'hospitality', 'transportation'
    ];
    
    // Check if input contains any valid keywords
    const hasValidKeyword = validKeywords.some(keyword => cleanInput.includes(keyword));
    
    // Check for obvious gibberish patterns
    const gibberishPatterns = [
      /^[a-z]{1,2}$/i, // Single/double letters
      /pizza|cat|dog|random|idk|dunno|whatever/i, // Common irrelevant words
      /^[\d\s\W]+$/, // Only numbers/symbols
      /(.)\1{3,}/ // Repeated characters like "aaaa"
    ];
    
    const isGibberish = gibberishPatterns.some(pattern => pattern.test(cleanInput));
    
    if (isGibberish || !hasValidKeyword) {
      return {
        isValid: false,
        message: "I want to make sure I understand correctly. Could you tell me about a specific field or industry you want to learn about? For example: technology, healthcare, business, creative arts, etc."
      };
    }
    
    return { isValid: true, normalizedValue: input.trim() };
  }

  getCurrentStep(): ConversationStep {
    return conversationSteps[this.currentStep];
  }

  getMessages(): ChatMessage[] {
    return this.conversationHistory;
  }

  getExtractedData(): ExtractedData {
    return { ...this.extractedData };
  }

  addAIMessage(content: string, options?: string[], expectsInput: boolean = true): void {
    const message: ChatMessage = {
      id: `ai-${Date.now()}`,
      type: 'ai',
      content, // Store the full content
      timestamp: new Date(),
      options,
      expectsInput,
      showTypingAnimation: true,
      isTyping: false // Start with typing animation, not thinking dots
    };
    this.conversationHistory.push(message);
  }

  addUserMessage(content: string): void {
    const message: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date()
    };
    this.conversationHistory.push(message);
  }

  private extractDataFromResponse(response: string, step: ConversationStep): void {
    if (!step.dataField) return;

    switch (step.dataField) {
      case 'firstName':
        // Extract first name, handle full names
        const nameParts = response.trim().split(' ');
        this.extractedData.firstName = nameParts[0];
        if (nameParts.length > 1) {
          this.extractedData.lastName = nameParts.slice(1).join(' ');
        }
        break;

      case 'role':
        if (response.includes('student')) {
          this.extractedData.role = 'student';
          this.extractedData.careerStage = 'student'; // Use the correct Django choice value
        } else if (response.includes('professional')) {
          this.extractedData.role = 'professional';
          // careerStage will be set in experience_level step
        } else if (response.includes('change careers')) {
          this.extractedData.role = 'career_changer';
          // careerStage will be set in transition_timeline step as 'career_changer'
        } else {
          this.extractedData.role = 'other';
          this.extractedData.careerStage = 'entry_level'; // Default for 'other' users
        }
        break;

      case 'industry':
        // Validate industry input
        const validation = this.validateIndustry(response);
        if (validation.isValid) {
          this.extractedData.industry = validation.normalizedValue || response.trim();
        } else {
          // Invalid input - we'll handle this in processUserResponse
          this.extractedData.industry = response.trim(); // Store for retry logic
        }
        break;

      case 'careerStage':
        if (response.includes('0-2 years') || response.includes('starting')) this.extractedData.careerStage = 'entry_level';
        else if (response.includes('2-5 years') || response.includes('comfortable')) this.extractedData.careerStage = 'mid_level';
        else if (response.includes('5-10 years') || response.includes('experienced')) this.extractedData.careerStage = 'senior_level';
        else if (response.includes('10+ years') || response.includes('expert')) this.extractedData.careerStage = 'executive';
        else if (response.includes('actively')) this.extractedData.careerStage = 'career_changer';
        else if (response.includes('6 months')) this.extractedData.careerStage = 'career_changer';
        else if (response.includes('year')) this.extractedData.careerStage = 'career_changer';
        break;

      case 'goals':
        // Parse goals from natural language
        const goalText = response.trim();
        this.extractedData.goals = [{
          skillName: goalText.split(',')[0].trim(), // Take first mentioned skill as primary
          description: goalText,
          targetSkillLevel: 'intermediate', // Default, will be updated later
          priority: 1
        }];
        break;

      case 'currentSkillLevel':
        // Map the current skill level options to standard values
        if (response.includes('Complete beginner')) {
          this.extractedData.goals![0].targetSkillLevel = 'beginner';
        } else if (response.includes('Some basics')) {
          this.extractedData.goals![0].targetSkillLevel = 'intermediate';
        } else if (response.includes('Intermediate')) {
          this.extractedData.goals![0].targetSkillLevel = 'advanced';
        } else if (response.includes('Advanced')) {
          this.extractedData.goals![0].targetSkillLevel = 'expert';
        }
        break;

      case 'learningStyle':
        if (!this.extractedData.preferences) this.extractedData.preferences = {};
        if (response.includes('Hands-on')) this.extractedData.preferences.learningStyle = 'hands_on';
        else if (response.includes('Reading')) this.extractedData.preferences.learningStyle = 'reading';
        else if (response.includes('Video')) this.extractedData.preferences.learningStyle = 'video';
        else if (response.includes('Interactive')) this.extractedData.preferences.learningStyle = 'interactive';
        else this.extractedData.preferences.learningStyle = 'mixed';
        break;

      case 'timeCommitment':
        if (!this.extractedData.preferences) this.extractedData.preferences = {};
        if (response.includes('1-3 hours')) this.extractedData.preferences.timeCommitment = 'casual';
        else if (response.includes('4-7 hours')) this.extractedData.preferences.timeCommitment = 'steady';
        else if (response.includes('8-15 hours')) this.extractedData.preferences.timeCommitment = 'focused';
        else if (response.includes('15+ hours')) this.extractedData.preferences.timeCommitment = 'intensive';
        break;

      case 'bio':
        this.extractedData.bio = response.trim();
        break;
    }
  }

  private getPersonalizedResponse(step: ConversationStep): string {
    let message = step.aiMessage;
    
    // Personalize messages with user's name
    if (this.extractedData.firstName) {
      message = message.replace(/Hi there!/g, `Hi ${this.extractedData.firstName}!`);
      message = message.replace(/Perfect!/g, `Perfect, ${this.extractedData.firstName}!`);
    }

    return message;
  }

  processUserResponse(response: string): { hasNext: boolean; isComplete: boolean } {
    const currentStep = this.getCurrentStep();
    
    // Add user message to history
    this.addUserMessage(response);

    // Special handling for industry validation
    if (currentStep.dataField === 'industry') {
      const validation = this.validateIndustry(response);
      if (!validation.isValid) {
        // Industry input is invalid, ask for clarification
        const retryKey = `${currentStep.id}_retry`;
        this.retryAttempts[retryKey] = (this.retryAttempts[retryKey] || 0) + 1;
        
        if (this.retryAttempts[retryKey] <= 2) {
          // Give user another chance with helpful guidance
          this.addAIMessage(validation.message!, currentStep.options, true);
          return { hasNext: true, isComplete: false };
        } else {
          // After 2 retries, accept whatever they typed and move on
          this.extractedData.industry = response.trim();
        }
      }
    }

    // Extract data from response
    this.extractDataFromResponse(response, currentStep);

    // Determine next step
    let nextStepId: string;
    if (typeof currentStep.nextStep === 'function') {
      nextStepId = currentStep.nextStep(response);
    } else {
      nextStepId = currentStep.nextStep || '';
    }

    // If we have a next step, proceed
    if (nextStepId && conversationSteps[nextStepId]) {
      this.currentStep = nextStepId;
      const nextStep = conversationSteps[nextStepId];
      
      if (nextStep.type === 'completion') {
        this.addAIMessage(this.getPersonalizedResponse(nextStep), [], false);
        return { hasNext: false, isComplete: true };
      } else {
        this.addAIMessage(this.getPersonalizedResponse(nextStep), nextStep.options, nextStep.expectsInput);
        return { hasNext: true, isComplete: false };
      }
    }

    return { hasNext: false, isComplete: true };
  }

  // Method to simulate AI typing delay
  async simulateTyping(callback: () => void, delay: number = 1500): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        callback();
        resolve();
      }, delay);
    });
  }
}