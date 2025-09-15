"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard,
  Users, 
  BookOpen, 
  Shield, 
  DollarSign,
  Bell,
  Settings,
  LogOut,
  Activity
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const menuItems = [
    {
      id: "overview",
      label: "System Overview",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "users",
      label: "User Management",
      icon: Users,
      badge: "1.2k",
    },
    {
      id: "content",
      label: "Content Management",
      icon: BookOpen,
      badge: "3",
    },
    {
      id: "security",
      label: "Security Center",
      icon: Shield,
      badge: "2",
    },
    {
      id: "financial",
      label: "Financial Dashboard",
      icon: DollarSign,
      badge: null,
    },
    {
      id: "notifications",
      label: "Notifications Center",
      icon: Bell,
      badge: "8",
    },
  ];

  return (
    <div className="w-64 bg-card border-r border-border h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center glow-accent">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="font-poppins font-bold text-lg gradient-text-neural">SkillSync</h2>
            <p className="text-xs text-muted-foreground font-inter">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-auto p-3 font-inter transition-all duration-300 hover:bg-accent-light/10",
                isActive && "bg-gradient-accent text-white shadow-soft hover:bg-gradient-accent/90"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className={cn(
                  "text-xs font-inter",
                  isActive ? "bg-white/20 text-white border-white/30" : "bg-accent-light/20 text-accent border-accent/30"
                )}>
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border space-y-2">
        <Button variant="ghost" className="w-full justify-start gap-3 font-inter transition-all duration-300 hover:bg-accent-light/10">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 font-inter text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
