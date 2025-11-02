"use client";

import { useState } from "react";
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
  AlertCircle
} from "lucide-react";
import { useAuth, withAuth } from "@/context/AuthContext";

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
          generationStatus
          generationStartedAt
          generationCompletedAt
        }
      }
    }
  }
`;

const GET_MODULES_BY_ROADMAP = gql`
  query GetModulesByRoadmap($roadmapId: String!) {
    roadmaps {
      getModulesByRoadmap(roadmapId: $roadmapId) {
        id
        title
        description
        difficulty
        order
        generationStatus
        generationError
        generationStartedAt
        generationCompletedAt
      }
    }
  }
`;

// GraphQL Mutation for generating module lessons
const GENERATE_MODULE_LESSONS = gql`
  mutation GenerateModuleLessons($moduleId: String!) {
    lessons {
      generateModuleLessons(moduleId: $moduleId) {
        id
        title
        generationStatus
        generationStartedAt
        generationCompletedAt
        generationError
      }
    }
  }
`;

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [loadingModuleId, setLoadingModuleId] = useState<number | null>(null);
  const [generatingModuleId, setGeneratingModuleId] = useState<number | null>(null);

  // Fetch user roadmaps
  const { data: roadmapsData, loading: roadmapsLoading, error: roadmapsError, refetch } = useQuery(
    GET_USER_ROADMAPS,
    {
      variables: { userId: user?.id || "" },
      skip: !user?.id,
    }
  );

  // Mutation for generating lessons
  const [generateLessons, { loading: generationLoading }] = useMutation(
    GENERATE_MODULE_LESSONS,
    {
      onCompleted: () => {
        setGeneratingModuleId(null);
        // Refetch to get updated status
        refetch();
      },
      onError: (error) => {
        console.error("Generation error:", error);
        setGeneratingModuleId(null);
      },
    }
  );

  // Handle lesson generation trigger
  const handleGenerateLessons = async (moduleId: number | string) => {
    setGeneratingModuleId(Number(moduleId));
    try {
      await generateLessons({
        variables: { moduleId: String(moduleId) },
      });
    } catch (error) {
      console.error("Failed to generate lessons:", error);
      setGeneratingModuleId(null);
    }
  };

  // Transform roadmap data to course format
  const recentCourses = roadmapsData?.roadmaps?.listRoadmaps?.map((roadmap: any, index: number) => ({
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
        <Card className="w-full max-w-md border-red-200 dark:border-red-800">
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
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              {recentCourses.length === 0
                ? "Start by creating your first learning roadmap"
                : "Continue your learning journey with SkillSync"}
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
                      className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => setSelectedCourse(selectedCourse === course.id ? null : course.id)}
                    >
                      {/* Course Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {course.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {course.completedModules}/{course.totalModules} modules
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Course Progress */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>{course.completedModules} completed</span>
                          <span className="font-semibold">{course.progress}% complete</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>

                      {/* Expandable Modules List */}
                      {selectedCourse === course.id && course.modules.length > 0 && (
                        <div className="mt-4 pt-4 border-t space-y-2">
                          <p className="text-sm font-medium text-foreground mb-3">Modules:</p>
                          {course.modules.map((module: any) => (
                            <div
                              key={module.id}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{module.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  Status:{" "}
                                  <span className="font-semibold capitalize">
                                    {module.generationStatus || "not_started"}
                                  </span>
                                </p>
                              </div>
                              {module.generationStatus !== "completed" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGenerateLessons(module.id);
                                  }}
                                  disabled={generatingModuleId === module.id || generationLoading}
                                  className="ml-2"
                                >
                                  {generatingModuleId === module.id ? (
                                    <>
                                      <Loader className="h-3 w-3 mr-1 animate-spin" />
                                      Generating...
                                    </>
                                  ) : (
                                    <>
                                      <Zap className="h-3 w-3 mr-1" />
                                      Generate
                                    </>
                                  )}
                                </Button>
                              )}
                              {module.generationStatus === "completed" && (
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
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
                  Active Roadmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentCourses.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-foreground line-clamp-2">
                        {recentCourses[0]?.title}
                      </p>
                      <p className="text-sm text-muted-foreground">Learning Progress</p>
                    </div>
                    <Progress value={recentCourses[0]?.progress || 0} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      {recentCourses[0]?.progress || 0}% complete
                    </p>
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      {recentCourses[0]?.completedModules} of {recentCourses[0]?.totalModules} modules completed
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">Create a roadmap to set your learning goal</p>
                  </div>
                )}
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

export default withAuth(UserDashboard, ['learner', 'new_user']);
