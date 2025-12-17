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
        <Card className="overflow-hidden">
            <div className="bg-primary/10 h-12"></div>
            <CardContent className="pt-0 relative">
                <div className="absolute -top-6 left-4">
                    <Avatar src={profile.avatar_url} alt={profile.full_name} size={64} className="border-4 border-white" />
                </div>
                <div className="mt-12 space-y-4">
                    <div>
                        <h2 className="font-heading font-bold text-lg">{profile.full_name}</h2>
                        <p className="text-sm text-gray-500">u/{profile.username}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Karma</p>
                            <div className="flex items-center gap-1">
                                <Award className="w-4 h-4 text-primary" />
                                <span className="font-bold text-sm">1,240</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Cake Day</p>
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span className="font-bold text-sm">{new Date(profile.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <Button className="w-full rounded-full" variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );

  return (
    <TwoColumnLayout rightSidebar={ProfileSidebar}>
      {/* Profile Header */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 overflow-x-auto scrollbar-hide">
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
                            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                            ${activeTab === tab.id 
                                ? 'bg-gray-100 text-gray-900 font-bold' 
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                        `}
                    >
                        {/* Underline indicator for active state style requested */}
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : 'text-gray-400'}`} />
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Content Area - Empty State */}
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-dashed border-gray-300">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">
                u/{profile.username} hasn't posted yet
            </h3>
            <p className="text-gray-500 max-w-sm mb-6">
                Be the first to share something with the community! Posts you create will appear here.
            </p>
            <Button className="rounded-full font-bold px-8">
                Create Post
            </Button>
        </div>
      </div>
    </TwoColumnLayout>
  );
}
