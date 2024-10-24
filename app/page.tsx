import VideoEngagementUI from '../src/components/VideoEngagementAnalyzer/VideoEngagementUI';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Video Engagement Analysis</h1>
        <VideoEngagementUI />
      </div>
    </main>
  );
}