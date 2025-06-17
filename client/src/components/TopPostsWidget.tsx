import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share, TrendingUp } from "lucide-react";
import { Post } from "@shared/schema";

interface TopPostsWidgetProps {
  posts: Post[];
}

export default function TopPostsWidget({ posts }: TopPostsWidgetProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const calculateGrowthRate = (post: Post): number => {
    // Mock growth rate calculation
    const totalEngagement = post.likes + post.comments + post.shares;
    return Math.min(Math.max(totalEngagement / 100, 5), 50);
  };

  if (posts.length === 0) {
    return (
      <Card className="shadow-sm border border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Top Performing Posts
              </CardTitle>
              <p className="text-sm text-slate-500">Highest engagement in the last 7 days</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-slate-400">No posts available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Top Performing Posts
            </CardTitle>
            <p className="text-sm text-slate-500">Highest engagement in the last 7 days</p>
          </div>
          <Button variant="ghost" size="sm" className="text-primary hover:text-blue-800">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.slice(0, 3).map((post) => (
            <div key={post.id} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt="Post content"
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-slate-400 text-xs">No image</span>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 line-clamp-2 mb-2">
                      {post.content.length > 100 
                        ? `${post.content.substring(0, 100)}...` 
                        : post.content
                      }
                    </p>
                    <div className="flex items-center space-x-4 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {post.platform === 'meta' ? 'Meta' : 'Instagram'}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-green-600 text-sm ml-4">
                    <TrendingUp className="h-3 w-3" />
                    <span>+{calculateGrowthRate(post).toFixed(0)}%</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-slate-600">{formatNumber(post.likes)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-slate-600">{formatNumber(post.comments)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Share className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-slate-600">{formatNumber(post.shares)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
