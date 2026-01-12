"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { Video, Mic, Clock, PlayCircle, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateWorkshopModal from "@/app/components/CreateWorkshopModal";
import WorkshopCard from "@/app/components/WorkshopCard";
import { createClient } from "@/app/lib/supabaseClient";
import { useSearchParams } from "next/navigation";
import { getCurrentUserProfile } from "@/app/lib/getProfile";
import { Profile, Workshop } from "@/app/types";

function WorkshopsContent() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<Profile["role"] | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"AUDIO" | "VIDEO" | "ALL">(
    "ALL"
  );
  const [statusFilter, setStatusFilter] = useState<
    "LIVE" | "ENDED" | "SCHEDULED" | "ALL"
  >("ALL");
  const supabase = createClient();
  const searchParams = useSearchParams();

  const fetchWorkshops = useCallback(async () => {
    try {
      const searchQuery = searchParams.get("search");
      let url = "/api/workshops";
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      if (showArchived) {
        params.append("showArchived", "true");
      }
      if (typeFilter !== "ALL") {
        params.append("type", typeFilter);
      }
      if (statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }
      if (params.toString()) {
        url = `${url}?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      // Sort workshops by start_time in descending order (newest first)
      const sortedWorkshops = (data.workshops ?? []).sort(
        (a: Workshop, b: Workshop) => {
          return (
            new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
          );
        }
      );
      setWorkshops(sortedWorkshops || []);
    } catch (error) {
      console.error("Failed to fetch workshops:", error);
    } finally {
      setLoading(false);
    }
  }, [searchParams, showArchived, typeFilter, statusFilter]);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      if (user) {
        const profile = await getCurrentUserProfile();
        setUserRole(profile?.role || null);
      }
    };
    getSessionAndProfile();
    fetchWorkshops();
  }, [fetchWorkshops, supabase.auth]);

  const handleToggleShowArchived = () => {
    setShowArchived((prev) => !prev);
  };

  const handleTypeFilterChange = (type: "AUDIO" | "VIDEO" | "ALL") => {
    setTypeFilter(type);
  };

  const handleStatusFilterChange = (
    status: "LIVE" | "ENDED" | "SCHEDULED" | "ALL"
  ) => {
    setStatusFilter(status);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27584F] mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="md:p-4 container max-w-[1400px] mx-auto px-2 md:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Conclave
          </h1>
          <p className="text-lg text-muted-foreground">
            Schedule and manage online conclaves
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-4">
          {userRole === "admin" && (
            <Button
              variant="outline"
              onClick={handleToggleShowArchived}
              className="border-teal-600 text-teal-600 hover:bg-teal-600/20"
            >
              {showArchived ? "Hide Archived" : "Show Archived"}
            </Button>
          )}
          {userRole === "admin" && (
            <CreateWorkshopModal onWorkshopCreated={fetchWorkshops} />
          )}
        </div>
      </div>

    
      <div className="space-y-3">
        {/* Active filters summary (chips) */}
        {(typeFilter !== "ALL" || statusFilter !== "ALL") && (
          <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
            <span>Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {typeFilter !== "ALL" && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-700 text-xs border border-teal-700/50">
                  {typeFilter === "VIDEO" ? (
                    <Video size={13} />
                  ) : (
                    <Mic size={13} />
                  )}
                  {typeFilter.toLowerCase()}
                </div>
              )}
              {statusFilter !== "ALL" && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-700 text-xs border border-teal-700/50">
                  {statusFilter === "LIVE" ? (
                    <PlayCircle size={13} />
                  ) : statusFilter === "SCHEDULED" ? (
                    <Calendar size={13} />
                  ) : (
                    <Clock size={13} />
                  )}
                  {statusFilter}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Unified filter bar */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 overflow-x-auto pb-1 scrollbar-thin">
          {/* Type group */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-medium text-muted-foreground/80">
              Type:
            </span>
            <div className="flex bg-muted/40 rounded-md p-0.5 border border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTypeFilterChange("ALL")}
                className={`h-7 min-w-[52px] px-2.5 text-xs rounded-sm transition-all ${
                  typeFilter === "ALL"
                    ? "bg-background shadow-sm border"
                    : "hover:bg-muted/60 text-muted-foreground"
                }`}
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTypeFilterChange("VIDEO")}
                className={`h-7 min-w-[68px] px-2.5 text-xs rounded-sm flex items-center gap-1 transition-all ${
                  typeFilter === "VIDEO"
                    ? "bg-background shadow-sm border text-teal-700"
                    : "hover:bg-muted/60 text-muted-foreground"
                }`}
              >
                <Video size={13} />
                Video
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTypeFilterChange("AUDIO")}
                className={`h-7 min-w-[68px] px-2.5 text-xs rounded-sm flex items-center gap-1 transition-all ${
                  typeFilter === "AUDIO"
                    ? "bg-background shadow-sm border text-teal-700"
                    : "hover:bg-muted/60 text-muted-foreground"
                }`}
              >
                <Mic size={13} />
                Audio
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-5 w-px bg-border/60 mx-1" />

          {/* Status group */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-medium text-muted-foreground/80">
              Status:
            </span>
            <div className="flex bg-muted/40 rounded-md p-0.5 border border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusFilterChange("ALL")}
                className={`h-7 min-w-[52px] px-2.5 text-xs rounded-sm transition-all ${
                  statusFilter === "ALL"
                    ? "bg-background shadow-sm border"
                    : "hover:bg-muted/60 text-muted-foreground"
                }`}
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusFilterChange("SCHEDULED")}
                className={`h-7 min-w-[78px] px-2.5 text-xs rounded-sm flex items-center gap-1 transition-all ${
                  statusFilter === "SCHEDULED"
                    ? "bg-background shadow-sm border text-teal-700"
                    : "hover:bg-muted/60 text-muted-foreground"
                }`}
              >
                <Calendar size={13} />
                Scheduled
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusFilterChange("LIVE")}
                className={`h-7 min-w-[60px] px-2.5 text-xs rounded-sm flex items-center gap-1 transition-all ${
                  statusFilter === "LIVE"
                    ? "bg-red-500/10 shadow-sm border border-red-700/50 text-red-700"
                    : "hover:bg-red-950/20 text-red-400/90"
                }`}
              >
                <PlayCircle size={13} />
                Live
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusFilterChange("ENDED")}
                className={`h-7 min-w-[68px] px-2.5 text-xs rounded-sm flex items-center gap-1 transition-all ${
                  statusFilter === "ENDED"
                    ? "bg-background shadow-sm border text-teal-700"
                    : "hover:bg-muted/60 text-muted-foreground"
                }`}
              >
                <Clock size={13} />
                Ended
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Workshops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {workshops.map((workshop) => (
          <WorkshopCard
            key={workshop.id}
            workshop={workshop}
            isHost={workshop.host_id === userId}
          />
        ))}
      </div>

      {workshops.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No conclaves scheduled yet.
          </p>
        </div>
      )}
    </div>
  );
}

export default function WorkshopsPage() {
  return (
    <Suspense fallback={<div>Loading workshops...</div>}>
      <WorkshopsContent />
    </Suspense>
  );
}
