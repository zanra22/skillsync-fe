"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  BookOpen, 
  Shield, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Settings,
  Bell,
  Download,
  Filter,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import AdminSidebar from "@/components/admin/AdminSidebar";
import SystemOverview from "@/components/admin/SystemOverview";
import UserManagement from "@/components/admin/UserManagement";
import ContentManagement from "@/components/admin/ContentManagement";
import SecurityDashboard from "@/components/admin/SecurityDashboard";
import FinancialDashboard from "@/components/admin/FinancialDashboard";
import NotificationsPanel from "@/components/admin/NotificationsPanel";
import { withAdminAuth, useAuth } from "@/context/AuthContext";

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="border-b border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between p-6">
              <div>
                <h1 className="text-3xl font-poppins font-bold text-foreground gradient-text">
                  Super Admin Dashboard
                </h1>
                <p className="text-muted-foreground font-inter">
                  Welcome, {user?.firstName} - Manage and monitor your SkillSync platform
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" className="font-inter transition-all duration-300 hover:bg-accent-light/10 hover:border-accent/50">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline" size="sm" className="font-inter transition-all duration-300 hover:bg-accent-light/10 hover:border-accent/50">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" size="sm" className="font-inter transition-all duration-300 hover:bg-accent-light/10 hover:border-accent/50">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={logout}
                  className="font-inter hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950 dark:hover:border-red-800"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="overview">
                  <SystemOverview />
                </TabsContent>
                
                <TabsContent value="users">
                  <UserManagement />
                </TabsContent>
                
                <TabsContent value="content">
                  <ContentManagement />
                </TabsContent>
                
                <TabsContent value="security">
                  <SecurityDashboard />
                </TabsContent>
                
                <TabsContent value="financial">
                  <FinancialDashboard />
                </TabsContent>
                
                <TabsContent value="notifications">
                  <NotificationsPanel />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;