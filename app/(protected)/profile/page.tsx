'use client';

import { useState, useEffect } from 'react';
import TwoColumnLayout from '@/app/components/TwoColumnLayout';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/components/ui/button';
import Avatar from '@/app/components/Avatar';
import { Settings, Calendar, Award, Plus, MessageCircle, FileText, Bookmark, Edit2 } from 'lucide-react';
import { getCurrentUserProfile } from '@/app/lib/getProfile';
import { Profile, Post } from '@/app/types';
import PostItem from '@/app/components/PostItem';
import PostList from '@/app/components/PostList';
import Link from 'next/link';
import AvatarEditor from '@/app/components/AvatarEditor';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [myComments, setMyComments] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);

  useEffect(() => {
    getCurrentUserProfile().then((data) => {
        setProfile(data);
        setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (activeTab === 'saved') fetchSavedPosts();
    if (activeTab === 'posts') fetchMyPosts();
    if (activeTab === 'comments') fetchMyComments();
  }, [activeTab]);

  const fetchMyPosts = async () => {
    setLoadingData(true);
    try {
      const res = await fetch('/api/posts/user');
      if (res.ok) setMyPosts(await res.json());
    } finally { setLoadingData(false); }
  };

  const fetchMyComments = async () => {
    setLoadingData(true);
    try {
      const res = await fetch('/api/comments/user');
      if (res.ok) setMyComments(await res.json());
    } finally { setLoadingData(false); }
  };

  const fetchSavedPosts = async () => {
    setLoadingSaved(true);
    try {
      const response = await fetch('/api/posts/saved');
      if (response.ok) {
        const data = await response.json();
        setSavedPosts(data);
      }
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleToggleSave = async (postId: string) => {
    // For the saved tab, if we unsave, we should remove it from the list
    try {
      const response = await fetch('/api/posts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        setSavedPosts(prev => prev.filter(p => p.id !== postId));
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const handleAvatarSave = (newUrl: string) => {
    if (profile) {
      setProfile({ ...profile, avatar_url: newUrl });
    }
  };

  const CommentItem = ({ comment }: { comment: any }) => (
    <div className="bg-card/40 backdrop-blur-sm border border-white/5 rounded-xl p-4 mb-4 hover:border-white/10 transition-all">
      <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
        <MessageCircle size={12} />
        <span>Commented on:</span>
        <Link href={`/posts/${comment.post.id}`} className="text-primary hover:underline truncate max-w-[300px]">
           {comment.post.title}
        </Link>
        <span className="text-white/20">•</span>
        <span>{new Date(comment.created_at).toLocaleDateString()}</span>
      </div>
      <p className="text-sm text-white/90">{comment.body}</p>
    </div>
  );

  if (loading) return null; // Or a skeleton loader
  if (!profile) return <div>Profile not found</div>;

  // Sidebar specific for Profile
  const ProfileSidebar = (
    <div className="space-y-4">
        <Card className="overflow-hidden border border-[#A6C8D5]/20 shadow-xl bg-card/60 backdrop-blur-md hover:border-[#A6C8D5]/30 hover:shadow-[0_0_30px_rgba(166,200,213,0.1)] transition-all duration-300">
            {/* Card Header Background - Removed height to allow flex growth if needed, but keeping for visual */}
            <div className="h-24 bg-[#A6C8D5]/20 relative border-b border-[#A6C8D5]/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(166,200,213,0.1)_1px,transparent_1px)] [background-size:24px_24px] opacity-50"></div>
            </div>
            
            <CardContent className="pt-0 px-6 pb-6 flex flex-col items-center">
                {/* Avatar - Centered with negative margin to pull it up */}
                <div className="-mt-12 mb-4 relative group">
                    <div className="rounded-full p-1.5 bg-[#141414] ring-1 ring-[#A6C8D5]/30 shadow-[0_0_20px_rgba(166,200,213,0.2)]">
                        <Avatar 
                            src={profile.avatar_url} 
                            alt={profile.full_name} 
                            size={96} 
                            className="rounded-full" 
                        />
                    </div>
                    {/* Edit Button */}
                        <button 
                        onClick={() => setShowAvatarEditor(true)}
                        className="absolute bottom-0 right-0 p-2 bg-[#A6C8D5] rounded-full text-white shadow-lg hover:bg-[#A6C8D5]/80 transition-transform hover:scale-105"
                        title="Edit Avatar"
                    >
                        <Edit2 size={14} />
                    </button>
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
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1.5 font-heading">Flux</p>
                            <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-white" />
                                <span className="font-heading font-bold text-lg text-white">1,240</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1.5 font-heading">Joined</p>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-white" />
                                <span className="font-heading font-bold text-lg text-white">{new Date(profile.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <Link href="/profile/settings" className="w-full">
                        <Button className="w-full rounded-lg font-medium border border-[#A6C8D5]/20 bg-[#A6C8D5]/10 hover:bg-[#A6C8D5]/20 text-[#A6C8D5] transition-all shadow-sm hover:shadow-[0_0_15px_rgba(166,200,213,0.1)]" variant="outline">
                            <Settings className="w-4 h-4 mr-2" />
                            Profile Settings
                        </Button>
                    </Link>
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
        <div className="bg-card/40 backdrop-blur-md rounded-xl border border-[#A6C8D5]/20 p-1.5">
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
                                ? 'bg-[#A6C8D5]/10 text-white shadow-sm border border-[#A6C8D5]/20' 
                                : 'text-muted-foreground hover:bg-[#A6C8D5]/5 hover:text-white'}
                        `}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-muted-foreground'}`} />
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Content Area */}
        {activeTab === 'posts' ? (
           loadingData ? (
             <div className="flex justify-center py-12">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
             </div>
           ) : myPosts.length > 0 ? (
             <PostList>
               {myPosts.map(post => (
                 <PostItem
                   key={post.id}
                   post={post}
                   userVote={(post as any).user_vote || 0}
                   onVoteChange={() => {}}
                   commentCount={post.comment_count || 0}
                   isExpanded={false}
                   onToggleComments={() => {}}
                 />
               ))}
             </PostList>
           ) : (
             <div className="min-h-[400px] flex flex-col items-center justify-center p-12 text-center bg-card/20 rounded-xl border border-dashed border-white/10 hover:border-white/20 transition-colors">
               <MessageCircle className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
               <h3 className="text-xl font-heading font-semibold text-white mb-2 tracking-tight">No posts yet</h3>
               <p className="text-muted-foreground max-w-sm text-base leading-relaxed mb-6">
                 Share your thoughts with the community.
               </p>
               <Button className="rounded-lg font-semibold px-8 py-3 text-white bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all">
                  Create Post
               </Button>
             </div>
           )
        ) : activeTab === 'comments' ? (
           loadingData ? (
             <div className="flex justify-center py-12">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
             </div>
           ) : myComments.length > 0 ? (
             <div className="space-y-4">
               {myComments.map(comment => (
                 <CommentItem key={comment.id} comment={comment} />
               ))}
             </div>
           ) : (
             <div className="min-h-[400px] flex flex-col items-center justify-center p-12 text-center bg-card/20 rounded-xl border border-dashed border-white/10 hover:border-white/20 transition-colors">
               <MessageCircle className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
               <h3 className="text-xl font-heading font-semibold text-white mb-2 tracking-tight">No comments yet</h3>
               <p className="text-muted-foreground max-w-sm text-base leading-relaxed">
                 Join the discussion on posts that interest you.
               </p>
             </div>
           )
        ) : activeTab === 'saved' ? (
           loadingSaved ? (
             <div className="flex justify-center py-12">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
             </div>
           ) : savedPosts.length > 0 ? (
             <PostList>
               {savedPosts.map(post => (
                 <PostItem
                   key={post.id}
                   post={post}
                   userVote={(post as any).user_vote || 0}
                   onVoteChange={() => {}} // Read-only or implement vote logic if needed
                   commentCount={post.comment_count || 0}
                   isExpanded={false}
                   onToggleComments={() => {}}
                   isSaved={true}
                   onToggleSave={handleToggleSave}
                 />
               ))}
             </PostList>
           ) : (
             <div className="min-h-[400px] flex flex-col items-center justify-center p-12 text-center bg-card/20 rounded-xl border border-dashed border-white/10 hover:border-white/20 transition-colors">
               <Bookmark className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
               <h3 className="text-xl font-heading font-semibold text-white mb-2 tracking-tight">No saved posts</h3>
               <p className="text-muted-foreground max-w-sm text-base leading-relaxed">
                 Posts you save will appear here for easy access.
               </p>
             </div>
           )
        ) : (
          /* Overview Tab (Default) */
          <div className="min-h-[400px] flex flex-col items-center justify-center p-12 text-center bg-card/20 rounded-xl border border-dashed border-white/10 hover:border-white/20 transition-colors group">
              <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5">
                  <Plus className="w-8 h-8 text-muted-foreground group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-white mb-2 tracking-tight">
                  Welcome to your profile, u/{profile.username}!
              </h3>
              <p className="text-muted-foreground max-w-sm mb-8 text-base leading-relaxed">
                  Check out your posts, comments, and saved items using the tabs above.
              </p>
          </div>
        )}
      </div>
      {showAvatarEditor && (
        <AvatarEditor 
          currentAvatarUrl={profile?.avatar_url}
          onClose={() => setShowAvatarEditor(false)}
          onSave={handleAvatarSave}
        />
      )}
    </TwoColumnLayout>
  );
}
