"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles } from 'lucide-react';
import TypingAnimation from './TypingAnimation';

export interface ChatMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  options?: string[]; // For multiple choice responses
  expectsInput?: boolean; // If AI is waiting for user input
  showTypingAnimation?: boolean; // Whether to show typing animation for this message
}

interface AIConversationInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onSelectOption: (option: string) => void;
  isAITyping: boolean;
  currentInput: string;
  setCurrentInput: (input: string) => void;
  placeholder?: string;
  onTypingComplete?: (messageId: string) => void;
}

export default function AIConversationInterface({
  messages,
  onSendMessage,
  onSelectOption,
  isAITyping,
  currentInput,
  setCurrentInput,
  placeholder = "Type your response...",
  onTypingComplete
}: AIConversationInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [typingMessages, setTypingMessages] = useState<Set<string>>(new Set());

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAITyping]);

  // Auto-focus input when AI finishes typing and expects input
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const aiJustFinishedTyping = lastMessage && 
                                lastMessage.type === 'ai' && 
                                !lastMessage.isTyping && 
                                lastMessage.expectsInput &&
                                !isAITyping &&
                                !messages.some(m => m.type === 'ai' && m.showTypingAnimation && !typingMessages.has(m.id));
    
    if (aiJustFinishedTyping && inputRef.current) {
      // Add a small delay to ensure rendering is complete
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isAITyping, typingMessages]);

  // Focus input when typing completes
  useEffect(() => {
    if (!isAITyping && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.type === 'ai' && lastMessage?.expectsInput) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 200);
      }
    }
  }, [isAITyping, messages]);

  // Handle typing indicator
  useEffect(() => {
    const timer = setTimeout(() => setIsUserTyping(false), 1000);
    return () => clearTimeout(timer);
  }, [currentInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentInput(e.target.value);
    setIsUserTyping(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput.trim()) {
      onSendMessage(currentInput.trim());
      setCurrentInput('');
      setIsUserTyping(false);
    }
  };

  // Track thinking state with minimum display time
  const [isShowingThinking, setIsShowingThinking] = useState(false);
  const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Effect to manage thinking state with minimum display time
  useEffect(() => {
    const hasActiveTyping = messages.some(m => m.type === 'ai' && m.showTypingAnimation && !typingMessages.has(m.id));
    const hasTypingIndicator = messages.some(m => m.type === 'ai' && m.isTyping);
    const shouldShowThinking = isAITyping || hasActiveTyping || hasTypingIndicator;
    
    if (shouldShowThinking && !isShowingThinking) {
      // Start showing thinking immediately
      setIsShowingThinking(true);
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
        thinkingTimerRef.current = null;
      }
    } else if (!shouldShowThinking && isShowingThinking) {
      // For typing indicators, hide immediately when they disappear
      // For typing animations, add a small delay to see the completion
      const delay = hasTypingIndicator ? 0 : 500; // Reduced from 1500ms to 500ms
      
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
      }
      thinkingTimerRef.current = setTimeout(() => {
        setIsShowingThinking(false);
        thinkingTimerRef.current = null;
      }, delay);
    }
    
    // Cleanup function
    return () => {
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
        thinkingTimerRef.current = null;
      }
    };
  }, [isAITyping, messages, typingMessages, isShowingThinking]); // Removed thinkingTimer from dependencies

  const renderMessage = (message: ChatMessage) => {
    if (message.type === 'ai') {
      // Reduced debug logging - only log when important events happen
      const willShowAnimation = message.showTypingAnimation && !typingMessages.has(message.id);
      if (willShowAnimation || typingMessages.has(message.id)) {
        console.log('🤖 AI message:', {
          id: message.id.slice(-6), // Show only last 6 chars
          status: willShowAnimation ? 'typing' : 'completed',
          length: message.content.length
        });
      }
      
      return (
        <div key={message.id} className="flex justify-start animate-fade-in">
          {/* AI Message Bubble */}
          <div className="max-w-2xl">
            <div className="bg-muted border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              {message.isTyping ? (
                // Show typing dots for typing indicator
                <div className="flex space-x-1 items-center py-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              ) : message.showTypingAnimation && !typingMessages.has(message.id) ? (
                <TypingAnimation
                  text={message.content}
                  speed={15}
                  className="text-foreground font-inter leading-relaxed"
                  onComplete={() => {
                    console.log('🎯 Typing completed for message:', message.id);
                    setTypingMessages(prev => new Set(prev).add(message.id));
                    // Turn off typing animation for this message to prevent re-triggering
                    if (onTypingComplete) {
                      onTypingComplete(message.id);
                    }
                  }}
                />
              ) : (
                <p className="text-foreground font-inter leading-relaxed">
                  {message.content}
                </p>
              )}
            </div>
            
            <div className="mt-2 text-xs text-muted-foreground font-inter">
              Ollie • {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div key={message.id} className="flex justify-end animate-slide-in-right">
          {/* User Message Bubble */}
          <div className="max-w-xl">
            <div className="bg-accent text-accent-foreground rounded-2xl rounded-tr-md px-4 py-3 shadow-sm">
              <p className="font-inter leading-relaxed">
                {message.content}
              </p>
            </div>
            <div className="mt-2 text-xs text-muted-foreground font-inter text-right">
              You • {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Messages Area - Full Width with Bottom Padding for Owl */}
      <div className="flex-1 overflow-y-auto space-y-4 p-6 pb-64">
        {messages.map(renderMessage)}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Options Area - With Left Margin for Owl Clearance */}
      {messages.length > 0 && messages[messages.length - 1].options && messages[messages.length - 1].options!.length > 0 && 
       !isAITyping && 
       !messages.some(m => m.type === 'ai' && m.showTypingAnimation && !typingMessages.has(m.id)) &&
       !messages.some(m => m.type === 'ai' && m.isTyping) && (
        <div className="px-6 py-4 ml-52">
          <div className="flex flex-wrap gap-2">
            {messages[messages.length - 1].options!.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onSelectOption(option)}
                className="border-accent/30 text-accent hover:bg-accent hover:text-white transition-all duration-200 hover:scale-105 font-medium font-inter"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Owl Character - Bottom Left Corner */}
      <div className="absolute bottom-6 left-6 z-10">
        <div className="relative">
          {/* Owl Image - Reduced Size */}
          <div className="w-48 h-48 rounded-full bg-card shadow-elegant flex items-center justify-center overflow-hidden border-2 border-border relative hover:scale-105 transition-transform duration-300">
            <img
              src="/skillsync_owl.png"
              alt="SkillSync AI Assistant"
              className="w-40 h-40 object-contain"
              onError={(e) => {
                console.log('Image failed to load');
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div class="text-6xl">🦉</div>';
              }}
            />
            
            {/* Animated eyes when thinking */}
            {isAITyping && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-accent rounded-full animate-pulse mr-6 mt-3"></div>
                <div className="w-3 h-3 bg-accent rounded-full animate-pulse ml-6 mt-3"></div>
              </div>
            )}
          </div>
          
          {/* Speech Bubble Pointer - Pointing Up and Right */}
          {isShowingThinking && (
            <div className="absolute -top-4 right-8 w-0 h-0 border-b-[20px] border-b-card border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent drop-shadow-md animate-pulse"></div>
          )}
          
          {/* Owl Name & Status - Compact */}
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 text-center bg-card/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-border shadow-sm">
            <h3 className="text-lg font-bold text-primary font-poppins">Ollie</h3>
            <div className="flex items-center justify-center mt-1">
              <Sparkles className="w-3 h-3 text-accent mr-1" />
              <span className="text-accent text-xs font-inter font-medium">
                {isShowingThinking ? 'Thinking...' : 'Ready!'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Input Area - Full Width at Bottom with Owl Clearance */}
      <div className="bg-card/80 backdrop-blur-sm border-t border-border p-6 shadow-soft w-full ml-0">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3 max-w-none">
          <div className="flex-1 relative ml-48">
            <Input
              ref={inputRef}
              value={currentInput}
              onChange={handleInputChange}
              placeholder={isAITyping ? "Ollie is thinking..." : placeholder}
              className="w-full pr-12 bg-input border-border focus:border-accent/50 focus:ring-2 focus:ring-accent/20 font-inter rounded-xl disabled:bg-muted disabled:cursor-not-allowed text-base py-3"
              disabled={isAITyping || typingMessages.size < messages.filter(m => m.type === 'ai' && m.showTypingAnimation).length}
              autoFocus={false} // We'll handle focus manually
            />
            {isUserTyping && !isAITyping && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>
          <Button 
            type="submit" 
            size="default"
            disabled={!currentInput.trim() || isAITyping || typingMessages.size < messages.filter(m => m.type === 'ai' && m.showTypingAnimation).length}
            className="bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-xl font-medium font-inter px-6"
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}