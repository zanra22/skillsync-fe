"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
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
  Zap,
  Settings,
  Bell,
  MoreVertical,
  Flame,
  Code2,
  Lightbulb,
  GitBranch,
  Loader,
  Lock,
  AlertCircle
} from "lucide-react";
import { ProgressRing } from "@/components/ProgressRing";
import { useAuth, withAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

// GraphQL Queries
const GET_USER_ROADMAPS = gql`
  query GetUserRoadmaps($userId: String!) {
    roadmaps {
      listRoadmaps(userId: $userId) {
        id
        title
        description
        difficultyLevel
        totalDuration
        generatedAt
        modules {
          id
          title
          description
          difficulty
          order
          estimatedDuration
        }
      }
    }
  }
`;

// Query to get lessons for a specific module
const GET_MODULE_LESSONS = gql`
  query GetModuleLessons($moduleId: String!) {
    lessons {
      getLessonsByModule(moduleId: $moduleId) {
        id
        title
        description
        lessonNumber
        learningStyle
        estimatedDuration
        generationStatus
        generationError
      }
    }
  }
`;

// Mutation for on-demand lesson generation (calls Azure Function)
const GENERATE_LESSON_CONTENT = gql`
  mutation GenerateLessonContent($lessonId: String!) {
    lessons {
      generateLessonContent(lessonId: $lessonId) {
        id
        title
        generationStatus
        generationError
      }
    }
  }
`;

// Mutation for generating lesson skeletons (failsafe when module has no lessons)
const GENERATE_LESSON_SKELETONS = gql`
  mutation GenerateLessonSkeletons($moduleId: String!) {
    lessons {
      generateLessonSkeletons(moduleId: $moduleId) {
        id
        title
      }
    }
  }
`;

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [generatingLessonId, setGeneratingLessonId] = useState<string | null>(null);

  // Fetch user roadmaps
  const { data: roadmapsData, loading: roadmapsLoading, error: roadmapsError, refetch: refetchRoadmaps } = useQuery(
    GET_USER_ROADMAPS,
    {
      variables: { userId: user?.id || "" },
      skip: !user?.id,
    }
  );

  // Fetch lessons for selected module
  const { data: lessonsData, loading: lessonsLoading, refetch: refetchLessons } = useQuery<any>(
    GET_MODULE_LESSONS,
    {
      variables: { moduleId: selectedModule || "" },
      skip: !selectedModule,
    }
  );

  // Mutation for on-demand lesson generation
  const [generateLessonContent, { loading: generationLoading }] = useMutation(
    GENERATE_LESSON_CONTENT,
    {
      onCompleted: () => {
        setGeneratingLessonId(null);
        // Refetch lessons to get updated status
        refetchLessons();
      },
      onError: (error) => {
        console.error("Generation error:", error);
        setGeneratingLessonId(null);
      },
    }
  );

  // Mutation for generating lesson skeletons (failsafe)
  const [generateLessonSkeletons, { loading: skeletonsLoading }] = useMutation(
    GENERATE_LESSON_SKELETONS,
    {
      onCompleted: () => {
        // Refetch lessons to show newly created skeletons
        refetchLessons();
        refetchRoadmaps();
      },
      onError: (error) => {
        console.error("Skeleton generation error:", error);
      },
    }
  );

  // Handle generating skeletons for a module
  const handleGenerateSkeletons = async (moduleId: string) => {
    try {
      await generateLessonSkeletons({
        variables: { moduleId },
      });
    } catch (error) {
      console.error("Failed to generate skeletons:", error);
    }
  };

  // Handle lesson generation/view
  const handleViewLesson = async (lessonId: string, generationStatus: string) => {
    if (generationStatus === 'pending') {
      // Generate content on-demand
      setGeneratingLessonId(lessonId);
      try {
        await generateLessonContent({
          variables: { lessonId },
        });
      } catch (error) {
        console.error("Failed to generate lesson:", error);
        setGeneratingLessonId(null);
      }
    } else if (generationStatus === 'completed') {
      // Navigate to lesson view (implement later)
      console.log("View lesson:", lessonId);
    }
  };

  // Transform roadmap data to course format
  const recentCourses = (roadmapsData as any)?.roadmaps?.listRoadmaps?.map((roadmap: any, index: number) => ({
    id: roadmap.id,
    title: roadmap.title,
    description: roadmap.description,
    difficulty: roadmap.difficultyLevel || "Beginner",
    modules: roadmap.modules || [],
    totalModules: roadmap.modules?.length || 0,
    completedModules: roadmap.modules?.filter((m: any) => m.generationStatus === "completed").length || 0,
    progress: roadmap.modules?.length
      ? Math.round(
          (roadmap.modules.filter((m: any) => m.generationStatus === "completed").length /
           roadmap.modules.length) * 100
        )
      : 0,
  })) || [];

  // Calculate user stats from roadmaps
  const userStats = {
    coursesEnrolled: recentCourses.length,
    coursesCompleted: recentCourses.filter((c: any) => c.progress === 100).length,
    totalLearningHours: recentCourses.length * 20, // Estimate: 20 hours per roadmap
    currentStreak: 5, // Placeholder - can be calculated from generation dates
    skillPoints: recentCourses.length * 100, // Placeholder
    rank: "AI Learner",
    nextGoal: recentCourses[0]?.title || "Start Learning",
    progressToGoal: recentCourses[0]?.progress || 0,
    weeklyTarget: 12,
    weeklyProgress: 8.5
  };

  const achievements = [
    {
      name: "Roadmap Builder",
      description: "Create your first learning roadmap",
      icon: Zap,
      earned: recentCourses.length > 0,
      progress: recentCourses.length > 0 ? 100 : 0
    },
    {
      name: "Module Master",
      description: "Generate lessons in a module",
      icon: Flame,
      earned: recentCourses.some((c: any) => c.completedModules > 0),
      progress: recentCourses.some((c: any) => c.completedModules > 0) ? 100 : 0
    },
    {
      name: "Course Completer",
      description: "Finish your first roadmap",
      icon: Trophy,
      earned: recentCourses.some((c: any) => c.progress === 100),
      progress: recentCourses.length > 0 ? recentCourses[0]?.progress || 0 : 0
    },
    {
      name: "Community Star",
      description: "Help 5 fellow learners",
      icon: Users,
      earned: false,
      progress: 0
    }
  ];

  // Show loading state
  if (roadmapsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-12 w-12 animate-spin text-cyan-500" />
          <p className="text-lg text-muted-foreground">Loading your roadmaps...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (roadmapsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md border-red-200 dark:border-red-800 flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              Error Loading Roadmaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {roadmapsError.message}
            </p>
            <Button onClick={() => refetchRoadmaps()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-poppins font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-muted-foreground font-inter mt-2">
              {recentCourses.length === 0
                ? "Start by creating your first learning roadmap"
                : "Continue your learning journey with SkillSync"}
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 animate-fade-in-up">
          <Card className="group bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border-cyan-200 dark:border-cyan-800 card-hover overflow-hidden">
            {/* Background gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/50 to-blue-100/50 dark:from-cyan-900/20 dark:to-blue-900/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            <CardContent className="p-3 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/20 rounded-lg transition-transform duration-300 group-hover:scale-110">
                  <BookOpen className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{userStats.coursesEnrolled}</p>
                  <p className="text-sm text-cyan-600 dark:text-cyan-400">Courses Enrolled</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-200 dark:border-emerald-800 card-hover overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-green-100/50 dark:from-emerald-900/20 dark:to-green-900/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <CardContent className="p-3 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-lg transition-transform duration-300 group-hover:scale-110">
                  <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{userStats.coursesCompleted}</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800 card-hover overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 to-orange-100/50 dark:from-amber-900/20 dark:to-orange-900/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <CardContent className="p-3 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 rounded-lg transition-transform duration-300 group-hover:scale-110">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{userStats.totalLearningHours}h</p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">Learning Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200 dark:border-violet-800 card-hover overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-100/50 to-purple-100/50 dark:from-violet-900/20 dark:to-purple-900/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <CardContent className="p-3 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-500/20 rounded-lg transition-transform duration-300 group-hover:scale-110">
                  <Star className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">{userStats.skillPoints}</p>
                  <p className="text-sm text-violet-600 dark:text-violet-400">Skill Points</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800 card-hover overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-red-100/50 dark:from-orange-900/20 dark:to-red-900/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <CardContent className="p-3 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/20 rounded-lg transition-transform duration-300 group-hover:scale-110">
                  <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">12</p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* XP Progress Bar */}
        <Card className="lg:col-span-2">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  7
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Level 7</h3>
                  <p className="text-sm text-muted-foreground">Keep learning to level up!</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">1,250 / 2,000 XP</p>
                <p className="text-xs text-muted-foreground">750 XP to Level 8</p>
              </div>
            </div>
            <div className="relative">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 progress-animate"
                  style={{ width: '62.5%' }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Current Progress */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            {/* Active Roadmap Hero */}
            {recentCourses.length > 0 && (
              <div className="rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-card p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 dark:from-cyan-500/10 dark:to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        Active Roadmap
                        <Zap className="h-5 w-5 text-cyan-500 fill-cyan-500" />
                      </h2>
                      <p className="text-muted-foreground text-sm font-medium mt-1">{recentCourses[0].title}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs font-semibold uppercase tracking-wider">
                      In Progress
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-8 mb-6">
                    <ProgressRing 
                      progress={recentCourses[0].progress || 0} 
                      size={120} 
                      strokeWidth={10} 
                      color="primary"
                    />
                    
                    <div className="flex-1 w-full space-y-4">
                      <div className="flex justify-between items-center text-sm p-3 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground font-medium">Current Module</span>
                        <span className="font-semibold text-right">
                          {recentCourses[0].modules[recentCourses[0].completedModules]?.title || "Final Review"}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm p-3 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground font-medium">Modules Completed</span>
                        <span className="font-semibold">
                          {recentCourses[0].completedModules} / {recentCourses[0].totalModules}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm p-3 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground font-medium">Est. Completion</span>
                        <span className="font-semibold">Self-paced</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full btn-hero bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                    onClick={() => setSelectedCourse(selectedCourse === recentCourses[0].id ? null : recentCourses[0].id)}
                  >
                    Continue Learning
                    <PlayCircle className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <CardTitle className="font-poppins">Your Learning Roadmaps</CardTitle>
                <CardDescription className="font-inter">
                  {recentCourses.length === 0
                    ? "No roadmaps yet. Create one to get started!"
                    : `${recentCourses.length} roadmap${recentCourses.length !== 1 ? 's' : ''} available`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {recentCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No roadmaps created yet. Start your learning journey!</p>
                  </div>
                ) : (
                  recentCourses.map((course: any) => (
                    <div
                      key={course.id}
                      className="group border rounded-lg p-5 hover:shadow-lg hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        {/* Course Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-foreground mb-2">
                            {course.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {course.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {course.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {course.completedModules}/{course.totalModules} modules
                            </Badge>
                          </div>
                        </div>

                        {/* Progress Ring */}
                        <div className="flex-shrink-0">
                          <ProgressRing 
                            progress={course.progress || 0} 
                            size={80} 
                            strokeWidth={6} 
                            color="primary"
                          />
                        </div>
                      </div>

                      {/* Module Mini Cards */}
                      {course.modules && course.modules.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Modules</p>
                          <div className="grid grid-cols-2 gap-2">
                            {course.modules.slice(0, 4).map((module: any, idx: number) => (
                              <div
                                key={module.id}
                                className="flex flex-col gap-1 p-2 rounded-md bg-muted/50 border border-border/50 min-h-[60px]"
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                    idx < course.completedModules ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                                  }`} />
                                  <span className="text-xs font-medium text-foreground truncate">{module.title}</span>
                                </div>
                                {module.description && (
                                  <p className="text-[10px] text-muted-foreground line-clamp-2 pl-3.5">
                                    {module.description.length > 100 
                                      ? `${module.description.substring(0, 100)}...` 
                                      : module.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                          {course.modules.length > 4 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/roadmap/${course.id}`;
                              }}
                              className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
                            >
                              +{course.modules.length - 4} more modules →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col space-y-4">
            {/* Leaderboard */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b">
                <CardTitle className="font-poppins flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500 fill-amber-500" />
                  Top Learners
                </CardTitle>
                <CardDescription className="text-xs">
                  Based on skill points earned
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {/* Mock leaderboard data - replace with real data later */}
                  {[
                    { rank: 1, name: "Alex Chen", points: 2850, avatar: "AC", color: "bg-gradient-to-br from-amber-400 to-orange-500" },
                    { rank: 2, name: "Sarah Kim", points: 2340, avatar: "SK", color: "bg-gradient-to-br from-gray-300 to-gray-400" },
                    { rank: 3, name: "Mike Ross", points: 1920, avatar: "MR", color: "bg-gradient-to-br from-orange-400 to-amber-600" },
                    { rank: 4, name: "Emma Liu", points: 1650, avatar: "EL", color: "bg-gradient-to-br from-cyan-400 to-blue-500" },
                    { rank: 5, name: "You", points: userStats.skillPoints, avatar: user?.firstName?.substring(0, 2).toUpperCase() || "YO", color: "bg-gradient-to-br from-purple-400 to-pink-500", isCurrentUser: true },
                  ].map((leader, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-3 transition-all duration-200 ${
                        leader.isCurrentUser 
                          ? 'bg-cyan-50 dark:bg-cyan-950/30 hover:bg-cyan-100 dark:hover:bg-cyan-950/50' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex-shrink-0 w-6 text-center">
                        {leader.rank <= 3 ? (
                          <div className={`text-lg font-bold ${
                            leader.rank === 1 ? 'text-amber-500' :
                            leader.rank === 2 ? 'text-gray-400' :
                            'text-orange-600'
                          }`}>
                            {leader.rank}
                          </div>
                        ) : (
                          <div className="text-sm font-medium text-muted-foreground">
                            {leader.rank}
                          </div>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${leader.color} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                        {leader.avatar}
                      </div>

                      {/* Name & Points */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${
                          leader.isCurrentUser ? 'text-cyan-700 dark:text-cyan-300' : 'text-foreground'
                        }`}>
                          {leader.name}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          <span className="font-medium">{leader.points.toLocaleString()}</span>
                          <span>pts</span>
                        </div>
                      </div>

                      {/* Badge for top 3 */}
                      {leader.rank <= 3 && (
                        <div className="flex-shrink-0">
                          <Trophy className={`h-4 w-4 ${
                            leader.rank === 1 ? 'text-amber-500 fill-amber-500' :
                            leader.rank === 2 ? 'text-gray-400 fill-gray-400' :
                            'text-orange-600 fill-orange-600'
                          }`} />
                        </div>
                      )}
                    </div>
                  ))}
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
                    <div 
                      key={index} 
                      className={`group flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                        achievement.earned 
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 hover:scale-[1.02]' 
                          : 'bg-muted/50 opacity-60'
                      }`}
                    >
                      <div className={`relative p-2 rounded-lg ${achievement.earned ? 'bg-emerald-500/20' : 'bg-muted'}`}>
                        {achievement.earned ? (
                          <achievement.icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                        {achievement.earned && (
                          <div className="absolute -inset-1 rounded-lg bg-emerald-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default withAuth(UserDashboard, ['learner', 'new_user']);
