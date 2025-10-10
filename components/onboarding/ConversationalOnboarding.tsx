"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AIConversationInterface, { ChatMessage } from './AIConversationInterface';
import { ConversationManager, ExtractedData } from './ConversationManager';
import DynamicLoadingScreen from './DynamicLoadingScreen';
import { Sparkles } from 'lucide-react';

interface ConversationalOnboardingProps {
  onComplete: (data: ExtractedData) => void;
  isSubmitting?: boolean;
}

export default function ConversationalOnboarding({ onComplete, isSubmitting = false }: ConversationalOnboardingProps) {
  const [conversationManager] = useState(() => new ConversationManager());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [awaitingInput, setAwaitingInput] = useState(false);
  const [isOtherSelected, setIsOtherSelected] = useState(false); // Track when Other is selected

  // Initialize messages on mount
  useEffect(() => {
    setMessages(conversationManager.getMessages());
  }, [conversationManager]);

  const handleSendMessage = async (message: string) => {
    // Reset "Other" selection state when sending a message
    setIsOtherSelected(false);
    
    // Immediately disable input
    setAwaitingInput(false);
    
    // First, just add the user message by processing it but only taking the user part
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date(),
      showTypingAnimation: false,
      isTyping: false
    };
    
    // Show user message immediately
    setMessages(prev => [...prev, userMessage]);
    
    // Add typing indicator message
    const typingIndicator: ChatMessage = {
      id: `typing-${Date.now()}`,
      type: 'ai',
      content: '...',
      timestamp: new Date(),
      showTypingAnimation: false,
      isTyping: true
    };
    
    // Show typing indicator
    setMessages(prev => [...prev, typingIndicator]);
    setIsAITyping(true);
    
    // Simulate AI thinking time (1-2 seconds)
    const thinkingTime = 1000 + Math.random() * 1000;
    
    setTimeout(() => {
      try {
        // Now process the user response to get the AI response
        const result = conversationManager.processUserResponse(message);
        
        if (result.isComplete) {
          setIsComplete(true);
          const extractedData = conversationManager.getExtractedData();
          console.log('🎉 Conversation complete! Extracted data:', extractedData);
          
          // Replace typing indicator with completion message
          const finalMessages = conversationManager.getMessages();
          setMessages(finalMessages);
          setIsAITyping(false);
          
          // Give a moment for user to see completion message
          setTimeout(() => {
            onComplete(extractedData);
          }, 1500);
          return;
        }
        
        // Remove typing indicator and show actual AI response
        const allMessages = conversationManager.getMessages();
        // Filter out the user message we manually added since it's now in the conversation manager
        const messagesWithoutDuplicateUser = allMessages.filter((msg, index) => {
          if (msg.type === 'user' && msg.content === message) {
            // Keep only the last occurrence (the one from conversation manager)
            const lastUserIndex = allMessages.map((m, i) => m.type === 'user' && m.content === message ? i : -1)
              .filter(i => i !== -1)
              .pop();
            return index === lastUserIndex;
          }
          return true;
        });
        
        setMessages(messagesWithoutDuplicateUser);
        setIsAITyping(false);
        
      } catch (error) {
        console.error('Error processing user response:', error);
        // Remove typing indicator on error and re-enable input
        setMessages(prev => prev.filter(msg => !msg.isTyping));
        setIsAITyping(false);
        setAwaitingInput(true);
      }
    }, thinkingTime);
  };

  const handleSelectOption = async (option: string) => {
    await handleSendMessage(option);
  };

  const handleOtherSelected = () => {
    // When "Other" is selected, enable text input for custom industry
    setIsOtherSelected(true);
    setAwaitingInput(true);
  };

  const handleTypingComplete = (messageId: string) => {
    // Enable input after AI typing animation completes
    setIsAITyping(false);
    setAwaitingInput(true);
  };

  if (isSubmitting) {
    return <DynamicLoadingScreen onComplete={() => {
      // This will be called when the loading animation completes
      // The actual onComplete will be handled by the parent component
    }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 py-4 px-4">
      <div className="max-w-6xl mx-auto h-[calc(100vh-2rem)]">
        {/* Header */}
        <div className="mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-poppins font-bold text-foreground flex items-center justify-center">
              Welcome to SkillSync
              <Sparkles className="w-7 h-7 text-accent ml-3 animate-pulse" />
            </h1>
            <p className="text-muted-foreground font-inter mt-2 text-lg">
              Let's have a conversation to personalize your learning experience
            </p>
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="h-[calc(100vh-8rem)]">
          <Card className="h-full bg-card/95 backdrop-blur-sm border-border/50 shadow-elegant">
            <AIConversationInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              onSelectOption={handleSelectOption}
              onOtherSelected={handleOtherSelected}
              isAITyping={isAITyping}
              currentInput={currentInput}
              setCurrentInput={setCurrentInput}
              onTypingComplete={handleTypingComplete}
              expectsInput={!isComplete && awaitingInput && (
                conversationManager.getCurrentStep()?.expectsInput !== false || 
                (conversationManager.getCurrentStep()?.enableTextInputOnOther && isOtherSelected)
              )}
              placeholder={
                isComplete 
                  ? "Conversation complete! Generating your roadmap..." 
                  : isAITyping 
                    ? "Wait for SkillSync to respond..." 
                    : !awaitingInput
                      ? "Please wait for the AI to finish..."
                      : isOtherSelected && conversationManager.getCurrentStep()?.placeholder
                        ? conversationManager.getCurrentStep()?.placeholder
                        : conversationManager.getCurrentPlaceholder()
              }
            />
          </Card>
        </div>

        {/* Fun Facts Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground font-inter">
            💡 Fun fact: Our AI analyzes thousands of career paths to create your perfect learning journey
          </p>
        </div>
      </div>
    </div>
  );
}