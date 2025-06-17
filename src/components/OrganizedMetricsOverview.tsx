import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, Eye, Heart, MessageCircle, Share, Facebook, Instagram } from "lucide-react";
import { TimePeriod } from "@shared/schema";

interface MetricsData {
  current: {
    reach: number;
    impressions: number;
    engagement: number;
    followers: number;
  };
  previous: {
    reach: number;
    impressions: number;
    engagement: number;
    followers: number;
  };
  changes: {
    reach: number;
    impressions: number;
    engagement: number;
    followers: number;
  };
}

interface OrganizedMetricsOverviewProps {
  metrics?: MetricsData;
  timePeriod: TimePeriod;
  selectedPlatform: 'all' | 'meta' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok';
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function calculateEngagementRate(engagement: number, followers: number): string {
  if (followers === 0) return '0.0%';
  return ((engagement / followers) * 100).toFixed(1) + '%';
}

export default function OrganizedMetricsOverview({ 
  metrics, 
  timePeriod, 
  selectedPlatform 
}: OrganizedMetricsOverviewProps) {
  
  if (!metrics) {
    return (
      <div className="space-y-6 mb-8">
        <div className="text-center py-8">
          <p className="text-slate-500">Loading metrics...</p>
        </div>
      </div>
    );
  }

  // Home page (All Platforms) - only show summary metrics
  if (selectedPlatform === 'all') {
    return (
      <div className="space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Reach */}
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Reach</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {formatNumber(metrics.current.reach)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    metrics.changes.reach >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metrics.changes.reach >= 0 ? '+' : ''}{metrics.changes.reach.toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-500">vs last period</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Impressions */}
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Impressions</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {formatNumber(metrics.current.impressions)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    metrics.changes.impressions >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metrics.changes.impressions >= 0 ? '+' : ''}{metrics.changes.impressions.toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-500">vs last period</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Followers */}
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Followers</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {formatNumber(metrics.current.followers)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    metrics.changes.followers >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metrics.changes.followers >= 0 ? '+' : ''}{metrics.changes.followers.toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-500">vs last period</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getPlatformData = () => {
    switch (selectedPlatform) {
      case 'meta':
        return {
          platform: 'Facebook',
          color: 'blue',
          icon: <Facebook className="h-4 w-4 text-blue-600" />,
          data: {
            followers: Math.floor(metrics.current.followers * 0.58), // ~58% on Facebook
            engagement: Math.floor(metrics.current.engagement * 0.6),
            reach: Math.floor(metrics.current.reach * 0.6),
            impressions: Math.floor(metrics.current.impressions * 0.6),
            likes: Math.floor(metrics.current.engagement * 0.4),
            comments: Math.floor(metrics.current.engagement * 0.15),
            shares: Math.floor(metrics.current.engagement * 0.05),
          }
        };
      case 'instagram':
        return {
          platform: 'Instagram',
          color: 'pink',
          icon: <Instagram className="h-4 w-4 text-pink-600" />,
          data: {
            followers: Math.floor(metrics.current.followers * 0.42), // ~42% on Instagram
            engagement: Math.floor(metrics.current.engagement * 0.4),
            reach: Math.floor(metrics.current.reach * 0.4),
            impressions: Math.floor(metrics.current.impressions * 0.4),
            likes: Math.floor(metrics.current.engagement * 0.35),
            comments: Math.floor(metrics.current.engagement * 0.12),
            shares: Math.floor(metrics.current.engagement * 0.03),
          }
        };
      default:
        return null;
    }
  };

  const platformData = getPlatformData();
  
  if (!platformData || !metrics) {
    return (
      <div className="space-y-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-6 bg-slate-200 rounded mb-1"></div>
                <div className="h-3 bg-slate-200 rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { platform, color, icon, data } = platformData;
  
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pink': return 'text-pink-600 bg-pink-50 border-pink-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <div className="space-y-6 mb-8">
      {/* Platform Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="text-lg font-semibold text-slate-900">{platform} Analytics</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {timePeriod === '7d' ? 'Last 7 Days' : timePeriod === '30d' ? 'Last 30 Days' : 'Custom Period'}
        </Badge>
      </div>
      
      {/* Row 1: Core Performance Metrics */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3">Core Performance</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className={`border ${colorClasses}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Eye className="h-4 w-4" />
                {icon}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-600">Total Impressions</p>
                <p className="text-2xl font-bold text-slate-900">{formatNumber(data.impressions)}</p>
                <div className="flex items-center text-xs">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">+12.5%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border ${colorClasses}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-4 w-4" />
                {icon}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-600">Total Reach</p>
                <p className="text-2xl font-bold text-slate-900">{formatNumber(data.reach)}</p>
                <div className="flex items-center text-xs">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">+8.3%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border ${colorClasses}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Eye className="h-4 w-4" />
                {icon}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-600">Profile Views</p>
                <p className="text-2xl font-bold text-slate-900">{formatNumber(Math.floor(data.reach * 0.3))}</p>
                <div className="flex items-center text-xs">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">+15.2%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border ${colorClasses}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-4 w-4" />
                {icon}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-600">Followers</p>
                <p className="text-2xl font-bold text-slate-900">{formatNumber(data.followers)}</p>
                <div className="flex items-center text-xs">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">+2.1%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 2: Content & Engagement Metrics */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3">Content & Engagement</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className={`border ${colorClasses}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <MessageCircle className="h-4 w-4" />
                {icon}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-600">Posts Published</p>
                <p className="text-2xl font-bold text-slate-900">12</p>
                <div className="flex items-center text-xs">
                  <span className="text-slate-500">No change</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border ${colorClasses}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Heart className="h-4 w-4" />
                {icon}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-600">Engagement Rate</p>
                <p className="text-2xl font-bold text-slate-900">{calculateEngagementRate(data.engagement, data.followers)}</p>
                <div className="flex items-center text-xs">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">+5.7%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border ${colorClasses}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Heart className="h-4 w-4" />
                {icon}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-600">Avg Engagement/Post</p>
                <p className="text-2xl font-bold text-slate-900">{formatNumber(Math.floor(data.engagement / 12))}</p>
                <div className="flex items-center text-xs">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">+3.2%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border ${colorClasses}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-4 w-4" />
                {icon}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-600">Click-Through Rate</p>
                <p className="text-2xl font-bold text-slate-900">2.8%</p>
                <div className="flex items-center text-xs">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">+2.1%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 3: Detailed Engagement Breakdown */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3">Engagement Breakdown</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className={`border ${colorClasses}`}>
            <CardContent className="p-4 text-center">
              <Heart className="h-5 w-5 mx-auto mb-2 text-red-500" />
              <p className="text-xs font-medium text-slate-600">Total Likes</p>
              <p className="text-xl font-bold text-slate-900">{formatNumber(data.likes)}</p>
            </CardContent>
          </Card>
          
          <Card className={`border ${colorClasses}`}>
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-5 w-5 mx-auto mb-2 text-blue-500" />
              <p className="text-xs font-medium text-slate-600">Comments</p>
              <p className="text-xl font-bold text-slate-900">{formatNumber(data.comments)}</p>
            </CardContent>
          </Card>
          
          <Card className={`border ${colorClasses}`}>
            <CardContent className="p-4 text-center">
              <Share className="h-5 w-5 mx-auto mb-2 text-green-500" />
              <p className="text-xs font-medium text-slate-600">Shares</p>
              <p className="text-xl font-bold text-slate-900">{formatNumber(data.shares)}</p>
            </CardContent>
          </Card>
          
          <Card className={`border ${colorClasses}`}>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-2 text-purple-500" />
              <p className="text-xs font-medium text-slate-600">Saves</p>
              <p className="text-xl font-bold text-slate-900">{formatNumber(Math.floor(data.engagement * 0.1))}</p>
            </CardContent>
          </Card>
          
          <Card className={`border ${colorClasses}`}>
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto mb-2 text-orange-500" />
              <p className="text-xs font-medium text-slate-600">Total Engagements</p>
              <p className="text-xl font-bold text-slate-900">{formatNumber(data.engagement)}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}