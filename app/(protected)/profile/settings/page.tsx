"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TwoColumnLayout from "@/app/components/TwoColumnLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  User,
  Bell,
  Lock,
  Eye,
  Globe,
  ShieldCheck,
  ChevronLeft,
  Save,
  MessageSquare,
  Sparkles,
  Settings,
} from "lucide-react";
import { getCurrentUserProfile } from "@/app/lib/getProfile";
import { Profile } from "@/app/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("account");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    getCurrentUserProfile().then((data) => {
      setProfile(data);
      setDisplayName(data?.full_name || "");
      setUsername(data?.username || "");
      setBio(data?.bio || "");
      setLoading(false);
    });
  }, []);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveSuccess(null);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ full_name: displayName, username, bio }),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }
      setSaveSuccess(true);
      // Optionally refresh profile data after successful save
      getCurrentUserProfile().then((data) => {
        setProfile(data);
        setDisplayName(data?.full_name || "");
        setUsername(data?.username || "");
        setBio(data?.bio || "");
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveSuccess(false);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveSuccess(null), 3000); // Clear message after 3 seconds
    }
  };

  const sections = [
    { id: "account", label: "Account Information", icon: User },
    { id: "profile", label: "Public Profile", icon: Sparkles },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Safety", icon: ShieldCheck },
    { id: "community", label: "Community Settings", icon: MessageSquare },
  ];

  if (loading) return null;

  const features = [
    {
      icon: (
        <Globe className="w-8 h-8 text-violet-500 mb-4 group-hover:scale-110 transition-transform" />
      ),
      title: "Global Community",
      description:
        "Connect with people worldwide through conclaves and real-time meetings.",
    },
    {
      icon: (
        <MessageSquare className="w-8 h-8 text-violet-500 mb-4 group-hover:scale-110 transition-transform" />
      ),
      title: "Knowledge Sharing",
      description:
        "Post your insights, ask questions, and grow together in our curated discussions.",
    },
    {
      icon: (
        <Sparkles className="w-8 h-8 text-violet-500 mb-4 group-hover:scale-110 transition-transform" />
      ),
      title: "Flux System",
      description:
        "Your contribution matters. Earn Flux by engaging meaningfully with the community.",
    },
  ];

  const SettingsSidebar = (
    <div className="space-y-4">
      <Card className="bg-card/60 backdrop-blur-md border border-violet-500/20 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-foreground/5 pb-4">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <Settings className="w-5 h-5 text-violet-500" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-4">
          <div className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                  activeSection === section.id
                    ? "bg-violet-500/20 text-foreground border border-violet-500/30 shadow-[0_0_15px_rgba(166,156,190,0.15)]"
                    : "text-muted-foreground hover:bg-violet-500/10 hover:text-violet-500 border border-transparent"
                )}
              >
                <section.icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    activeSection === section.id
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                />
                {section.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="px-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-2">
          Support
        </p>
        <div className="space-y-1 text-sm">
          <button className="w-full text-left px-4 py-2 text-muted-foreground hover:text-violet-500 transition-colors">
            Help Center
          </button>
          <button className="w-full text-left px-4 py-2 text-muted-foreground hover:text-violet-500 transition-colors">
            Community Guidelines
          </button>
          <button className="w-full text-left px-4 py-2 text-muted-foreground hover:text-violet-500 transition-colors font-semibold">
            Log Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <TwoColumnLayout rightSidebar={SettingsSidebar}>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 border border-transparent">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-foreground/5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full bg-card hover:bg-violet-500/20 text-muted-foreground hover:text-foreground transition-all border border-foreground/5"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight">
                Profile Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your account preferences and portal experience
              </p>
            </div>
          </div>
          <Button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="bg-violet-500 hover:bg-violet-500/80 text-white font-bold rounded-xl px-6 py-5 shadow-[0_0_20px_rgba(166,156,190,0.3)] transition-all flex items-center gap-2"
          >
            {isSaving ? "Saving..." : "Save Changes"}
            {saveSuccess === true && (
              <span className="ml-2 text-green-300">Saved!</span>
            )}
            {saveSuccess === false && (
              <span className="ml-2 text-red-300">Failed!</span>
            )}
          </Button>
        </div>

        {/* Dynamic Content Sections */}
        {activeSection === "account" && (
          <div className="space-y-6">
            <Card className="bg-card/40 backdrop-blur-md border border-foreground/5 hover:border-violet-500/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">
                  Account Information
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Update your account credentials and personal info
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                      Username
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-muted-foreground font-mono">
                          u/
                        </span>
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-card border border-foreground/10 rounded-xl py-3 pl-10 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all "
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue={profile?.email}
                      className="w-full bg-card border border-foreground/10 rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all "
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10 flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-violet-500/20">
                    <Lock size={20} className="text-violet-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">
                      Security Password
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Keep your account secure by using a strong password.
                    </p>
                    <Button
                      variant="outline"
                      className="text-xs border-violet-500/30 text-violet-500 hover:bg-violet-500/10"
                    >
                      Update Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === "profile" && (
          <div className="space-y-6">
            <Card className="bg-card/40 backdrop-blur-md border border-foreground/5 hover:border-violet-500/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">
                  Public Profile
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  How other community members see you on Sphere
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-card border border-foreground/10 rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                    Short Bio
                  </label>
                  <Textarea
                    rows={4}
                    placeholder="Tell the community about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-card border border-foreground/10 rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Placeholder for other sections to keep it clean */}
        {(activeSection === "notifications" ||
          activeSection === "privacy" ||
          activeSection === "community") && (
          <div className="flex flex-col items-center justify-center py-24 bg-card/20 rounded-2xl border border-dashed border-foreground/10">
            <div className="p-4 rounded-full bg-violet-500/10 mb-4 animate-pulse">
              <Eye className="w-8 h-8 text-violet-500" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Section Under Construction
            </h3>
            <p className="text-muted-foreground text-center max-w-xs">
              We&apos;re building this feature to enhance your Sphere
              experience. Check back soon!
            </p>
          </div>
        )}

        {/* Feature Points Section (Related to the website) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="glare-effect p-6 rounded-2xl bg-gradient-to-br from-violet-500/20 to-transparent border border-violet-500/10 hover:border-violet-500/40 transition-all group"
            >
              {feat.icon}
              <h3 className="font-bold text-foreground mb-2 font-heading">
                {feat.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </TwoColumnLayout>
  );
}

// Minimal Settings icon if lucide-react doesn't export it in the way I used it in sidebar
