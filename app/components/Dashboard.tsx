"use client";

import ChartCard from "@/app/components/charts/ChartCard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { getCurrentUserProfile } from "@/app/lib/getProfile";
import { createClient } from "@/app/lib/supabaseClient";
import { Post, Profile } from "@/app/types";
import {
  Activity,
  Clock,
  Mail,
  MessageCircle,
  MessageSquare,
  Pin,
  Presentation,
  RefreshCw,
  ShieldAlert,
  Users,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import Avatar from "./Avatar";

const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  {
    ssr: false,
    loading: () => (
      <div className="h-[100px] w-full flex items-center justify-center text-muted-foreground">
        Loading Chart...
      </div>
    ),
  }
);
const LineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[100px] w-full flex items-center justify-center text-muted-foreground">
        Loading Chart...
      </div>
    ),
  }
);
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), {
  ssr: false,
  loading: () => (
    <div className="h-[100px] w-full flex items-center justify-center text-muted-foreground">
      Loading Chart...
    </div>
  ),
});
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), {
  ssr: false,
  loading: () => (
    <div className="h-[100px] w-full flex items-center justify-center text-muted-foreground">
      Loading Chart...
    </div>
  ),
});
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), {
  ssr: false,
  loading: () => (
    <div className="h-[100px] w-full flex items-center justify-center text-muted-foreground">
      Loading Chart...
    </div>
  ),
});
const CartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  {
    ssr: false,
    loading: () => (
      <div className="h-[100px] w-full flex items-center justify-center text-muted-foreground">
        Loading Chart...
      </div>
    ),
  }
);
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), {
  ssr: false,
  loading: () => (
    <div className="h-[100px] w-full flex items-center justify-center text-muted-foreground">
      Loading Chart...
    </div>
  ),
});
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), {
  ssr: false,
  loading: () => (
    <div className="h-[100px] w-full flex items-center justify-center text-muted-foreground">
      Loading Chart...
    </div>
  ),
});
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), {
  ssr: false,
  loading: () => (
    <div className="h-[100px] w-full flex items-center justify-center text-muted-foreground">
      Loading Chart...
    </div>
  ),
});

interface StatCardData {
  id: string;
  title: string;
  value: number | null;
  change: string;
  icon: React.ElementType;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"stats" | "users">("stats");
  const [users, setUsers] = useState<Profile[]>([]);
  const [totalMembers, setTotalMembers] = useState<number | null>(null);
  const [totalPosts, setTotalPosts] = useState<number | null>(null);
  const [totalWorkshops, setTotalWorkshops] = useState<number | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(
    null
  );

  const supabase = createClient();

