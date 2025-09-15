"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Lock,
  Smartphone,
  Globe,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Ban
} from "lucide-react";

const SecurityDashboard = () => {
  // Mock data
  const securityStats = {
    totalDevices: 15847,
    trustedDevices: 12340,
    otpUsage: 89.5,
    securityIncidents: 12,
  };

  const securityAlerts = [
    {
      id: 1,
      type: "Suspicious Login",
      severity: "High",
      description: "Multiple failed login attempts from unknown IP",
      ip: "192.168.1.100",
      user: "john.doe@example.com",
      timestamp: "2024-03-15 14:30:22",
      status: "Active",
    },
    {
      id: 2,
      type: "Rate Limit Exceeded",
      severity: "Medium",
      description: "API rate limit exceeded for user account",
      ip: "10.0.0.50",
      user: "api_user_001",
      timestamp: "2024-03-15 13:45:10",
      status: "Investigating",
    },
    {
      id: 3,
      type: "Unusual Device Access",
      severity: "Low",
      description: "Login from new device without 2FA",
      ip: "203.0.113.12",
      user: "sarah.wilson@example.com",
      timestamp: "2024-03-15 12:15:33",
      status: "Resolved",
    },
  ];

  const authMetrics = [
    { label: "Total Login Attempts", value: "45,232", change: "+5.2%", trend: "up" },
    { label: "Successful Logins", value: "42,890", change: "+4.8%", trend: "up" },
    { label: "Failed Attempts", value: "2,342", change: "-12.1%", trend: "down" },
    { label: "2FA Enabled Users", value: "11,234", change: "+18.3%", trend: "up" },
  ];

  const deviceStats = [
    { type: "Desktop", count: 8920, percentage: 56.3 },
    { type: "Mobile", count: 5240, percentage: 33.1 },
    { type: "Tablet", count: 1687, percentage: 10.6 },
  ];

  const recentBlocks = [
    { ip: "192.168.1.100", reason: "Brute force attack", timestamp: "2024-03-15 14:30", duration: "24h" },
    { ip: "10.0.0.25", reason: "Spam activity", timestamp: "2024-03-15 12:15", duration: "12h" },
    { ip: "203.0.113.50", reason: "Suspicious behavior", timestamp: "2024-03-15 09:30", duration: "6h" },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High": return "bg-red-100 text-red-700 border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-red-100 text-red-700";
      case "Investigating": return "bg-yellow-100 text-yellow-700";
      case "Resolved": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-poppins font-bold mb-2 gradient-text">Security Center</h2>
        <p className="text-muted-foreground font-inter">
          Monitor security events, manage access controls, and protect your platform
        </p>
      </div>

      {/* Security Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.totalDevices.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Registered on platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trusted Devices</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.trustedDevices.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((securityStats.trustedDevices / securityStats.totalDevices) * 100).toFixed(1)}% trust rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">2FA Usage</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.otpUsage}%</div>
            <p className="text-xs text-muted-foreground">
              Of active users enabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.securityIncidents}</div>
            <p className="text-xs text-muted-foreground">
              In the last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Alerts */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Alerts
              </CardTitle>
              <CardDescription>
                Recent security events requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="alerts" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
                  <TabsTrigger value="auth">Auth Metrics</TabsTrigger>
                  <TabsTrigger value="devices">Device Analytics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="alerts" className="space-y-4">
                  {securityAlerts.map((alert) => (
                    <div key={alert.id} className={`p-4 border rounded-lg ${getSeverityColor(alert.severity)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          <h3 className="font-medium">{alert.type}</h3>
                          <Badge variant="secondary" className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <Badge variant="secondary" className={getStatusColor(alert.status)}>
                          {alert.status}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {alert.ip}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {alert.user}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {alert.timestamp}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Investigate
                        </Button>
                        <Button size="sm" variant="outline">
                          <Ban className="h-4 w-4 mr-2" />
                          Block IP
                        </Button>
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Resolve
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="auth" className="space-y-4">
                  {authMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{metric.label}</p>
                        <p className="text-2xl font-bold">{metric.value}</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        {metric.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={metric.trend === "up" ? "text-green-600" : "text-red-600"}>
                          {metric.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="devices" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {deviceStats.map((device, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Smartphone className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{device.type}</p>
                            <p className="text-sm text-muted-foreground">{device.count.toLocaleString()} devices</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{device.percentage}%</p>
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${device.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Security Actions Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Security Actions</CardTitle>
              <CardDescription>
                Quick access to security controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Ban className="h-4 w-4 mr-2" />
                Block IP Address
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Suspend User Account
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Lock className="h-4 w-4 mr-2" />
                Force 2FA Reset
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Generate Security Report
              </Button>
            </CardContent>
          </Card>

          {/* Recent Blocks */}
          <Card>
            <CardHeader>
              <CardTitle>Recent IP Blocks</CardTitle>
              <CardDescription>
                Recently blocked IP addresses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentBlocks.map((block, index) => (
                <div key={index} className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-mono text-sm">{block.ip}</p>
                    <Badge variant="destructive" className="text-xs">
                      {block.duration}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{block.reason}</p>
                  <p className="text-xs text-muted-foreground">{block.timestamp}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Security Score */}
          <Card>
            <CardHeader>
              <CardTitle>Security Score</CardTitle>
              <CardDescription>
                Overall platform security rating
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">95</div>
                <p className="text-sm text-muted-foreground mb-4">Excellent Security</p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: "95%" }} />
                </div>
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>2FA Adoption</span>
                  <span className="text-green-600">89.5%</span>
                </div>
                <div className="flex justify-between">
                  <span>Failed Login Rate</span>
                  <span className="text-green-600">5.2%</span>
                </div>
                <div className="flex justify-between">
                  <span>Security Incidents</span>
                  <span className="text-yellow-600">12 (Low)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
