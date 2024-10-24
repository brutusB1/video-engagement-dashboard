interface EngagementData {
    'Tracking Date Formatted': string;
    'Invites': string | number;
    'Clicks': string | number;
    'Plays': string | number;
    'Play Time (Min)': string | number;
    'Automation Stage': string;
    'Community': string;
}

interface ProcessedData extends Omit<EngagementData, 'Tracking Date Formatted' | 'Invites' | 'Clicks' | 'Plays' | 'Play Time (Min)'> {
    'Tracking Date Formatted': Date;
    'Invites': number;
    'Clicks': number;
    'Plays': number;
    'Play Time (Min)': number;
}

interface StageMetrics {
    invites: number;
    clicks: number;
    plays: number;
    playTime: number;
    count: number;
    avgPlayTime?: number;
}

interface CommunityMetrics {
    totalInvites: number;
    totalClicks: number;
    totalPlays: number;
    totalPlayTime: number;
    clickRate: number;
    playRate: number;
    avgPlayTime: number;
    stageBreakdown: Record<string, StageMetrics>;
}

interface Strategy {
    focus: string;
    actions: string[];
}

interface CommunityInsight {
    metrics: CommunityMetrics;
    insights: string[];
}

interface AnalysisResult {
    communityInsights: Record<string, CommunityInsight>;
    followUpStrategies: Record<string, Strategy[]>;
    monthlyTrends: Record<string, StageMetrics>;
    analysisDate: string;
}

export class VideoEngagementAnalyzer {
    private rawData: EngagementData[];
    private processedData: ProcessedData[];

    constructor(data: EngagementData[]) {
        this.rawData = data;
        this.processedData = this.preprocessData(data);
    }

    private preprocessData(data: EngagementData[]): ProcessedData[] {
        return data.map(row => ({
            ...row,
            'Tracking Date Formatted': new Date(row['Tracking Date Formatted']),
            'Invites': Number(row['Invites']) || 0,
            'Clicks': Number(row['Clicks']) || 0,
            'Plays': Number(row['Plays']) || 0,
            'Play Time (Min)': Number(row['Play Time (Min)']) || 0
        }));
    }

    private calculateCommunityMetrics(communityData: ProcessedData[]): CommunityMetrics {
        const metrics = {
            totalInvites: communityData.reduce((sum, row) => sum + row['Invites'], 0),
            totalClicks: communityData.reduce((sum, row) => sum + row['Clicks'], 0),
            totalPlays: communityData.reduce((sum, row) => sum + row['Plays'], 0),
            totalPlayTime: communityData.reduce((sum, row) => sum + row['Play Time (Min)'], 0),
            clickRate: 0,
            playRate: 0,
            avgPlayTime: 0,
            stageBreakdown: this.calculateStageBreakdown(communityData)
        };

        metrics.clickRate = metrics.totalInvites ? (metrics.totalClicks / metrics.totalInvites * 100) : 0;
        metrics.playRate = metrics.totalClicks ? (metrics.totalPlays / metrics.totalClicks * 100) : 0;
        metrics.avgPlayTime = metrics.totalPlays ? (metrics.totalPlayTime / metrics.totalPlays) : 0;

        return metrics;
    }

    private calculateStageBreakdown(data: ProcessedData[]): Record<string, StageMetrics> {
        const stages: Record<string, StageMetrics> = {};
        
        data.forEach(row => {
            if (!stages[row['Automation Stage']]) {
                stages[row['Automation Stage']] = {
                    invites: 0,
                    clicks: 0,
                    plays: 0,
                    playTime: 0,
                    count: 0
                };
            }
            
            const stage = stages[row['Automation Stage']];
            stage.invites += row['Invites'];
            stage.clicks += row['Clicks'];
            stage.plays += row['Plays'];
            stage.playTime += row['Play Time (Min)'];
            stage.count++;
        });

        Object.keys(stages).forEach(stage => {
            const stageData = stages[stage];
            stageData.avgPlayTime = stageData.plays ? stageData.playTime / stageData.plays : 0;
        });

        return stages;
    }

    private generateInsights(metrics: CommunityMetrics): string[] {
        const insights: string[] = [];

        if (metrics.clickRate > 50) {
            insights.push(`Strong initial engagement with ${metrics.clickRate.toFixed(1)}% click rate`);
        } else if (metrics.clickRate < 30) {
            insights.push(`Opportunity to improve initial engagement (${metrics.clickRate.toFixed(1)}% click rate)`);
        }

        if (metrics.avgPlayTime > 5) {
            insights.push(`Excellent average watch time of ${metrics.avgPlayTime.toFixed(1)} minutes`);
        }

        const stages = Object.entries(metrics.stageBreakdown);
        const bestStage = stages.reduce((best, current) => 
            current[1].plays > best[1].plays ? current : best
        );
        insights.push(`Strongest performance in ${bestStage[0]} stage`);

        return insights;
    }

    private generateStrategies(metrics: CommunityMetrics): Strategy[] {
        const strategies: Strategy[] = [];

        if (metrics.clickRate < 40) {
            strategies.push({
                focus: 'Improve Initial Engagement',
                actions: [
                    'A/B test video thumbnail images',
                    'Optimize video titles for clarity and impact',
                    'Send invites during peak engagement hours',
                    'Include personalized preview content in invitations'
                ]
            });
        }

        if (metrics.playRate < 70) {
            strategies.push({
                focus: 'Increase Play Rate',
                actions: [
                    'Add social proof elements to landing pages',
                    'Include video duration in preview',
                    'Create stage-specific video content',
                    'Implement one-click play functionality'
                ]
            });
        }

        if (metrics.avgPlayTime < 3) {
            strategies.push({
                focus: 'Extend Watch Time',
                actions: [
                    'Add chapter markers for longer videos',
                    'Include interactive elements at key dropoff points',
                    'Create shorter, more focused video content',
                    'Add compelling calls-to-action throughout'
                ]
            });
        }

        return strategies;
    }

    private calculateMonthlyTrends(): Record<string, StageMetrics> {
        const monthlyData: Record<string, StageMetrics> = {};

        this.processedData.forEach(row => {
            const monthKey = row['Tracking Date Formatted'].toISOString().slice(0, 7);
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    invites: 0,
                    clicks: 0,
                    plays: 0,
                    playTime: 0,
                    count: 0
                };
            }

            const month = monthlyData[monthKey];
            month.invites += row['Invites'];
            month.clicks += row['Clicks'];
            month.plays += row['Plays'];
            month.playTime += row['Play Time (Min)'];
            month.count++;
        });

        Object.keys(monthlyData).forEach(month => {
            const data = monthlyData[month];
            data.avgPlayTime = data.plays ? data.playTime / data.plays : 0;
        });

        return monthlyData;
    }

    analyze(): AnalysisResult {
        const communities = [...new Set(this.processedData.map(row => row['Community']))];
        const analysis: AnalysisResult = {
            communityInsights: {},
            followUpStrategies: {},
            monthlyTrends: this.calculateMonthlyTrends(),
            analysisDate: new Date().toISOString().slice(0, 10)
        };

        communities.forEach(community => {
            const communityData = this.processedData.filter(row => row['Community'] === community);
            const metrics = this.calculateCommunityMetrics(communityData);
            
            analysis.communityInsights[community] = {
                metrics,
                insights: this.generateInsights(metrics)
            };

            analysis.followUpStrategies[community] = this.generateStrategies(metrics);
        });

        return analysis;
    }
}