  useEffect(() => {
    getCurrentUserProfile().then((profile: Profile | null) => {
      setCurrentUserProfile(profile);
    });

    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "stats") {
      fetchTotalMembers();
      fetchTotalWorkshops();
      fetchTotalPosts();
      fetchRecentPosts();
    }

    const postsChannel = supabase
      .channel("dashboard-post-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events for posts
          schema: "public",
          table: "posts",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTotalPosts((prevCount) =>
              prevCount !== null ? prevCount + 1 : 1
            );
            const newPost = payload.new as Post;
            setRecentPosts((prevPosts) => {
              const updatedPosts = [newPost, ...prevPosts].slice(0, 5);
              return updatedPosts;
            });
          } else if (payload.eventType === "DELETE") {
            setTotalPosts((prevCount) =>
              prevCount !== null ? prevCount - 1 : 0
            );
            const deletedPostId = payload.old.id;
            setRecentPosts((prevPosts) =>
              prevPosts.filter((post) => post.id !== deletedPostId).slice(0, 5)
            );
          } else if (payload.eventType === "UPDATE") {
            const updatedPost = payload.new as Post;
            setRecentPosts((prevPosts) =>
              prevPosts
                .map((post) =>
                  post.id === updatedPost.id ? updatedPost : post
                )
                .slice(0, 5)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
    };
  }, [activeTab, supabase]);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoadingUsers(false);
    }
  }, []); // Add supabase to dependencies

  const fetchTotalMembers = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setTotalMembers(data.totalUsers);
      }
    } catch (error) {
      console.error("Failed to fetch total members:", error);
    }
  }, []); // Add supabase to dependencies

  const fetchTotalWorkshops = useCallback(async () => {
    try {
      const response = await fetch("/api/workshops?showArchived=false");
      if (response.ok) {
        const data = await response.json();
        setTotalWorkshops(data.totalWorkshopsCount);
      }
    } catch (error) {
      console.error("Failed to fetch total workshops:", error);
    }
  }, []); // Add supabase to dependencies

  const fetchTotalPosts = useCallback(async () => {
    try {
      const response = await fetch("/api/posts");
      if (response.ok) {
        const data = await response.json();
        setTotalPosts(data.totalPostsCount);
      }
    } catch (error) {
      console.error("Failed to fetch total posts:", error);
    }
  }, []); // Add supabase to dependencies

  const fetchRecentPosts = useCallback(async () => {
    try {
      const response = await fetch("/api/posts?limit=5"); // Assuming your API supports a limit parameter
      if (response.ok) {
        const data = await response.json();
        setRecentPosts(data.posts);
      }
    } catch (error) {
      console.error("Failed to fetch recent posts:", error);
    }
  }, []); // Add supabase to dependencies
  const mockMemberGrowthData = useMemo(
    () => [
      { name: "Jan", value: 100 },
      { name: "Feb", value: 120 },
      { name: "Mar", value: 150 },
      { name: "Apr", value: 130 },
      { name: "May", value: 180 },
      { name: "Jun", value: totalMembers || 200 }, // Use actual totalMembers for the last point
    ],
    [totalMembers]
  );

  const mockDiscussionData = useMemo(
    () => [
      { name: "Category A", discussions: 400 },
      { name: "Category B", discussions: 300 },
      { name: "Category C", discussions: 200 },
      { name: "Category D", discussions: 278 },
      { name: "Category E", discussions: 189 },
    ],
    []
  );

  const mockPostsActivityData = useMemo(
    () => [
      { name: "Week 1", posts: 10 },
      { name: "Week 2", posts: 15 },
      { name: "Week 3", posts: 12 },
      { name: "Week 4", posts: 18 },
    ],
    []
  );

  const renderStatCard = useCallback(
    (stat: StatCardData) => {
      const isMembersCard = stat.id === "members";
      const isPostsCard = stat.id === "posts";
      const isConclavesCard = stat.id === "conclaves";

      return isMembersCard ? (
        <ChartCard
          key={stat.id}
          title={stat.title}
          icon={stat.icon}
          accentColor="orange-500"
        >
          <div className="flex flex-col gap-2 pt-2">
            <span className="text-3xl sm:text-4xl font-heading font-bold text-foreground tracking-tighter">
              {stat.value?.toLocaleString()}
            </span>
            <div className="flex items-end gap-2 mb-4">
              <span
                className={`text-base font-medium px-2 py-0.5 rounded-full border border-foreground/5  ${
                  stat.change.includes("+")
                    ? "text-foreground bg-foreground/10"
                    : "text-muted-foreground bg-foreground/5"
                }`}
              >
                {stat.change}
              </span>
              <span className="text-xs text-muted-foreground">
                from last month
              </span>
            </div>
            {/* Placeholder for Member Growth Chart - Requires historical data from backend */}
            <div className="h-[100px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockMemberGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    stroke="#6b7280"
                    style={{ fontSize: "10px" }}
                  />
                  <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #3f3f46",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#a1a1aa" }}
                    itemStyle={{ color: "#f97316" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>
      ) : isPostsCard ? (
        <ChartCard
          key={stat.id}
          title={stat.title}
          icon={stat.icon}
          accentColor="orange-500"
        >
          <div className="flex flex-col gap-2 pt-2">
            <span className="text-3xl sm:text-4xl font-heading font-bold text-foreground tracking-tighter">
              {stat.value?.toLocaleString()}
            </span>
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full border border-foreground/5 ${
                  stat.change.includes("+")
                    ? "text-foreground bg-foreground/10"
                    : "text-muted-foreground bg-foreground/5"
                }`}
              >
                {stat.change}
              </span>
              <span className="text-xs text-muted-foreground">
                from last month
              </span>
            </div>
            <div className="h-[100px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockDiscussionData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#2a2a2a"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    stroke="#6b7280"
                    style={{ fontSize: "10px" }}
                  />
                  <YAxis hide domain={[0, "dataMax + 100"]} />
                  <Tooltip
                    cursor={{ fill: "rgba(249,115,22,0.1)" }}
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #3f3f46",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#a1a1aa" }}
                    itemStyle={{ color: "#f97316" }}
                  />
                  <Bar
                    dataKey="discussions"
                    fill="#f97316"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>
      ) : isConclavesCard ? (
        <ChartCard
          key={stat.id}
          title={stat.title}
          icon={stat.icon}
          accentColor="orange-500"
        >
          <div className="flex flex-col gap-2 pt-2">
            <span className="text-3xl sm:text-4xl font-heading font-bold text-foreground tracking-tighter">
              {stat.value?.toLocaleString()}
            </span>
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full border border-foreground/5 ${
                  stat.change.includes("+")
                    ? "text-foreground bg-foreground/10"
                    : "text-muted-foreground bg-foreground/5"
                }`}
              >
                {stat.change}
              </span>
              <span className="text-xs text-muted-foreground">
                from last month
              </span>
            </div>
            <div className="h-[100px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockPostsActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    stroke="#6b7280"
                    style={{ fontSize: "10px" }}
                  />
                  <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #3f3f46",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#a1a1aa" }}
                    itemStyle={{ color: "#f97316" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="posts"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>
      ) : (
        <Card
          key={stat.id}
          className="bg-card/40 backdrop-blur-md border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-500/5 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] transition-all duration-300 group cursor-pointer"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-orange-200 transition-colors duration-300">
              {stat.title}
            </CardTitle>
            <div className="p-2 bg-foreground/5 rounded-lg border border-foreground/5 group-hover:bg-orange-500/10 group-hover:border-orange-500/20 group-hover:shadow-[0_0_10px_rgba(249,115,22,0.1)] transition-all duration-300">
              <stat.icon
                size={18}
                className="text-muted-foreground group-hover:text-orange-400 transition-colors"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-3xl sm:text-4xl font-heading font-bold text-foreground tracking-tighter group-hover:scale-105 transition-transform duration-300 origin-left">
                {stat.value?.toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border border-foreground/5 transition-all duration-300 ${
                    stat.change.includes("+")
                      ? "text-foreground bg-foreground/10 group-hover:bg-orange-500/20 group-hover:border-orange-500/20 group-hover:text-orange-200"
                      : "text-muted-foreground bg-foreground/5 group-hover:bg-foreground/10"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground group-hover:text-foreground/60 transition-colors">
                  from last month
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    },
    [mockMemberGrowthData, mockDiscussionData, mockPostsActivityData]
  );

  const statCardData = [
    {
      id: "members",
      title: "Total Members",
      value: totalMembers,
      change: "+12%",
      icon: Users,
    },
    {
      id: "posts",
      title: "Active Discussions",
      value: totalPosts,
      change: "-5%",
      icon: MessageSquare,
    },
    {
      id: "conclaves",
      title: "Conclave This Month",
      value: totalWorkshops,
      change: "+8%",
      icon: Presentation,
    },
  ];

  const renderChart = (id: string) => {
    switch (id) {
      case "members":
        return (
          <div className="h-[100px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockMemberGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  stroke="#6b7280"
                  style={{ fontSize: "10px" }}
                />
                <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#a1a1aa" }}
                  itemStyle={{ color: "#f97316" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case "posts":
        return (
          <div className="h-[100px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockDiscussionData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2a2a2a"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  stroke="#6b7280"
                  style={{ fontSize: "10px" }}
                />
                <YAxis hide domain={[0, "dataMax + 100"]} />
                <Tooltip
                  cursor={{ fill: "rgba(249,115,22,0.1)" }}
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#a1a1aa" }}
                  itemStyle={{ color: "#f97316" }}
                />
                <Bar
                  dataKey="discussions"
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case "conclaves":
        return (
          <div className="h-[100px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockPostsActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  stroke="#6b7280"
                  style={{ fontSize: "10px" }}
                />
                <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#a1a1aa" }}
                  itemStyle={{ color: "#f97316" }}
                />
                <Line
                  type="monotone"
                  dataKey="posts"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive overview and community management
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-foreground/5 border border-foreground/10 rounded-xl backdrop-blur-md gap-1">
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 py-1 sm:px-6 sm:py-2 rounded-md w-full text-nowrap text-sm font-medium transition-all duration-300 ${
              activeTab === "stats"
                ? "bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                : "text-muted-foreground  hover:bg-white/5"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-1 sm:px-6 sm:py-2 rounded-md w-full text-nowrap text-sm font-medium transition-all duration-300 ${
              activeTab === "users"
                ? "bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                : "text-muted-foreground hover:bg-white/5"
            }`}
          >
            User Management
          </button>
        </div>
      </div>

      {activeTab === "stats" ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {statCardData.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center gap-4 bg-card/30 px-6 py-4 rounded-lg hover:scale-[103%] duration-300 transition-all border border-orange-600/20 hover:border-orange-600 group shadow-[0_0_20px_rgba(249,115,22,0.1)] hover:shadow-[0_0_20px_rgba(249,115,22,0.25)]  glare-effect"
              >
                <div className="w-full flex items-center justify-between">
                  <span className="text-xl font-medium text-foreground">
                    {item.title}
                  </span>
                  <div className="flex items-center justify-center p-2 rounded-md bg-orange-400 group-hover:bg-orange-500 duration-700 transition-all ease-in-out">
                    <item.icon />
                  </div>
                </div>
                <div className="w-full flex items-end justify-between">
                  <span className="text-4xl font-bold text-muted-foreground">
                    {item.value}
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center gap-1 text-muted-foreground text-sm`}
                    >
                      <span
                        className={`${item.change.includes("+") ? "text-green-500" : "text-muted-foreground"} font-medium rounded-md`}
                      >
                        {item.change}
                      </span>
                      from last month
                    </div>
                  </div>
                </div>
                {renderChart(item.id)}
              </div>
            ))}
          </div>

          {/* Recent Activity Section */}
          <Card className="group bg-card/30 backdrop-blur-sm border border-orange-600/30 hover:border-orange-600 overflow-hidden transition-colors duration-300">
            <CardHeader className="px-4 pt-6 pb-5 sm:px-8 sm:pt-8 sm:pb-6 border-b border-white/5">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-xl sm:text-2xl font-semibold text-foreground">
                  Recent Activity
                </CardTitle>
                <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20 flex-shrink-0 group-hover:scale-110 duration-300 ease-in-out">
                  <Activity className="w-5 h-5 text-orange-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-foreground/5">
                {recentPosts.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                    No recent posts.
                  </div>
                ) : (
                  recentPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 hover:bg-foreground/[0.04] transition-all duration-200 group cursor-pointer"
                    >
                      {/* Avatar/Icon */}
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-background rounded-xl flex items-center justify-center border border-foreground/5 group-hover:border-foreground/20 group-hover:bg-foreground/5 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300">
                        <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>

                      {/* Content */}
                      <div className="w-full flex flex-col items-start justify-center">
                        <div className="w-full flex items-center justify-between">
                          <h4 className="text-lg font-medium">{post.title}</h4>
                          {post.is_pinned && (
                            <div className="flex-shrink-0 bg-yellow-500/10 text-yellow-500  rounded text-[10px] font-bold uppercase tracking-wider border border-yellow-500/20">
                              <span className="px-2 py-1 hidden md:block">
                                Pinned
                              </span>
                              <span className="p-1 md:hidden block rotate-45 aspect-square">
                                <Pin size={20} />
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground/70 transition-colors">
                          {post.body?.substring(0, 150) + "..." || "No content"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* User Management Section */
        <Card className="bg-card/30 backdrop-blur-sm border-orange-500/20 overflow-hidden hover:border-orange-500/30 transition-colors duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.05)]">
          <CardHeader className="px-8 pt-8 pb-6 border-b border-foreground/5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <Users className="w-5 h-5 text-orange-400" />
              </div>
              <CardTitle className="text-xl font-semibold text-foreground">
                Community Members
              </CardTitle>
            </div>
            <button
              onClick={fetchUsers}
              disabled={loadingUsers}
              className="text-xs text-orange-400 hover:text-orange-300 font-medium bg-orange-500/10 p-2 aspect-square rounded-lg border border-orange-500/20 transition-all disabled:opacity-50"
            >
              {/* {loadingUsers ? "Refreshing..." : "Refresh List"} */}
              <span>
                <RefreshCw
                  size={18}
                  className={`${loadingUsers ? "animate-spin" : ""} `}
                />
              </span>
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-foreground/5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-3 sm:px-8 sm:py-4">Member</th>
                    <th className="px-4 py-3 sm:px-8 sm:py-4">Role</th>
                    <th className="px-4 py-3 sm:px-8 sm:py-4">Joined</th>
                    <th className="px-4 py-3 sm:px-8 sm:py-4">Flux</th>
                    <th className="px-4 py-3 sm:px-8 sm:py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/5">
                  {users.length === 0 && !loadingUsers ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-3 sm:px-8 sm:py-12 text-center text-muted-foreground"
                      >
                        No members found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-foreground/[0.04] transition-all duration-200 group"
                      >
                        <td className="px-4 py-3 sm:px-8 sm:py-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={user.avatar_url}
                              alt={user.full_name}
                              size={32}
                              className="ring-2 ring-foreground/5 group-hover:ring-orange-500/20"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-foreground text-nowrap">
                                {user.full_name}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono">
                                u/{user.username}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                              user.role === "admin"
                                ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                : "bg-foreground/5 text-muted-foreground border-foreground/10"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Clock size={12} />
                              {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-orange-400 font-semibold">
                          {user.total_flux}
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button className="p-2 bg-foreground/5 hover:bg-orange-500/10 text-muted-foreground hover:text-orange-400 rounded-lg border border-foreground/5 hover:border-orange-500/20 transition-all">
                              <ShieldAlert size={16} />
                            </button>
                            <button className="p-2 bg-foreground/5 hover:bg-orange-500/10 text-muted-foreground hover:text-orange-400 rounded-lg border border-foreground/5 hover:border-orange-500/20 transition-all">
                              <Mail size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
