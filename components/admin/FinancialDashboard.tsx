"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Users,
  Calendar,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  PieChart,
  BarChart3,
  FileText,
  Wallet
} from "lucide-react";

const FinancialDashboard = () => {
  // Mock data
  const financialStats = {
    totalRevenue: 245680,
    monthlyGrowth: 12.5,
    instructorPayouts: 171976,
    platformCommission: 73704,
    pendingPayouts: 15420,
    activeSubscriptions: 8920,
  };

  const revenueData = [
    { month: "Jan", revenue: 18500, commissions: 5550, payouts: 12950 },
    { month: "Feb", revenue: 22100, commissions: 6630, payouts: 15470 },
    { month: "Mar", revenue: 25600, commissions: 7680, payouts: 17920 },
    { month: "Apr", revenue: 28900, commissions: 8670, payouts: 20230 },
    { month: "May", revenue: 31200, commissions: 9360, payouts: 21840 },
    { month: "Jun", revenue: 34500, commissions: 10350, payouts: 24150 },
  ];

  const topInstructors = [
    { 
      id: 1, 
      name: "Dr. Sarah Johnson", 
      courses: 12, 
      students: 4520, 
      revenue: 28450, 
      commission: 8535,
      payout: 19915,
      status: "Paid"
    },
    { 
      id: 2, 
      name: "Prof. Michael Chen", 
      courses: 8, 
      students: 3240, 
      revenue: 22100, 
      commission: 6630,
      payout: 15470,
      status: "Pending"
    },
    { 
      id: 3, 
      name: "Lisa Anderson", 
      courses: 15, 
      students: 2890, 
      revenue: 19650, 
      commission: 5895,
      payout: 13755,
      status: "Paid"
    },
    { 
      id: 4, 
      name: "James Rodriguez", 
      courses: 6, 
      students: 2150, 
      revenue: 15800, 
      commission: 4740,
      payout: 11060,
      status: "Processing"
    },
  ];

  const pendingTransactions = [
    {
      id: "TXN-001",
      instructor: "Dr. Sarah Johnson",
      amount: 2840,
      type: "Course Sales",
      date: "2024-03-15",
      status: "Pending Review",
    },
    {
      id: "TXN-002",
      instructor: "Prof. Michael Chen",
      amount: 1950,
      type: "Subscription",
      date: "2024-03-14",
      status: "Processing",
    },
    {
      id: "TXN-003",
      instructor: "Lisa Anderson",
      amount: 3200,
      type: "Course Bundle",
      date: "2024-03-13",
      status: "Approved",
    },
  ];

  const paymentMethods = [
    { method: "Credit Cards", percentage: 68.5, amount: 168316 },
    { method: "PayPal", percentage: 22.1, amount: 54336 },
    { method: "Bank Transfer", percentage: 7.8, amount: 19163 },
    { method: "Cryptocurrency", percentage: 1.6, amount: 3933 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-700";
      case "Pending": return "bg-yellow-100 text-yellow-700";
      case "Processing": return "bg-blue-100 text-blue-700";
      case "Approved": return "bg-green-100 text-green-700";
      case "Pending Review": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-poppins font-bold mb-2 gradient-text">Financial Dashboard</h2>
          <p className="text-muted-foreground font-inter">
            Revenue tracking, instructor payouts, and financial analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Financial Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{financialStats.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instructor Payouts</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialStats.instructorPayouts)}</div>
            <p className="text-xs text-muted-foreground">
              70% of total revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialStats.platformCommission)}</div>
            <p className="text-xs text-muted-foreground">
              30% commission rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialStats.pendingPayouts)}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Analytics */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Revenue Analytics
              </CardTitle>
              <CardDescription>
                Monthly revenue breakdown and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="revenue" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
                  <TabsTrigger value="instructors">Top Instructors</TabsTrigger>
                  <TabsTrigger value="transactions">Pending Transactions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="revenue" className="space-y-4">
                  <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Revenue Chart Placeholder</p>
                      <p className="text-xs text-muted-foreground">Monthly revenue trend visualization</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-medium">Average Monthly</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(26800)}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Growth Rate</p>
                      <p className="text-2xl font-bold text-green-600">+{financialStats.monthlyGrowth}%</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Best Month</p>
                      <p className="text-2xl font-bold text-blue-600">June</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="instructors" className="space-y-4">
                  {topInstructors.map((instructor) => (
                    <div key={instructor.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{instructor.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {instructor.courses} courses • {instructor.students.toLocaleString()} students
                          </p>
                        </div>
                        <Badge variant="secondary" className={getStatusColor(instructor.status)}>
                          {instructor.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Revenue</p>
                          <p className="font-medium">{formatCurrency(instructor.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Commission</p>
                          <p className="font-medium">{formatCurrency(instructor.commission)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Payout</p>
                          <p className="font-medium">{formatCurrency(instructor.payout)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        {instructor.status === "Pending" && (
                          <Button size="sm">
                            Process Payout
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="transactions" className="space-y-4">
                  {pendingTransactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span className="font-medium">{transaction.id}</span>
                          <Badge variant="secondary" className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                        <span className="font-bold">{formatCurrency(transaction.amount)}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <span>Instructor: {transaction.instructor}</span>
                        <span>Type: {transaction.type}</span>
                        <span>Date: {transaction.date}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                        <Button size="sm">
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Financial Actions Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Actions</CardTitle>
              <CardDescription>
                Quick access to financial operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Process Bulk Payouts
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Generate Tax Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Update Commission Rates
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Payouts
              </Button>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Revenue distribution by payment type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((method, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{method.method}</span>
                    <span className="font-medium">{method.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${method.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(method.amount)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Financial Health */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Health</CardTitle>
              <CardDescription>
                Key financial indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Revenue Growth</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Payout Ratio</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">Optimal</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Pending Reviews</span>
                  </div>
                  <span className="text-sm font-medium text-yellow-600">Monitor</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Cash Flow</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">Strong</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
