interface MetaApiResponse {
  data?: any[];
  paging?: {
    next?: string;
    previous?: string;
  };
  error?: {
    message: string;
    code: number;
  };
}

interface MetaInsightsResponse {
  data: Array<{
    name: string;
    values: Array<{
      value: number;
      end_time: string;
    }>;
  }>;
}

export class MetaApiService {
  private baseUrl = 'https://graph.facebook.com/v18.0';

  async makeRequest(endpoint: string, accessToken: string): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`Meta API request failed: ${response.status} ${response.statusText} - ${responseText}`);
    }

    return response.json();
  }

  async getPageInsights(pageId: string, accessToken: string, metrics: string[], since?: string, until?: string): Promise<MetaInsightsResponse> {
    const metricsParam = metrics.join(',');
    let endpoint = `/${pageId}/insights?metric=${metricsParam}`;
    
    if (since) endpoint += `&since=${since}`;
    if (until) endpoint += `&until=${until}`;

    return this.makeRequest(endpoint, accessToken);
  }

  async getPagePosts(pageId: string, accessToken: string, limit = 25): Promise<MetaApiResponse> {
    const endpoint = `/${pageId}/posts?fields=id,message,created_time,attachments{media},insights.metric(post_impressions,post_engaged_users,post_reactions_like_total,post_reactions_love_total,post_reactions_wow_total,post_reactions_haha_total,post_reactions_sorry_total,post_reactions_anger_total,post_comments,post_shares)&limit=${limit}`;
    return this.makeRequest(endpoint, accessToken);
  }

  async getInstagramInsights(accountId: string, accessToken: string, metrics: string[], period = 'day', since?: string, until?: string): Promise<MetaInsightsResponse> {
    const metricsParam = metrics.join(',');
    let endpoint = `/${accountId}/insights?metric=${metricsParam}&period=${period}`;
    
    if (since) endpoint += `&since=${since}`;
    if (until) endpoint += `&until=${until}`;

    return this.makeRequest(endpoint, accessToken);
  }

  async getInstagramMedia(accountId: string, accessToken: string, limit = 25): Promise<MetaApiResponse> {
    const endpoint = `/${accountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,insights.metric(impressions,reach,likes,comments,shares,saved)&limit=${limit}`;
    return this.makeRequest(endpoint, accessToken);
  }

  async getAccountInfo(accountId: string, accessToken: string, platform: 'meta' | 'instagram'): Promise<any> {
    if (platform === 'meta') {
      return this.makeRequest(`/${accountId}?fields=name,followers_count,fan_count`, accessToken);
    } else {
      return this.makeRequest(`/${accountId}?fields=name,followers_count,media_count`, accessToken);
    }
  }

  // Helper method to calculate date ranges
  getDatesForPeriod(period: '7d' | '30d' | '90d' | 'custom', customStart?: string, customEnd?: string): { since: string; until: string } {
    const now = new Date();
    const until = now.toISOString().split('T')[0];
    
    let since: string;
    
    switch (period) {
      case '7d':
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        since = sevenDaysAgo.toISOString().split('T')[0];
        break;
      case '30d':
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        since = thirtyDaysAgo.toISOString().split('T')[0];
        break;
      case '90d':
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        since = ninetyDaysAgo.toISOString().split('T')[0];
        break;
      case 'custom':
        since = customStart || until;
        break;
      default:
        since = until;
    }
    
    return { since, until };
  }
}

export const metaApi = new MetaApiService();
