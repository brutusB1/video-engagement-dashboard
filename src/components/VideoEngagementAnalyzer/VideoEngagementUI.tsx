'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Upload } from 'lucide-react';
import { VideoEngagementAnalyzer } from './analyzer';

interface EngagementData {
  'Tracking Date Formatted': string;
  'Invites': number;
  'Clicks': number;
  'Plays': number;
  'Play Time (Min)': number;
  'Automation Stage': string;
  'Community': string;
}

interface AnalysisResult {
  communityInsights: Record<string, {
    metrics: {
      totalInvites: number;
      clickRate: number;
      playRate: number;
      avgPlayTime: number;
    };
    insights: string[];
  }>;
  followUpStrategies: Record<string, Array<{
    focus: string;
    actions: string[];
  }>>;
}

const VideoEngagementUI: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const parseCSV = (text: string): EngagementData[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

    return lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row = headers.reduce((obj: Record<string, string | number>, header, i) => {
          obj[header] = isNaN(Number(values[i])) ? values[i] : Number(values[i]);
          return obj;
        }, {});
        return {
          'Tracking Date Formatted': row['Tracking Date Formatted'] as string,
          'Invites': row['Invites'] as number,
          'Clicks': row['Clicks'] as number,
          'Plays': row['Plays'] as number,
          'Play Time (Min)': row['Play Time (Min)'] as number,
          'Automation Stage': row['Automation Stage'] as string,
          'Community': row['Community'] as string,
        };
      });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        const text = await file.text();
        const data = parseCSV(text);
        const analyzer = new VideoEngagementAnalyzer(data);
        const report = analyzer.analyze();
        setAnalysisResult(report);
      } catch (error) {
        console.error('Error analyzing file:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Video Engagement Analyzer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">CSV file with video engagement data</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept=".csv" 
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center">Analyzing data...</div>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <div className="space-y-4">
          {Object.entries(analysisResult.communityInsights).map(([community, data]) => (
            <Card key={community}>
              <CardHeader>
                <CardTitle>{community}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Key Metrics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="text-sm text-blue-600">Total Invites</div>
                        <div className="text-xl font-bold">{data.metrics.totalInvites}</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <div className="text-sm text-green-600">Click Rate</div>
                        <div className="text-xl font-bold">{data.metrics.clickRate.toFixed(1)}%</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <div className="text-sm text-purple-600">Play Rate</div>
                        <div className="text-xl font-bold">{data.metrics.playRate.toFixed(1)}%</div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <div className="text-sm text-orange-600">Avg Watch Time</div>
                        <div className="text-xl font-bold">{data.metrics.avgPlayTime.toFixed(1)}m</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Insights</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {data.insights.map((insight, i) => (
                        <li key={i} className="text-sm">{insight}</li>
                      ))}
                    </ul>
                  </div>

                  {analysisResult.followUpStrategies[community] && (
                    <div>
                      <h3 className="font-semibold mb-2">Recommended Strategies</h3>
                      <div className="space-y-3">
                        {analysisResult.followUpStrategies[community].map((strategy, i) => (
                          <div key={i} className="bg-gray-50 p-3 rounded">
                            <div className="font-medium mb-2">{strategy.focus}</div>
                            <ul className="list-disc pl-5 space-y-1">
                              {strategy.actions.map((action, j) => (
                                <li key={j} className="text-sm">{action}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoEngagementUI;