"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  BookOpen, 
  Activity, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Server,
  Database,
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Eye,
  UserPlus,
  BookPlus,
  Zap,
  CalendarDays,
  Target
} from "lucide-react";
import {
  LineChart,
  AreaChart,
  BarChart,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  Area,
  Bar,
  Pie,
  Cell
} from 'recharts';

const SystemOverview = () => {
  // State for active analytics tab and time period
  const [activeTab, setActiveTab] = useState('user-growth');
  const [timePeriod, setTimePeriod] = useState('30d');
  const [loadedTabs, setLoadedTabs] = useState(new Set(['user-growth'])); // Track which tabs have been loaded
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle tab change and lazy loading with smooth transitions
  const handleTabChange = (value: string) => {
    if (value !== activeTab) {
      setIsTransitioning(true);
      setIsLoading(true);
      setTimeout(() => {
        setActiveTab(value);
        setLoadedTabs(prev => new Set(prev).add(value));
        setTimeout(() => {
          setIsTransitioning(false);
          setIsLoading(false);
        }, 100);
      }, 150);
    }
  };

  // Mock data - in real app, this would come from API
  const metrics = {
    totalUsers: 12847,
    activeUsers: 3421,
    totalCourses: 1547,
    totalRevenue: 284750,
    growthMetrics: {
      users: { value: 12.5, trend: "up" },
      courses: { value: 8.3, trend: "up" },
      revenue: { value: 15.7, trend: "up" },
      engagement: { value: -2.1, trend: "down" },
    },
    systemHealth: {
      serverStatus: "healthy",
      databaseStatus: "healthy",
      apiResponse: 145,
      uptime: 99.97,
    }
  };

  // Chart data for visualizations - Backend API would provide this structure
  const weeklyUserGrowth = [
    { day: "Mon", users: 450, active: 320, newSignups: 45, coursesCompleted: 23 },
    { day: "Tue", users: 520, active: 380, newSignups: 52, coursesCompleted: 31 },
    { day: "Wed", users: 480, active: 350, newSignups: 38, coursesCompleted: 28 },
    { day: "Thu", users: 600, active: 420, newSignups: 67, coursesCompleted: 42 },
    { day: "Fri", users: 680, active: 490, newSignups: 78, coursesCompleted: 55 },
    { day: "Sat", users: 380, active: 280, newSignups: 29, coursesCompleted: 18 },
    { day: "Sun", users: 290, active: 210, newSignups: 22, coursesCompleted: 15 },
  ];

  // Enhanced data for meaningful visualizations (same as UserManagement)
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

  const dailyActiveData = [
    { day: "Mon", active: 2890 },
    { day: "Tue", active: 3120 },
    { day: "Wed", active: 3380 },
    { day: "Thu", active: 3200 },
    { day: "Fri", active: 3421 },
    { day: "Sat", active: 2980 },
    { day: "Sun", active: 2650 }
  ];

  const courseCreationSparkData = [15, 18, 22, 19, 25, 31, 28, 34, 29, 38, 42, 35, 41, 47];

  const revenueGrowthData = [
    { month: "Jan", revenue: 186500 },
    { month: "Feb", revenue: 205200 },
    { month: "Mar", revenue: 224800 },
    { month: "Apr", revenue: 246300 },
    { month: "May", revenue: 268900 },
    { month: "Jun", revenue: 284750 }
  ];

  const monthlyRevenueData = [
    { month: "Jan", revenue: 18500, instructorPayouts: 12950, platformRevenue: 5550, activeUsers: 8420 },
    { month: "Feb", revenue: 22100, instructorPayouts: 15470, platformRevenue: 6630, activeUsers: 9200 },
    { month: "Mar", revenue: 25600, instructorPayouts: 17920, platformRevenue: 7680, activeUsers: 10100 },
    { month: "Apr", revenue: 28900, instructorPayouts: 20230, platformRevenue: 8670, activeUsers: 10800 },
    { month: "May", revenue: 31200, instructorPayouts: 21840, platformRevenue: 9360, activeUsers: 11500 },
    { month: "Jun", revenue: 34500, instructorPayouts: 24150, platformRevenue: 10350, activeUsers: 12200 },
  ];

  const courseEngagementData = [
    { category: "Technology", enrolled: 2845, completed: 1892, rating: 4.7, avgCompletion: 66.5 },
    { category: "Business", enrolled: 2120, completed: 1590, rating: 4.5, avgCompletion: 75.0 },
    { category: "Design", enrolled: 1876, completed: 1314, rating: 4.8, avgCompletion: 70.1 },
    { category: "Marketing", enrolled: 1654, completed: 1238, rating: 4.4, avgCompletion: 74.8 },
    { category: "Other", enrolled: 1432, completed: 1087, rating: 4.3, avgCompletion: 75.9 },
  ];

  const dailyActivityData = [
    { time: "00:00", users: 145, courses: 23, revenue: 340 },
    { time: "04:00", users: 89, courses: 12, revenue: 180 },
    { time: "08:00", users: 892, courses: 156, revenue: 2340 },
    { time: "12:00", users: 1240, courses: 234, revenue: 3890 },
    { time: "16:00", users: 1456, courses: 287, revenue: 4560 },
    { time: "20:00", users: 1120, courses: 198, revenue: 3210 },
  ];

  const geographicData = [
    { continent: 'North America', users: 45680, percentage: 42.5, countries: 3, growth: 12.3 },
    { continent: 'Europe', users: 38920, percentage: 36.2, countries: 8, growth: 8.7 },
    { continent: 'Asia Pacific', users: 15240, percentage: 14.2, countries: 6, growth: 24.1 },
    { continent: 'South America', users: 4850, percentage: 4.5, countries: 4, growth: 18.9 },
    { continent: 'Africa', users: 2180, percentage: 2.0, countries: 5, growth: 31.2 },
    { continent: 'Oceania', users: 640, percentage: 0.6, countries: 2, growth: 15.4 }
  ];

  const courseCategories = [
    { category: "Technology", count: 485, percentage: 31.4, color: "bg-blue-500" },
    { category: "Business", count: 320, percentage: 20.7, color: "bg-green-500" },
    { category: "Design", count: 287, percentage: 18.5, color: "bg-purple-500" },
    { category: "Marketing", count: 245, percentage: 15.8, color: "bg-orange-500" },
    { category: "Other", count: 210, percentage: 13.6, color: "bg-gray-500" },
  ];

  const quickActions = [
    { label: "Approve Pending Courses", count: 12, action: () => {}, icon: BookPlus, urgent: true },
    { label: "Review Reported Content", count: 5, action: () => {}, icon: AlertTriangle, urgent: true },
    { label: "Process Instructor Payouts", count: 23, action: () => {}, icon: DollarSign, urgent: false },
    { label: "Resolve Security Alerts", count: 2, action: () => {}, icon: AlertTriangle, urgent: true },
  ];

  // Chart components with animations
  const UserGrowthChart = () => (
    <div className="animate-in fade-in-50 duration-500">
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">User Growth Trend</h4>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={weeklyUserGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#6B7280' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#6B7280' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="#06B6D4" 
              strokeWidth={3}
              dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
              name="Total Users"
              animationDuration={1500}
            />
            <Line 
              type="monotone" 
              dataKey="active" 
              stroke="#F59E0B" 
              strokeWidth={2}
              dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
              name="Active Users"
              animationDuration={1500}
              animationBegin={300}
            />
            <Line 
              type="monotone" 
              dataKey="newSignups" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 3 }}
              name="New Signups"
              animationDuration={1500}
              animationBegin={600}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );

  const RevenueChart = () => (
    <div className="animate-in fade-in-50 duration-500">
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Revenue Analytics</h4>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={monthlyRevenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#6B7280' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#6B7280' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value) => [`$${value.toLocaleString()}`, '']}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stackId="1"
              stroke="#F59E0B" 
              fill="url(#revenueGradient)"
              name="Total Revenue"
              animationDuration={2000}
            />
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 animate-in slide-in-from-bottom-4 duration-700">
          <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">${monthlyRevenueData[monthlyRevenueData.length - 1]?.revenue.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Current Month</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">+{Math.round(((monthlyRevenueData[monthlyRevenueData.length - 1]?.revenue || 0) / (monthlyRevenueData[monthlyRevenueData.length - 2]?.revenue || 1) - 1) * 100)}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">${Math.round(monthlyRevenueData.reduce((sum, month) => sum + month.revenue, 0) / monthlyRevenueData.length).toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average Monthly</div>
          </div>
        </div>
      </Card>
    </div>
  );

  const CourseEngagementChart = () => (
    <div className="animate-in fade-in-50 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Course Engagement</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={courseEngagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="course" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#6B7280' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#6B7280' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Legend />
              <Bar 
                dataKey="enrolled" 
                fill="#06B6D4" 
                name="Enrolled"
                radius={[4, 4, 0, 0]}
                animationDuration={1200}
              />
              <Bar 
                dataKey="completed" 
                fill="#8B5CF6" 
                name="Completed"
                radius={[4, 4, 0, 0]}
                animationDuration={1200}
                animationBegin={400}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Daily Activity</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#6B7280' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#6B7280' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="activeUsers" 
                stroke="#06B6D4" 
                strokeWidth={3}
                dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                name="Active Users"
                animationDuration={1800}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );

  const GeographicChart = () => (
    <div className="animate-in fade-in-50 duration-500">
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Global Distribution by Region</h4>
        
        {/* Single responsive chart matching other chart sizes */}
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={geographicData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="continent"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#6B7280' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#6B7280' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value, name) => [
                `${value.toLocaleString()} users`,
                'Active Users'
              ]}
              labelFormatter={(label) => `Region: ${label}`}
            />
            <Bar 
              dataKey="users" 
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            >
              {geographicData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={['#06B6D4', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444', '#F97316'][index % 6]} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Enhanced Regional Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 animate-in slide-in-from-bottom-4 duration-700">
          {geographicData.map((region, index) => (
            <div 
              key={region.continent} 
              className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg hover:shadow-md transition-all duration-300 group"
            >
              <div 
                className="w-6 h-6 rounded-full mx-auto mb-2 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: ['#06B6D4', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444', '#F97316'][index % 6] }}
              />
              <div className="text-xs font-medium text-gray-900 dark:text-white truncate">{region.continent}</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{region.users.toLocaleString()}</div>
              <div className="text-xs text-gray-500">{region.percentage}%</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600">+{region.growth}%</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">{region.countries} countries</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // Remove the old getRegion function since we're using continents now

  // Loading component
  const ChartLoading = () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-poppins font-bold mb-2 gradient-text">System Overview</h2>
          <p className="text-muted-foreground font-inter">
            Real-time insights into your SkillSync platform performance
          </p>
        </div>
        {/* Compact System Health Indicator */}
        <div className="flex items-center gap-4 bg-card border rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">System Healthy</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {metrics.systemHealth.uptime}% uptime • {metrics.systemHealth.apiResponse}ms avg
          </div>
        </div>
      </div>

      {/* Key Metrics with Enhanced Visual Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift transition-all duration-300 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-inter">Total Users</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-poppins font-bold">{metrics.totalUsers.toLocaleString()}</div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{metrics.growthMetrics.users.value}%
              </div>
              <div className="text-xs text-muted-foreground">vs last month</div>
            </div>
            {/* Area chart showing user growth over time */}
            <div className="mt-3 h-16">
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
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-all duration-300 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-inter">Active Users</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Activity className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-poppins font-bold">{metrics.activeUsers.toLocaleString()}</div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{metrics.growthMetrics.engagement.value}%
              </div>
              <div className="text-xs text-muted-foreground">vs last week</div>
            </div>
            {/* Line chart showing daily activity trends */}
            <div className="mt-3 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyActiveData}>
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
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-all duration-300 border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-inter">Course Creation</CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <BookPlus className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-poppins font-bold">87</div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +18.5%
              </div>
              <div className="text-xs text-muted-foreground">new courses this month</div>
            </div>
            {/* Sparkline chart showing course creation trends */}
            <div className="mt-3 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={courseCreationSparkData.map((value, index) => ({ day: index, courses: value }))}>
                  <Line 
                    type="monotone" 
                    dataKey="courses" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 3, stroke: "#8B5CF6", strokeWidth: 1 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-all duration-300 border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-inter">Total Revenue</CardTitle>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <DollarSign className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-poppins font-bold">${metrics.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{metrics.growthMetrics.revenue.value}%
              </div>
              <div className="text-xs text-muted-foreground">vs last month</div>
            </div>
            {/* Area chart showing revenue growth over time */}
            <div className="mt-3 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueGrowthData}>
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#F59E0B" 
                    fill="url(#amberGradient)" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <defs>
                    <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Interactive Analytics with Tabs */}
        <div className="col-span-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-bold gradient-text-neural font-poppins">Platform Analytics</h3>
            </div>
            <select 
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          {/* Enhanced Chart Tabs with Animations */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-900/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-1 shadow-lg shadow-cyan-500/10 transition-all duration-200 hover:shadow-cyan-500/20">
              <TabsTrigger 
                value="user-growth" 
                className="flex items-center gap-2 font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-violet-500/20 data-[state=active]:border data-[state=active]:border-cyan-400/30 data-[state=active]:text-cyan-300 data-[state=active]:shadow-md data-[state=active]:transform data-[state=active]:scale-[1.02] hover:bg-slate-800/50 hover:text-cyan-200 rounded-lg"
                disabled={isTransitioning}
              >
                {isLoading && activeTab === 'user-growth' ? (
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Users className="h-4 w-4" />
                )}
                User Growth
              </TabsTrigger>
              <TabsTrigger 
                value="revenue" 
                className="flex items-center gap-2 font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-violet-500/20 data-[state=active]:border data-[state=active]:border-amber-400/30 data-[state=active]:text-amber-300 data-[state=active]:shadow-md data-[state=active]:transform data-[state=active]:scale-[1.02] hover:bg-slate-800/50 hover:text-amber-200 rounded-lg"
                disabled={isTransitioning}
              >
                {isLoading && activeTab === 'revenue' ? (
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <DollarSign className="h-4 w-4" />
                )}
                Revenue
              </TabsTrigger>
              <TabsTrigger 
                value="engagement" 
                className="flex items-center gap-2 font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:border data-[state=active]:border-violet-400/30 data-[state=active]:text-violet-300 data-[state=active]:shadow-md data-[state=active]:transform data-[state=active]:scale-[1.02] hover:bg-slate-800/50 hover:text-violet-200 rounded-lg"
                disabled={isTransitioning}
              >
                {isLoading && activeTab === 'engagement' ? (
                  <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <BookOpen className="h-4 w-4" />
                )}
                Engagement
              </TabsTrigger>
              <TabsTrigger 
                value="geographic" 
                className="flex items-center gap-2 font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:border data-[state=active]:border-emerald-400/30 data-[state=active]:text-emerald-300 data-[state=active]:shadow-md data-[state=active]:transform data-[state=active]:scale-[1.02] hover:bg-slate-800/50 hover:text-emerald-200 rounded-lg"
                disabled={isTransitioning}
              >
                {isLoading && activeTab === 'geographic' ? (
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Globe className="h-4 w-4" />
                )}
                Geographic
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent 
                value="user-growth" 
                className={`mt-0 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
              >
                {loadedTabs.has('user-growth') ? <UserGrowthChart /> : <ChartLoading />}
              </TabsContent>

              <TabsContent 
                value="revenue" 
                className={`mt-0 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
              >
                {loadedTabs.has('revenue') ? <RevenueChart /> : <ChartLoading />}
              </TabsContent>

              <TabsContent 
                value="engagement" 
                className={`mt-0 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
              >
                {loadedTabs.has('engagement') ? <CourseEngagementChart /> : <ChartLoading />}
              </TabsContent>

              <TabsContent 
                value="geographic" 
                className={`mt-0 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
              >
                {loadedTabs.has('geographic') ? <GeographicChart /> : <ChartLoading />}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Quick Actions Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="font-poppins">Action Center</CardTitle>
            <CardDescription className="font-inter">
              Tasks requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div key={index} className={`p-3 rounded-lg border transition-all duration-300 hover:shadow-md ${
                  action.urgent ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800' : 'bg-muted/30 border-border'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${action.urgent ? 'text-red-600' : 'text-muted-foreground'}`} />
                      <span className="text-sm font-medium font-inter">{action.label}</span>
                    </div>
                    {action.urgent && (
                      <Badge variant="destructive" className="text-xs">Urgent</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {action.count} pending items
                    </p>
                    <Button size="sm" variant={action.urgent ? "destructive" : "outline"} className="h-7">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      {action.urgent ? "Urgent" : "View"}
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {/* Quick stats */}
            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="text-sm font-medium font-poppins mb-3">Today's Highlights</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-inter">New Signups</span>
                  <span className="font-medium">+127</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-inter">Courses Published</span>
                  <span className="font-medium">+8</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-inter">Revenue Generated</span>
                  <span className="font-medium">$3,450</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Categories Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-poppins">
            <PieChart className="h-5 w-5 text-tertiary" />
            Course Distribution by Category
          </CardTitle>
          <CardDescription className="font-inter">
            Platform content breakdown and category performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {courseCategories.map((category, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="relative">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted relative overflow-hidden">
                    <div 
                      className={`${category.color} absolute bottom-0 left-0 right-0 transition-all duration-500`}
                      style={{ height: `${category.percentage * 2}%` }}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{category.percentage}%</span>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-sm font-poppins">{category.category}</p>
                  <p className="text-xs text-muted-foreground font-inter">{category.count} courses</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemOverview;
