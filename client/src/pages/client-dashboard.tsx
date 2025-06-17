import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import OrganizedMetricsOverview from "@/components/OrganizedMetricsOverview";
import TimeFrameSelector, { TimeFrameType } from "@/components/TimeFrameSelector";
import EngagementChart from "@/components/EngagementChart";
import FollowerGrowthChart from "@/components/FollowerGrowthChart";
import TopPostsWidget from "@/components/TopPostsWidget";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Facebook, Instagram, BarChart3, RefreshCw } from "lucide-react";
import { SiX, SiLinkedin, SiTiktok } from "react-icons/si";
import { TimePeriod, Client } from "@shared/schema";

export default function ClientDashboard() {
  const [match, params] = useRoute("/client/:id");
  const [, pageParams] = useRoute("/:pageName");
  
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [activePlatform, setActivePlatform] = useState<'all' | 'meta' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok'>('all');

  // Get all clients
  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  // Determine client ID - simplified logic
  let clientId = 1; // Default fallback
  
  if (params?.id) {
    clientId = parseInt(params.id);
  } else if (pageParams?.pageName && clients.length > 0) {
    const pageName = pageParams.pageName.toLowerCase();
    const foundClient = clients.find(c => {
      const slug = c.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .trim();
      return slug === pageName;
    });
    if (foundClient) {
      clientId = foundClient.id;
    }
  }

  const handleTimeFrameChange = (type: TimeFrameType, startDate?: Date, endDate?: Date) => {
    const mappedPeriod: TimePeriod = type === 'custom' ? 'custom' : type as TimePeriod;
    setTimePeriod(mappedPeriod);
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
  };

  const { data: dashboardData, isLoading: dashboardLoading, error, refetch } = useQuery({
    queryKey: [
      '/api/clients', 
      clientId, 
      'dashboard', 
      timePeriod, 
      customStartDate?.toISOString().split('T')[0] || null,
      customEndDate?.toISOString().split('T')[0] || null
    ],
    queryFn: async () => {
      let url = `/api/clients/${clientId}/dashboard?period=${timePeriod}`;
      if (timePeriod === 'custom' && customStartDate && customEndDate) {
        url += `&customStart=${customStartDate.toISOString().split('T')[0]}&customEnd=${customEndDate.toISOString().split('T')[0]}`;
      }
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    },
    enabled: !clientsLoading && clientId > 0,
    staleTime: 30000,
  });

  if (!clientId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Client Link</h1>
          <p className="text-slate-600">The dashboard link appears to be invalid.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Dashboard Error</h2>
            <p className="text-red-600 mb-4">Failed to load dashboard data</p>
            <button 
              onClick={() => refetch()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium text-slate-900">Loading your analytics...</p>
          <p className="text-sm text-slate-500 mt-2">Client ID: {clientId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {dashboardData?.client?.name} Analytics
                </h1>
                <p className="text-sm text-slate-600">Social Media Performance Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Comprehensive Time Frame Selector with 90D and Custom Support */}
              <TimeFrameSelector
                onTimeFrameChange={handleTimeFrameChange}
                onRefresh={() => refetch()}
                showRefresh={true}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Organized Metrics Overview */}
        <OrganizedMetricsOverview
          metrics={dashboardData?.metrics}
          timePeriod={timePeriod}
          selectedPlatform={activePlatform}
        />

        {/* Platform Tabs */}
        <Tabs value={activePlatform} onValueChange={(value) => setActivePlatform(value as any)} className="space-y-6">
          <div className="w-full overflow-x-auto">
            <TabsList className="grid grid-cols-6 min-w-full bg-white shadow-sm">
              <TabsTrigger value="all" className="flex items-center justify-center space-x-1 text-xs sm:text-sm">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">All</span>
              </TabsTrigger>
              <TabsTrigger value="meta" className="flex items-center justify-center space-x-1 text-xs sm:text-sm">
                <Facebook className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                <span className="hidden sm:inline">Facebook</span>
              </TabsTrigger>
              <TabsTrigger value="instagram" className="flex items-center justify-center space-x-1 text-xs sm:text-sm">
                <Instagram className="h-3 w-3 sm:h-4 sm:w-4 text-pink-600" />
                <span className="hidden sm:inline">Instagram</span>
              </TabsTrigger>
              <TabsTrigger value="twitter" className="flex items-center justify-center space-x-1 text-xs sm:text-sm">
                <SiX className="h-3 w-3 sm:h-4 sm:w-4 text-black" />
                <span className="hidden sm:inline">X</span>
              </TabsTrigger>
              <TabsTrigger value="linkedin" className="flex items-center justify-center space-x-1 text-xs sm:text-sm">
                <SiLinkedin className="h-3 w-3 sm:h-4 sm:w-4 text-blue-700" />
                <span className="hidden sm:inline">LinkedIn</span>
              </TabsTrigger>
              <TabsTrigger value="tiktok" className="flex items-center justify-center space-x-1 text-xs sm:text-sm">
                <SiTiktok className="h-3 w-3 sm:h-4 sm:w-4 text-black" />
                <span className="hidden sm:inline">TikTok</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="space-y-6">
            {/* Combined Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EngagementChart
                clientId={clientId}
                timePeriod={timePeriod}
              />
              <FollowerGrowthChart
                clientId={clientId}
                timePeriod={timePeriod}
              />
            </div>
            
            {/* Top Posts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TopPostsWidget
                  posts={dashboardData?.topPosts || []}
                />
              </div>
              <div>
                {/* Additional client widgets can be added here */}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="meta" className="space-y-6">
            {/* Meta-specific Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EngagementChart
                clientId={clientId}
                timePeriod={timePeriod}
                platform="meta"
              />
              <FollowerGrowthChart
                clientId={clientId}
                timePeriod={timePeriod}
                platform="meta"
              />
            </div>
            
            {/* Meta Posts */}
            <TopPostsWidget
              posts={dashboardData?.topPosts?.filter((p: any) => p.platform === 'meta') || []}
            />
          </TabsContent>

          <TabsContent value="instagram" className="space-y-6">
            {/* Instagram-specific Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EngagementChart
                clientId={clientId}
                timePeriod={timePeriod}
                platform="instagram"
              />
              <FollowerGrowthChart
                clientId={clientId}
                timePeriod={timePeriod}
                platform="instagram"
              />
            </div>
            
            {/* Instagram Posts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TopPostsWidget
                  posts={dashboardData?.topPosts?.filter((p: any) => p.platform === 'instagram') || []}
                />
              </div>
              <div>
                {/* Client-specific widget placeholder for future */}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="twitter" className="space-y-6">
            {/* Twitter-specific Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EngagementChart
                clientId={clientId}
                timePeriod={timePeriod}
                platform="twitter"
              />
              <FollowerGrowthChart
                clientId={clientId}
                timePeriod={timePeriod}
                platform="twitter"
              />
            </div>
            
            {/* Twitter Posts */}
            <TopPostsWidget
              posts={dashboardData?.topPosts?.filter((p: any) => p.platform === 'twitter') || []}
            />
          </TabsContent>

          <TabsContent value="linkedin" className="space-y-6">
            {/* LinkedIn-specific Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EngagementChart
                clientId={clientId}
                timePeriod={timePeriod}
                platform="linkedin"
              />
              <FollowerGrowthChart
                clientId={clientId}
                timePeriod={timePeriod}
                platform="linkedin"
              />
            </div>
            
            {/* LinkedIn Posts */}
            <TopPostsWidget
              posts={dashboardData?.topPosts?.filter((p: any) => p.platform === 'linkedin') || []}
            />
          </TabsContent>

          <TabsContent value="tiktok" className="space-y-6">
            {/* TikTok-specific Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EngagementChart
                clientId={clientId}
                timePeriod={timePeriod}
                platform="tiktok"
              />
              <FollowerGrowthChart
                clientId={clientId}
                timePeriod={timePeriod}
                platform="tiktok"
              />
            </div>
            
            {/* TikTok Posts */}
            <TopPostsWidget
              posts={dashboardData?.topPosts?.filter((p: any) => p.platform === 'tiktok') || []}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="text-center text-sm text-slate-500">
            <p>Powered by SocialPulse Analytics Dashboard</p>
            <p className="mt-1">Real-time social media insights and reporting</p>
          </div>
        </div>
      </footer>
    </div>
  );
}