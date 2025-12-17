'use client';

import { useState, useEffect } from 'react';
import TwoColumnLayout from '@/app/components/TwoColumnLayout';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/components/ui/button';
import Avatar from '@/app/components/Avatar';
import { Settings, Calendar, Award, Plus, MessageCircle, FileText, Bookmark } from 'lucide-react';
import { getCurrentUserProfile } from '@/app/lib/getProfile';
import { Profile } from '@/app/types';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    getCurrentUserProfile().then((data) => {
        setProfile(data);
        setLoading(false);
    });
  }, []);

  if (loading) return null; // Or a skeleton loader
  if (!profile) return <div>Profile not found</div>;

  // Sidebar specific for Profile
  const ProfileSidebar = (
    <div className="space-y-4">
        <Card className="overflow-hidden border border-red-500/20 shadow-xl bg-card/60 backdrop-blur-md hover:border-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)] transition-all duration-300">
            {/* Card Header Background - Removed height to allow flex growth if needed, but keeping for visual */}
            <div className="h-24 bg-red-950/20 relative border-b border-red-500/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.1)_1px,transparent_1px)] [background-size:24px_24px] opacity-50"></div>
            </div>
            
            <CardContent className="pt-0 px-6 pb-6 flex flex-col items-center">
                {/* Avatar - Centered with negative margin to pull it up */}
                <div className="-mt-12 mb-4">
                    <div className="rounded-full p-1.5 bg-[#141414] ring-1 ring-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                        <Avatar 
                            src={profile.avatar_url} 
                            alt={profile.full_name} 
                            size={96} 
                            className="rounded-full" 
                        />
                    </div>
                </div>

                {/* Profile Info - Centered */}
                <div className="space-y-6 w-full text-center">
                    <div>
                        <h2 className="font-heading font-bold text-2xl text-white tracking-tight">{profile.full_name}</h2>
                        <p className="text-sm text-muted-foreground font-medium">u/{profile.username}</p>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-6 py-5 border-y border-white/5 w-full">
                        <div className="flex flex-col items-center">
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">Karma</p>
                            <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-white" />
                                <span className="font-bold text-lg text-white">1,240</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">Cake Day</p>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-white" />
                                <span className="font-bold text-lg text-white">{new Date(profile.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <Button className="w-full rounded-lg font-medium border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-100 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.1)]" variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Profile Settings
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );

  return (
    <TwoColumnLayout rightSidebar={ProfileSidebar}>
      {/* Profile Header */}
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="bg-card/40 backdrop-blur-md rounded-xl border border-red-500/20 p-1.5">
            <div className="flex items-center space-x-1">
                {[
                    { id: 'overview', label: 'Overview', icon: FileText },
                    { id: 'posts', label: 'Posts', icon: MessageCircle },
                    { id: 'comments', label: 'Comments', icon: MessageCircle },
                    { id: 'saved', label: 'Saved', icon: Bookmark },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex-1 justify-center
                            ${activeTab === tab.id 
                                ? 'bg-red-500/10 text-white shadow-sm border border-red-500/20' 
                                : 'text-muted-foreground hover:bg-red-500/5 hover:text-white'}
                        `}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-muted-foreground'}`} />
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Content Area - Empty State */}
        <div className="min-h-[400px] flex flex-col items-center justify-center p-12 text-center bg-card/20 rounded-xl border border-dashed border-white/10 hover:border-white/20 transition-colors group">
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5">
                <Plus className="w-8 h-8 text-muted-foreground group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-white mb-2 tracking-tight">
                u/{profile.username} hasn&apos;t posted yet
            </h3>
            <p className="text-muted-foreground max-w-sm mb-8 text-base leading-relaxed">
                Be the first to share something with the community! Posts you create will appear here.
            </p>
            <Button className="rounded-lg font-semibold px-8 py-6 text-white bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                Create Post
            </Button>
        </div>
      </div>
    </TwoColumnLayout>
  );
}
