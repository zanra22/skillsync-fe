"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Play,
  Users,
  Clock,
  TrendingUp,
  Flag
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ContentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const contentStats = {
    totalCourses: 1547,
    publishedCourses: 1312,
    pendingApproval: 45,
    reportedContent: 8,
  };

  const pendingCourses = [
    {
      id: 1,
      title: "Advanced React Patterns & Performance",
      instructor: "Sarah Chen",
      category: "Programming",
      duration: "12 hours",
      lessons: 45,
      submittedDate: "2024-03-15",
      status: "Pending Review",
    },
    {
      id: 2,
      title: "Digital Marketing Mastery 2024",
      instructor: "Mike Rodriguez",
      category: "Marketing",
      duration: "8 hours",
      lessons: 32,
      submittedDate: "2024-03-14",
      status: "Content Review",
    },
    {
      id: 3,
      title: "UI/UX Design Fundamentals",
      instructor: "Emily Park",
      category: "Design",
      duration: "15 hours",
      lessons: 56,
      submittedDate: "2024-03-13",
      status: "Quality Check",
    },
  ];

  const reportedContent = [
    {
      id: 1,
      type: "Course",
      title: "Cryptocurrency Trading Basics",
      instructor: "John Smith",
      reportReason: "Misleading information",
      reportCount: 5,
      reportedDate: "2024-03-15",
      severity: "High",
    },
    {
      id: 2,
      type: "Comment",
      title: "Comment on 'Python for Beginners'",
      instructor: "Anonymous User",
      reportReason: "Inappropriate language",
      reportCount: 2,
      reportedDate: "2024-03-14",
      severity: "Medium",
    },
  ];

  const topCourses = [
    {
      id: 1,
      title: "Complete JavaScript Course 2024",
      instructor: "Alex Johnson",
      rating: 4.8,
      students: 12547,
      revenue: "$45,230",
      category: "Programming",
    },
    {
      id: 2,
      title: "Graphic Design Masterclass",
      instructor: "Lisa Wang",
      rating: 4.9,
      students: 8934,
      revenue: "$32,180",
      category: "Design",
    },
    {
      id: 3,
      title: "Digital Marketing Strategy",
      instructor: "David Brown",
      rating: 4.7,
      students: 7821,
      revenue: "$28,950",
      category: "Marketing",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending Review": return "bg-yellow-100 text-yellow-700";
      case "Content Review": return "bg-blue-100 text-blue-700";
      case "Quality Check": return "bg-purple-100 text-purple-700";
      case "Published": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High": return "bg-red-100 text-red-700";
      case "Medium": return "bg-yellow-100 text-yellow-700";
      case "Low": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-poppins font-bold mb-2 gradient-text">Content Management</h2>
        <p className="text-muted-foreground font-inter">
          Oversee courses, reviews, and content quality across your platform
        </p>
      </div>

      {/* Content Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats.totalCourses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Available on platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats.publishedCourses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((contentStats.publishedCourses / contentStats.totalCourses) * 100).toFixed(1)}% approval rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats.pendingApproval}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reported Content</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentStats.reportedContent}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Course Management</CardTitle>
                  <CardDescription>Review and manage platform content</CardDescription>
                </div>
                <Button>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Bulk Actions
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses by title or instructor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="pending">Pending ({contentStats.pendingApproval})</TabsTrigger>
                  <TabsTrigger value="published">Published</TabsTrigger>
                  <TabsTrigger value="reported">Reported</TabsTrigger>
                  <TabsTrigger value="top">Top Performing</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pending" className="space-y-4">
                  {pendingCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{course.title}</h3>
                          <Badge variant="secondary" className={getStatusColor(course.status)}>
                            {course.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          by {course.instructor} • {course.category}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            {course.lessons} lessons
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.duration}
                          </span>
                          <span>Submitted {course.submittedDate}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve Course
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Request Changes
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject Course
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="reported" className="space-y-4">
                  {reportedContent.map((content) => (
                    <div key={content.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-red-50 dark:bg-red-950/20">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{content.type}</Badge>
                          <Badge variant="secondary" className={getSeverityColor(content.severity)}>
                            {content.severity} Priority
                          </Badge>
                        </div>
                        <h3 className="font-medium mb-1">{content.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          by {content.instructor}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Reason: {content.reportReason}</span>
                          <span>{content.reportCount} reports</span>
                          <span>Reported {content.reportedDate}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Investigate
                        </Button>
                        <Button size="sm" variant="destructive">
                          Take Action
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="top" className="space-y-4">
                  {topCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          by {course.instructor} • {course.category}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            {course.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {course.students.toLocaleString()} students
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            {course.revenue}
                          </span>
                        </div>
                      </div>
                      
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Analytics
                      </Button>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="published">
                  <p className="text-muted-foreground">Published courses list would go here</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Quality Control Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle>Quality Control</CardTitle>
            <CardDescription>
              Content review guidelines and quick actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Review Guidelines</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Check content accuracy</li>
                <li>• Verify instructor credentials</li>
                <li>• Review video/audio quality</li>
                <li>• Ensure appropriate content</li>
              </ul>
            </div>
            
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Pending Reviews</h4>
              <p className="text-xs text-muted-foreground mb-2">
                {contentStats.pendingApproval} courses awaiting approval
              </p>
              <Button size="sm" className="w-full">
                Start Review Queue
              </Button>
            </div>
            
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Urgent Reports</h4>
              <p className="text-xs text-muted-foreground mb-2">
                {contentStats.reportedContent} items need immediate attention
              </p>
              <Button size="sm" variant="destructive" className="w-full">
                Review Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentManagement;
