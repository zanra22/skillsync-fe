"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  Crown,
  Eye,
  Mail,
  Calendar,
  TrendingUp,
  BookOpen,
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { lazy, Suspense } from "react";

// Lazy load Recharts components
const AreaChart = lazy(() => import('recharts').then(module => ({ default: module.AreaChart })));
const LineChart = lazy(() => import('recharts').then(module => ({ default: module.LineChart })));
const PieChart = lazy(() => import('recharts').then(module => ({ default: module.PieChart })));
const Area = lazy(() => import('recharts').then(module => ({ default: module.Area })));
const Line = lazy(() => import('recharts').then(module => ({ default: module.Line })));
const Pie = lazy(() => import('recharts').then(module => ({ default: module.Pie })));
const Cell = lazy(() => import('recharts').then(module => ({ default: module.Cell })));
const ResponsiveContainer = lazy(() => import('recharts').then(module => ({ default: module.ResponsiveContainer })));

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Smooth tab transition handler
  const handleTabChange = (value: string) => {
    if (value !== activeTab) {
      setIsTransitioning(true);
      setIsLoading(true);
      setTimeout(() => {
        setActiveTab(value);
        setTimeout(() => {
          setIsTransitioning(false);
          setIsLoading(false);
        }, 100);
      }, 150);
    }
  };

  // Enhanced data for meaningful visualizations
  const userMetrics = {
    totalUsers: 12847,
    activeUsers: 11234,
    instructors: 1547,
    studentsThisMonth: 892,
    verificationRate: 87.4,
    growthMetrics: {
      users: { value: 12.3, trend: "up" },
      instructors: { value: 8.7, trend: "up" },
      verification: { value: 5.2, trend: "up" },
      engagement: { value: 15.8, trend: "up" }
    }
  };

  // Growth over time data for area chart (Total Users)
  const monthlyGrowthData = [
    { month: "Jan", users: 8200 },
    { month: "Feb", users: 8950 },
    { month: "Mar", users: 9740 },
    { month: "Apr", users: 10320 },
    { month: "May", users: 11100 },
    { month: "Jun", users: 11850 },
    { month: "Jul", users: 12400 },
    { month: "Aug", users: 12847 }
  ];

  // Daily activity data for line chart (Active Users)
  const dailyActivityData = [
    { day: "Mon", active: 8900 },
    { day: "Tue", active: 9200 },
    { day: "Wed", active: 9800 },
    { day: "Thu", active: 10300 },
    { day: "Fri", active: 11234 },
    { day: "Sat", active: 9800 },
    { day: "Sun", active: 9100 }
  ];

  // Registration sparkline data (New Registrations)
  const registrationSparkData = [22, 28, 19, 34, 25, 31, 42, 38, 29, 45, 52, 48, 35, 41];

  // Mock data for enhanced user directory
  const recentUsers = [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "Student",
      status: "Active",
      joinDate: "2024-03-15",
      courses: 3,
      avatar: "/api/placeholder/32/32"
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob@example.com",
      role: "Instructor",
      status: "Pending",
      joinDate: "2024-03-14",
      courses: 12,
      avatar: "/api/placeholder/32/32"
    },
    {
      id: 3,
      name: "Carol Davis",
      email: "carol@example.com",
      role: "Student",
      status: "Active",
      joinDate: "2024-03-13",
      courses: 7,
      avatar: "/api/placeholder/32/32"
    },
    {
      id: 4,
      name: "David Wilson",
      email: "david@example.com",
      role: "Moderator",
      status: "Active",
      joinDate: "2024-03-12",
      courses: 0,
      avatar: "/api/placeholder/32/32"
    },
  ];

  const pendingActions = [
    { type: "Instructor Application", user: "Sarah Connor", action: "Review profile and credentials" },
    { type: "Account Verification", user: "John Doe", action: "Manual verification required" },
    { type: "Role Change Request", user: "Mike Johnson", action: "Student → Instructor upgrade" },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Instructor": return "bg-blue-100 text-blue-700";
      case "Moderator": return "bg-purple-100 text-purple-700";
      case "Admin": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-700";
      case "Pending": return "bg-yellow-100 text-yellow-700";
      case "Suspended": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-poppins font-bold mb-2 gradient-text">User Management</h2>
        <p className="text-muted-foreground font-inter">
          Manage users, roles, and account statuses across your platform
        </p>
      </div>

      {/* Enhanced User Statistics - System Overview Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift transition-all duration-300 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-inter">Total Users</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-poppins font-bold">{userMetrics.totalUsers.toLocaleString()}</div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{userMetrics.growthMetrics.users.value}%
              </div>
              <div className="text-xs text-muted-foreground">vs last month</div>
            </div>
            {/* Area chart showing user growth over time */}
            <div className="mt-3 h-16">
              <Suspense fallback={<div className="h-16 bg-muted/20 rounded animate-pulse" />}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyGrowthData}>
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#3B82F6" 
                      fill="url(#blueGradient)" 
                      strokeWidth={2}
                      dot={false}
                    />
                    <defs>
                      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </Suspense>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-all duration-300 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-inter">Active Users</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <UserCheck className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-poppins font-bold">{userMetrics.activeUsers.toLocaleString()}</div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{userMetrics.growthMetrics.engagement.value}%
              </div>
              <div className="text-xs text-muted-foreground">{userMetrics.verificationRate}% verified</div>
            </div>
            {/* Line chart showing daily activity trends */}
            <div className="mt-3 h-16">
              <Suspense fallback={<div className="h-16 bg-muted/20 rounded animate-pulse" />}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyActivityData}>
                    <Line 
                      type="monotone" 
                      dataKey="active" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={{ fill: "#10B981", strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 4, stroke: "#10B981", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Suspense>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-all duration-300 border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-inter">Instructors</CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Crown className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-poppins font-bold">{userMetrics.instructors.toLocaleString()}</div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{userMetrics.growthMetrics.instructors.value}%
              </div>
              <div className="text-xs text-muted-foreground">teaching now</div>
            </div>
            {/* Instructor growth indicator */}
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000"
                style={{ width: `${(userMetrics.instructors / userMetrics.totalUsers) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-all duration-300 border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-inter">New Registrations</CardTitle>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <Calendar className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-poppins font-bold">127</div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +23.1%
              </div>
              <div className="text-xs text-muted-foreground">this week</div>
            </div>
            {/* Sparkline chart showing registration trends */}
            <div className="mt-3 h-16">
              <Suspense fallback={<div className="h-16 bg-muted/20 rounded animate-pulse" />}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={registrationSparkData.map((value, index) => ({ day: index, registrations: value }))}>
                    <Line 
                      type="monotone" 
                      dataKey="registrations" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 3, stroke: "#F59E0B", strokeWidth: 1 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Suspense>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced User Directory */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-poppins">
                    <Users className="h-5 w-5 text-accent" />
                    User Directory
                  </CardTitle>
                  <CardDescription className="font-inter">
                    Search and manage platform users across all roles
                  </CardDescription>
                </div>
                <Button className="btn-accent">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Bulk Actions
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Enhanced Search and Filters */}
              <div className="flex flex-col gap-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or role..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>

                {/* Enhanced Tab Navigation */}
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <div className="relative">
                    <TabsList className="grid w-full grid-cols-4 bg-slate-900/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-1 shadow-lg shadow-cyan-500/10 transition-all duration-200 hover:shadow-cyan-500/20">
                      <TabsTrigger 
                        value="all" 
                        className="flex items-center gap-2 font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-violet-500/20 data-[state=active]:border data-[state=active]:border-cyan-400/30 data-[state=active]:text-cyan-300 data-[state=active]:shadow-md data-[state=active]:transform data-[state=active]:scale-[1.02] hover:bg-slate-800/50 hover:text-cyan-200 rounded-lg"
                        disabled={isTransitioning}
                      >
                        {isLoading && activeTab === 'all' ? (
                          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Users className="h-4 w-4" />
                        )}
                        All Users
                      </TabsTrigger>
                      <TabsTrigger 
                        value="students" 
                        className="flex items-center gap-2 font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:border data-[state=active]:border-emerald-400/30 data-[state=active]:text-emerald-300 data-[state=active]:shadow-md data-[state=active]:transform data-[state=active]:scale-[1.02] hover:bg-slate-800/50 hover:text-emerald-200 rounded-lg"
                        disabled={isTransitioning}
                      >
                        {isLoading && activeTab === 'students' ? (
                          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <BookOpen className="h-4 w-4" />
                        )}
                        Students
                      </TabsTrigger>
                      <TabsTrigger 
                        value="instructors" 
                        className="flex items-center gap-2 font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-amber-500/20 data-[state=active]:border data-[state=active]:border-violet-400/30 data-[state=active]:text-violet-300 data-[state=active]:shadow-md data-[state=active]:transform data-[state=active]:scale-[1.02] hover:bg-slate-800/50 hover:text-violet-200 rounded-lg"
                        disabled={isTransitioning}
                      >
                        {isLoading && activeTab === 'instructors' ? (
                          <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Crown className="h-4 w-4" />
                        )}
                        Instructors
                      </TabsTrigger>
                      <TabsTrigger 
                        value="pending" 
                        className="flex items-center gap-2 font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-orange-500/20 data-[state=active]:border data-[state=active]:border-amber-400/30 data-[state=active]:text-amber-300 data-[state=active]:shadow-md data-[state=active]:transform data-[state=active]:scale-[1.02] hover:bg-slate-800/50 hover:text-amber-200 rounded-lg"
                        disabled={isTransitioning}
                      >
                        {isLoading && activeTab === 'pending' ? (
                          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                        Pending
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Tab Contents */}
                  <TabsContent 
                    value="all" 
                    className={`space-y-4 mt-6 transition-all duration-300 ${
                      isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                    }`}
                  >
                    <div className="space-y-4">
                      {recentUsers.map((user, index) => (
                        <div 
                          key={user.id} 
                          className="group relative overflow-hidden bg-gradient-to-r from-card to-card/50 border border-border rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:border-accent/30 animate-in fade-in-0 slide-in-from-bottom-4"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-lg shadow-md">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                                <Badge variant="secondary" className={getRoleColor(user.role)}>
                                  {user.role}
                                </Badge>
                                <Badge variant="secondary" className={getStatusColor(user.status)}>
                                  {user.status}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                              
                              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Joined {user.joinDate}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  <span>{user.courses} courses</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3 text-green-500" />
                                  <span>Active</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Shield className="h-4 w-4 mr-2" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <UserX className="h-4 w-4 mr-2" />
                                Suspend User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent 
                    value="students" 
                    className={`space-y-4 mt-6 transition-all duration-300 ${
                      isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                    }`}
                  >
                    <div className="space-y-4">
                      {recentUsers.filter(user => user.role === 'Student').map((user, index) => (
                        <div 
                          key={user.id} 
                          className="group relative overflow-hidden bg-gradient-to-r from-card to-card/50 border border-border rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:border-accent/30 animate-in fade-in-0 slide-in-from-bottom-4"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-lg shadow-md">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  {user.role}
                                </Badge>
                                <Badge variant="secondary" className={getStatusColor(user.status)}>
                                  {user.status}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                              
                              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Joined {user.joinDate}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  <span>{user.courses} courses enrolled</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BookOpen className="h-4 w-4 mr-2" />
                                View Courses
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent 
                    value="instructors" 
                    className={`space-y-4 mt-6 transition-all duration-300 ${
                      isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                    }`}
                  >
                    <div className="space-y-4">
                      {recentUsers.filter(user => user.role === 'Instructor').map((user, index) => (
                        <div 
                          key={user.id} 
                          className="group relative overflow-hidden bg-gradient-to-r from-card to-card/50 border border-border rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:border-accent/30 animate-in fade-in-0 slide-in-from-bottom-4"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-medium text-lg shadow-md">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                  <Crown className="h-3 w-3 mr-1" />
                                  {user.role}
                                </Badge>
                                <Badge variant="secondary" className={getStatusColor(user.status)}>
                                  {user.status}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                              
                              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Joined {user.joinDate}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  <span>{user.courses} courses teaching</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Crown className="h-4 w-4 mr-2" />
                                Manage Courses
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent 
                    value="pending" 
                    className={`space-y-4 mt-6 transition-all duration-300 ${
                      isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                    }`}
                  >
                    <div className="space-y-4">
                      {recentUsers.filter(user => user.status === 'Pending').map((user, index) => (
                        <div 
                          key={user.id} 
                          className="group relative overflow-hidden bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4 hover:shadow-md transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-full flex items-center justify-center text-white font-medium text-lg shadow-md">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                                <Badge variant="secondary" className={getRoleColor(user.role)}>
                                  {user.role}
                                </Badge>
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending Approval
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                              
                              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Applied {user.joinDate}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                              <UserCheck className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                              <UserX className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing 1-10 of 247 users
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Previous</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
            <CardDescription>
              User requests requiring admin approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingActions.map((action, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{action.type}</Badge>
                  <Button size="sm" variant="outline">
                    Review
                  </Button>
                </div>
                <p className="font-medium text-sm">{action.user}</p>
                <p className="text-xs text-muted-foreground">{action.action}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;
