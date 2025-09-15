"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  Settings,
  Users,
  Shield,
  DollarSign,
  BookOpen,
  Activity,
  Clock,
  Filter,
  MoreHorizontal,
  ExternalLink
} from "lucide-react";

interface Notification {
  id: string;
  type: 'security' | 'financial' | 'content' | 'user' | 'system' | 'admin';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
  actions?: Array<{
    label: string;
    variant: 'default' | 'destructive' | 'outline';
  }>;
}

const NotificationsPanel = () => {
  // Mock data
  const notifications: Notification[] = [
    {
      id: "1",
      type: "security",
      severity: "high",
      title: "Multiple failed login attempts",
      message: "User account john.doe@example.com has 5 failed login attempts from IP 192.168.1.100",
      timestamp: "2024-03-15T14:30:22Z",
      read: false,
      actionRequired: true,
      actions: [
        { label: "Block IP", variant: "destructive" },
        { label: "Investigate", variant: "outline" }
      ]
    },
    {
      id: "2",
      type: "financial",
      severity: "medium",
      title: "Payout processing required",
      message: "15 instructor payouts totaling $12,450 are pending approval for this week",
      timestamp: "2024-03-15T12:15:30Z",
      read: false,
      actionRequired: true,
      actions: [
        { label: "Review Payouts", variant: "default" },
        { label: "Approve All", variant: "outline" }
      ]
    },
    {
      id: "3",
      type: "content",
      severity: "high",
      title: "Course content flagged",
      message: "Course 'Advanced Python Programming' has been reported for inappropriate content",
      timestamp: "2024-03-15T11:45:15Z",
      read: false,
      actionRequired: true,
      actions: [
        { label: "Review Content", variant: "default" },
        { label: "Contact Instructor", variant: "outline" }
      ]
    },
    {
      id: "4",
      type: "user",
      severity: "low",
      title: "New instructor application",
      message: "Sarah Wilson has applied to become an instructor with 3 course proposals",
      timestamp: "2024-03-15T10:20:45Z",
      read: true,
      actionRequired: true,
      actions: [
        { label: "Review Application", variant: "default" }
      ]
    },
    {
      id: "5",
      type: "system",
      severity: "critical",
      title: "Database performance alert",
      message: "Database response time has increased by 45% over the last hour",
      timestamp: "2024-03-15T09:30:12Z",
      read: false,
      actionRequired: true,
      actions: [
        { label: "Check Logs", variant: "destructive" },
        { label: "Scale Resources", variant: "outline" }
      ]
    },
    {
      id: "6",
      type: "admin",
      severity: "medium",
      title: "Weekly analytics report ready",
      message: "Your weekly platform analytics report for March 8-14 is now available",
      timestamp: "2024-03-15T08:00:00Z",
      read: true,
      actionRequired: false,
      actions: [
        { label: "View Report", variant: "outline" }
      ]
    },
    {
      id: "7",
      type: "financial",
      severity: "low",
      title: "Revenue milestone reached",
      message: "Platform has reached $250,000 in total revenue this month",
      timestamp: "2024-03-14T16:45:30Z",
      read: true,
      actionRequired: false
    },
    {
      id: "8",
      type: "content",
      severity: "medium",
      title: "Course approval pending",
      message: "5 new courses are waiting for content review and approval",
      timestamp: "2024-03-14T14:20:15Z",
      read: false,
      actionRequired: true,
      actions: [
        { label: "Review Courses", variant: "default" }
      ]
    }
  ];

  const notificationStats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    actionRequired: notifications.filter(n => n.actionRequired).length,
    critical: notifications.filter(n => n.severity === 'critical').length,
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return Shield;
      case 'financial': return DollarSign;
      case 'content': return BookOpen;
      case 'user': return Users;
      case 'system': return Activity;
      case 'admin': return Settings;
      default: return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'security': return 'text-red-600 bg-red-100';
      case 'financial': return 'text-green-600 bg-green-100';
      case 'content': return 'text-blue-600 bg-blue-100';
      case 'user': return 'text-purple-600 bg-purple-100';
      case 'system': return 'text-orange-600 bg-orange-100';
      case 'admin': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
      case 'high': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      case 'low': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filterNotifications = (filter: string) => {
    switch (filter) {
      case 'unread': return notifications.filter(n => !n.read);
      case 'action-required': return notifications.filter(n => n.actionRequired);
      case 'critical': return notifications.filter(n => n.severity === 'critical');
      default: return notifications;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-poppins font-bold mb-2 gradient-text">Notifications Center</h2>
          <p className="text-muted-foreground font-inter">
            Real-time alerts and system notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Notification Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{notificationStats.unread}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Required</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{notificationStats.actionRequired}</div>
            <p className="text-xs text-muted-foreground">
              Need immediate response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{notificationStats.critical}</div>
            <p className="text-xs text-muted-foreground">
              High priority issues
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Notifications
              </CardTitle>
              <CardDescription>
                Latest alerts and system notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">Unread</TabsTrigger>
                  <TabsTrigger value="action-required">Action Required</TabsTrigger>
                  <TabsTrigger value="critical">Critical</TabsTrigger>
                </TabsList>
                
                {(['all', 'unread', 'action-required', 'critical'] as const).map((filter) => (
                  <TabsContent key={filter} value={filter}>
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="space-y-4">
                        {filterNotifications(filter).map((notification) => {
                          const IconComponent = getTypeIcon(notification.type);
                          return (
                            <div 
                              key={notification.id} 
                              className={`border-l-4 p-4 rounded-lg ${getSeverityColor(notification.severity)} ${!notification.read ? 'ring-2 ring-primary/20' : ''}`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1 rounded-full ${getTypeColor(notification.type)}`}>
                                    <IconComponent className="h-3 w-3" />
                                  </div>
                                  <h3 className="font-medium text-sm">{notification.title}</h3>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className={getSeverityBadge(notification.severity)}>
                                    {notification.severity}
                                  </Badge>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                
                                {notification.actions && (
                                  <div className="flex items-center gap-2">
                                    {notification.actions.map((action, index) => (
                                      <Button 
                                        key={index}
                                        size="sm" 
                                        variant={action.variant}
                                      >
                                        {action.label}
                                      </Button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              {notification.actionRequired && (
                                <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-950/20 rounded border border-orange-200 dark:border-orange-800">
                                  <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
                                    <AlertTriangle className="h-4 w-4" />
                                    Action required - Please respond to this notification
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common notification actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark All as Read
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <X className="h-4 w-4 mr-2" />
                Clear Resolved
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Create Filter
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Export Notifications
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
              <CardDescription>
                Categories and their status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { type: 'security', label: 'Security Alerts', count: 2, enabled: true },
                { type: 'financial', label: 'Financial Updates', count: 3, enabled: true },
                { type: 'content', label: 'Content Reviews', count: 2, enabled: true },
                { type: 'user', label: 'User Management', count: 1, enabled: true },
                { type: 'system', label: 'System Health', count: 1, enabled: true },
                { type: 'admin', label: 'Admin Reports', count: 1, enabled: false },
              ].map((category) => {
                const IconComponent = getTypeIcon(category.type);
                return (
                  <div key={category.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-full ${getTypeColor(category.type)}`}>
                        <IconComponent className="h-3 w-3" />
                      </div>
                      <span className="text-sm font-medium">{category.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{category.count}</Badge>
                      <div className={`w-2 h-2 rounded-full ${category.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
              <CardDescription>
                Last 24 hours overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Security Events</span>
                  <span className="font-medium text-red-600">2 High</span>
                </div>
                <div className="flex justify-between">
                  <span>Financial Alerts</span>
                  <span className="font-medium text-yellow-600">3 Medium</span>
                </div>
                <div className="flex justify-between">
                  <span>Content Reviews</span>
                  <span className="font-medium text-blue-600">2 Pending</span>
                </div>
                <div className="flex justify-between">
                  <span>System Health</span>
                  <span className="font-medium text-orange-600">1 Critical</span>
                </div>
                <div className="flex justify-between">
                  <span>User Actions</span>
                  <span className="font-medium text-green-600">1 Low</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
