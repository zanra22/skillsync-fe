"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  Users, 
  Star,
  TrendingUp,
  Calendar,
  Target,
  PlayCircle,
  CheckCircle,
  Award,
  Zap
} from "lucide-react";
import { useAuth, withAuth } from "@/context/AuthContext";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  
  // Mock user data - replace with real API calls
  const userStats = {
    coursesEnrolled: 8,
    coursesCompleted: 3,
    totalLearningHours: 47,
    currentStreak: 12,
    skillPoints: 2840,
    rank: "Advanced Learner",
    nextGoal: "Complete 5 courses",
    progressToGoal: 60
  };

  const recentCourses = [
    {
      id: 1,
      title: "Advanced React Development",
      progress: 75,
      totalLessons: 24,
      completedLessons: 18,
      instructor: "Sarah Chen",
      lastAccessed: "2 hours ago",
      category: "Frontend Development",
      difficulty: "Advanced"
    },
    {
      id: 2,
      title: "Data Structures & Algorithms",
      progress: 45,
      totalLessons: 32,
      completedLessons: 14,
      instructor: "Dr. Michael Brown",
      lastAccessed: "1 day ago",
      category: "Computer Science",
      difficulty: "Intermediate"
    },
    {
      id: 3,
      title: "UI/UX Design Principles",
      progress: 100,
      totalLessons: 16,
      completedLessons: 16,
      instructor: "Emma Wilson",
      lastAccessed: "3 days ago",
      category: "Design",
      difficulty: "Beginner"
    }
  ];

  const achievements = [
    { name: "Fast Learner", description: "Complete 3 courses in a month", icon: Zap, earned: true },
    { name: "Consistent Student", description: "Study 7 days in a row", icon: Calendar, earned: true },
    { name: "Course Master", description: "Complete 5 courses", icon: Trophy, earned: false },
    { name: "Community Helper", description: "Help 10 fellow students", icon: Users, earned: false }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-poppins font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-muted-foreground font-inter mt-2">
              Continue your learning journey with SkillSync
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={logout}
            className="font-inter hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950 dark:hover:border-red-800"
          >
            Sign Out
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border-cyan-200 dark:border-cyan-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/20 rounded-lg">
                  <BookOpen className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{userStats.coursesEnrolled}</p>
                  <p className="text-sm text-cyan-600 dark:text-cyan-400">Courses Enrolled</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{userStats.coursesCompleted}</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 rounded-lg">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{userStats.totalLearningHours}h</p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">Learning Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200 dark:border-violet-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-500/20 rounded-lg">
                  <Star className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">{userStats.skillPoints}</p>
                  <p className="text-sm text-violet-600 dark:text-violet-400">Skill Points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Progress */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-poppins">Continue Learning</CardTitle>
                <CardDescription className="font-inter">
                  Pick up where you left off
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentCourses.map((course, index) => (
                  <div key={course.id} className="p-4 border rounded-lg hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {course.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {course.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" className="ml-4">
                        <PlayCircle className="h-4 w-4 mr-1" />
                        Continue
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                        <span>{course.progress}% complete</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">Last accessed {course.lastAccessed}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Goal */}
            <Card>
              <CardHeader>
                <CardTitle className="font-poppins flex items-center gap-2">
                  <Target className="h-5 w-5 text-cyan-500" />
                  Current Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-foreground">{userStats.nextGoal}</p>
                    <p className="text-sm text-muted-foreground">Progress to goal</p>
                  </div>
                  <Progress value={userStats.progressToGoal} className="h-2" />
                  <p className="text-sm text-muted-foreground">{userStats.progressToGoal}% complete</p>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="font-poppins flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div key={index} className={`flex items-center gap-3 p-2 rounded-lg ${achievement.earned ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-muted/50'}`}>
                      <div className={`p-2 rounded-lg ${achievement.earned ? 'bg-emerald-500/20' : 'bg-muted'}`}>
                        <achievement.icon className={`h-4 w-4 ${achievement.earned ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${achievement.earned ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'}`}>
                          {achievement.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                      {achievement.earned && (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Streak */}
            <Card>
              <CardHeader>
                <CardTitle className="font-poppins flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  Learning Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{userStats.currentStreak}</p>
                  <p className="text-sm text-muted-foreground">days in a row</p>
                  <p className="text-xs text-muted-foreground mt-2">Keep it up! 🔥</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
