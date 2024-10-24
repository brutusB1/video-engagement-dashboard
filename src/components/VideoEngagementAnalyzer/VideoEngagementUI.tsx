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
          const row = headers.reduce((obj: Partial<EngagementData>, header, i) => {
            obj[header as keyof EngagementData] = isNaN(Number(values[i])) ? values[i] : Number(values[i]) as any;
            return obj;
          }, {});
          return row as EngagementData;
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
      <div className="max-w-5xl mx-auto p-6 space-y-8 bg-gray-100 min-h-screen">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900">Video Engagement Analyzer</h1>
          <p className="text-lg text-gray-600">
            Upload your CSV to generate insights and strategies to boost video performance.
          </p>
        </header>
  
        <Card>
          <CardHeader>
            <CardTitle>Upload Your Engagement Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">CSV file with video engagement data</p>
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
            <CardContent className="p-6 text-center">
              <div className="animate-pulse text-lg font-medium text-gray-700">
                Analyzing data... Please wait.
              </div>
            </CardContent>
          </Card>
        )}
  
        {analysisResult && (
          <section className="space-y-6">
            {Object.entries(analysisResult.communityInsights).map(([community, data]) => (
              <Card key={community}>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">{community}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2 text-gray-800">Key Metrics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-blue-100 p-4 rounded shadow-sm">
                          <div className="text-sm text-blue-800">Total Invites</div>
                          <div className="text-2xl font-bold">{data.metrics.totalInvites}</div>
                        </div>
                        <div className="bg-green-100 p-4 rounded shadow-sm">
                          <div className="text-sm text-green-800">Click Rate</div>
                          <div className="text-2xl font-bold">{data.metrics.clickRate.toFixed(1)}%</div>
                        </div>
                        <div className="bg-purple-100 p-4 rounded shadow-sm">
                          <div className="text-sm text-purple-800">Play Rate</div>
                          <div className="text-2xl font-bold">{data.metrics.playRate.toFixed(1)}%</div>
                        </div>
                        <div className="bg-orange-100 p-4 rounded shadow-sm">
                          <div className="text-sm text-orange-800">Avg Watch Time</div>
                          <div className="text-2xl font-bold">{data.metrics.avgPlayTime.toFixed(1)}m</div>
                        </div>
                      </div>
                    </div>
  
                    <div>
                      <h3 className="font-semibold mb-2 text-gray-800">Insights</h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        {data.insights.map((insight, i) => (
                          <li key={i}>{insight}</li>
                        ))}
                      </ul>
                    </div>
  
                    {analysisResult.followUpStrategies[community] && (
                      <div>
                        <h3 className="font-semibold mb-2 text-gray-800">Recommended Strategies</h3>
                        <div className="space-y-2">
                          {analysisResult.followUpStrategies[community].map((strategy, i) => (
                            <div key={i} className="bg-gray-50 p-3 rounded">
                              <div className="font-medium mb-1">{strategy.focus}</div>
                              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                {strategy.actions.map((action, j) => (
                                  <li key={j}>{action}</li>
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
          </section>
        )}
      </div>
    );
  };
  
  export default VideoEngagementUI;