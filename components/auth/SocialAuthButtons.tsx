"use client";
import { Button } from "@/components/ui/button";
import { Github, Chrome } from "lucide-react";

interface SocialAuthButtonsProps {
  onSocialAuth: (provider: "google" | "github") => void;
  disabled?: boolean;
}

export default function SocialAuthButtons({ onSocialAuth, disabled = false }: SocialAuthButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button 
        variant="outline" 
        className="w-full border-border hover:bg-accent/10 hover:border-accent/30 transition-all duration-300"
        onClick={() => onSocialAuth("github")}
        disabled={disabled}
      >
        <Github className="mr-2 h-4 w-4" />
        GitHub
      </Button>
      <Button 
        variant="outline" 
        className="w-full border-border hover:bg-accent/10 hover:border-accent/30 transition-all duration-300"
        onClick={() => onSocialAuth("google")}
        disabled={disabled}
      >
        <Chrome className="mr-2 h-4 w-4" />
        Google
      </Button>
    </div>
  );
}
