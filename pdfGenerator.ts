import { Client, Metric, Post } from "@shared/schema";

interface ReportData {
  client: Client;
  metrics: {
    current: Metric[];
    previous: Metric[];
  };
  topPosts: Post[];
  period: string;
  generatedAt: Date;
}

export class PDFGenerator {
  async generateReport(data: ReportData): Promise<Buffer> {
    // For MVP, we'll generate a simple HTML-based PDF
    // In production, you'd use a proper PDF library like puppeteer
    
    const html = this.generateHTMLReport(data);
    
    // Mock PDF generation - in production, use puppeteer or similar
    const pdfContent = this.htmlToPdfMock(html);
    
    return Buffer.from(pdfContent, 'utf-8');
  }

  private generateHTMLReport(data: ReportData): string {
    const { client, metrics, topPosts, period, generatedAt } = data;
    
    const currentMetrics = this.aggregateMetrics(metrics.current);
    const previousMetrics = this.aggregateMetrics(metrics.previous);
    
    const changes = this.calculateChanges(currentMetrics, previousMetrics);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Social Media Analytics Report - ${client.name}</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { border-bottom: 3px solid #1E40AF; padding-bottom: 20px; margin-bottom: 30px; }
        .client-name { font-size: 28px; font-weight: bold; color: #1E40AF; margin: 0; }
        .report-info { font-size: 14px; color: #666; margin-top: 5px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #1E40AF; }
        .metric-title { font-size: 14px; color: #666; margin-bottom: 5px; }
        .metric-value { font-size: 32px; font-weight: bold; color: #333; margin-bottom: 5px; }
        .metric-change { font-size: 14px; }
        .positive { color: #059669; }
        .negative { color: #DC2626; }
        .section-title { font-size: 20px; font-weight: bold; margin: 30px 0 15px 0; color: #1E40AF; }
        .post-item { background: #f8f9fa; padding: 15px; margin-bottom: 15px; border-radius: 8px; }
        .post-content { font-weight: 500; margin-bottom: 10px; }
        .post-stats { display: flex; gap: 20px; font-size: 14px; color: #666; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="client-name">${client.name}</h1>
        <div class="report-info">
            Social Media Analytics Report | ${period} | Generated on ${generatedAt.toLocaleDateString()}
        </div>
    </div>
    
    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-title">Total Reach</div>
            <div class="metric-value">${currentMetrics.reach.toLocaleString()}</div>
            <div class="metric-change ${changes.reach >= 0 ? 'positive' : 'negative'}">
                ${changes.reach >= 0 ? '+' : ''}${changes.reach.toFixed(1)}% vs previous period
            </div>
        </div>
        
        <div class="metric-card">
            <div class="metric-title">Total Impressions</div>
            <div class="metric-value">${currentMetrics.impressions.toLocaleString()}</div>
            <div class="metric-change ${changes.impressions >= 0 ? 'positive' : 'negative'}">
                ${changes.impressions >= 0 ? '+' : ''}${changes.impressions.toFixed(1)}% vs previous period
            </div>
        </div>
        
        <div class="metric-card">
            <div class="metric-title">Total Engagement</div>
            <div class="metric-value">${currentMetrics.engagement.toLocaleString()}</div>
            <div class="metric-change ${changes.engagement >= 0 ? 'positive' : 'negative'}">
                ${changes.engagement >= 0 ? '+' : ''}${changes.engagement.toFixed(1)}% vs previous period
            </div>
        </div>
        
        <div class="metric-card">
            <div class="metric-title">Followers</div>
            <div class="metric-value">${currentMetrics.followers.toLocaleString()}</div>
            <div class="metric-change ${changes.followers >= 0 ? 'positive' : 'negative'}">
                ${changes.followers >= 0 ? '+' : ''}${changes.followers.toFixed(1)}% vs previous period
            </div>
        </div>
    </div>
    
    <h2 class="section-title">Top Performing Posts</h2>
    ${topPosts.map(post => `
        <div class="post-item">
            <div class="post-content">${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</div>
            <div class="post-stats">
                <span>👍 ${post.likes} likes</span>
                <span>💬 ${post.comments} comments</span>
                <span>🔗 ${post.shares} shares</span>
                <span>📅 ${new Date(post.publishedAt).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('')}
    
    <div class="footer">
        This report was automatically generated by SocialPulse Analytics Dashboard.
        For questions or support, please contact your account manager.
    </div>
</body>
</html>`;
  }

  private aggregateMetrics(metrics: Metric[]): { reach: number; impressions: number; engagement: number; followers: number } {
    return metrics.reduce((acc, metric) => ({
      reach: acc.reach + (metric.reach || 0),
      impressions: acc.impressions + (metric.impressions || 0),
      engagement: acc.engagement + (metric.engagement || 0),
      followers: Math.max(acc.followers, metric.followers || 0), // Use max for followers as it's a current count
    }), { reach: 0, impressions: 0, engagement: 0, followers: 0 });
  }

  private calculateChanges(current: any, previous: any): any {
    const calculateChange = (curr: number, prev: number): number => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    return {
      reach: calculateChange(current.reach, previous.reach),
      impressions: calculateChange(current.impressions, previous.impressions),
      engagement: calculateChange(current.engagement, previous.engagement),
      followers: calculateChange(current.followers, previous.followers),
    };
  }

  private htmlToPdfMock(html: string): string {
    // This is a mock implementation
    // In production, use puppeteer or a similar library to convert HTML to PDF
    return `PDF Content for: ${html.substring(0, 100)}...`;
  }
}

export const pdfGenerator = new PDFGenerator();
