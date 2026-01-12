"use client";

import { Card, CardContent } from "@/app/components/ui/card";
import VodPlayer from "@/app/components/VodPlayer";
import { createClient } from "@/app/lib/supabaseClient";
import { Workshop } from "@/app/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { CalendarEvent, google, outlook } from "calendar-link";
import { formatDistanceToNowStrict } from "date-fns";
import { format, toZonedTime } from "date-fns-tz";
import {
  Archive,
  Calendar,
  CalendarPlus,
  CheckCircle,
  Clock,
  MailOpen,
  Play,
  PlayCircle,
  Share2,
  Square,
  Video,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const formatDateTimeLocal = (isoString: string) => {
  const date = toZonedTime(
    isoString,
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  return format(date, "MMM d, h:mm a", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
};

const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.NEXT_PUBLIC_FRONTEND_URL)
    return process.env.NEXT_PUBLIC_FRONTEND_URL;
  throw new Error("NEXT_PUBLIC_FRONTEND_URL is not set.");
};

interface WorkshopCardProps {
  workshop: Workshop;
  isHost: boolean;
  currentUserId?: string;
}

export default function WorkshopCard({
  workshop: initialWorkshop,
  isHost,
}: WorkshopCardProps) {
  const [workshop, setWorkshop] = useState<Workshop>(initialWorkshop);
  const [email, setEmail] = useState("");
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(0); // Initialize to 0
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // New: for description toggle

  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  const conclaveLink = `${getBaseUrl()}/conclave/${workshop.id}`;

  // Polling for workshop status updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from("workshops")
          .select("status") // Only select status
          .eq("id", workshop.id)
          .single();

        if (error) {
          // Check if it's a "not found" error (workshop deleted or inaccessible)
          if (
            error.code === "PGRST116" ||
            error.message?.includes("No rows found")
          ) {
            // Workshop is no longer accessible, stop polling
            console.warn(
              "Workshop no longer accessible, stopping status polling"
            );
            clearInterval(interval);
            return;
          }
          // Log other real errors but don't spam the console
          console.warn(
            "Workshop status polling error:",
            error.message || "Unknown error"
          );
          return;
        }

        if (data) {
          if (data.status !== workshop.status) {
            setWorkshop((prev) => ({ ...prev, status: data.status }));
          }
        }
      } catch (err) {
        // Handle any unexpected errors in the polling logic
        console.warn("Unexpected error in workshop polling:", err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [workshop.id, workshop.status, supabase]);

  // Fetch waitlist count on load and when workshop.id changes
  useEffect(() => {
    const fetchWaitlistCount = async () => {
      const { count, error } = await supabase
        .from("workshop_waitlist")
        .select("*", { count: "exact" })
        .eq("workshop_id", workshop.id);

      if (error) {
        console.error("Error fetching waitlist count:", error);
        setWaitlistCount(0);
      } else {
        setWaitlistCount(count || 0);
      }
    };
    fetchWaitlistCount();
  }, [workshop.id, supabase]);

  // Check if current user is already on the waitlist on load
  useEffect(() => {
    const checkWaitlistStatus = async () => {
      // Only check if email is available (for anonymous waitlist)
      if (email) {
        const { data, error } = await supabase
          .from("workshop_waitlist")
          .select("*")
          .eq("workshop_id", workshop.id)
          .eq("user_email", email)
          .single();

        if (data) {
          setJoinedWaitlist(true);
        } else if (error && error.code !== "PGRST116") {
          // PGRST116 means no rows found
          console.error("Error checking waitlist status:", error);
        }
      }
    };
    // Call immediately if email is present. The effect will re-run if 'email' changes.
    if (email) {
      checkWaitlistStatus();
    }
  }, [workshop.id, supabase, email]);

  const event: CalendarEvent = {
    title: workshop.title,
    description: workshop.description || "",
    start: workshop.start_time,
    duration: [1, "hour"],
    url: conclaveLink,
  };

  const handleStartConclave = async () => {
    setIsStarting(true);
    try {
      const response = await fetch(`/api/workshops/${workshop.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "LIVE" }),
      });

      if (!response.ok) {
        throw new Error("Failed to start conclave");
      }

      setWorkshop((prev) => ({ ...prev, status: "LIVE" }));
      router.push(`/conclave/${workshop.id}`);
    } catch (error) {
      console.error("Error starting conclave:", error);
      toast({
        title: "Error",
        description: "Failed to start conclave. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndWorkshop = async () => {
    if (
      !confirm(
        "Are you sure you want to end this conclave? This will stop the live session for everyone."
      )
    ) {
      return;
    }

    setIsEnding(true);
    try {
      const response = await fetch(`/api/workshops/${workshop.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ENDED" }),
      });

      if (!response.ok) {
        throw new Error("Failed to end workshop");
      }

      setWorkshop((prev) => ({ ...prev, status: "ENDED" }));
      router.refresh();
    } catch (error) {
      console.error("Error ending workshop:", error);
      toast({
        title: "Error",
        description: "Failed to end conclave. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnding(false);
    }
  };

  const handleArchiveToggle = async () => {
    if (
      !confirm(
        `Are you sure you want to ${workshop.is_archived ? "unarchive" : "archive"} this conclave?`
      )
    ) {
      return;
    }

    setIsArchiving(true);
    try {
      const response = await fetch(`/api/workshops/${workshop.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_archived: !workshop.is_archived }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${workshop.is_archived ? "unarchive" : "archive"} workshop`
        );
      }

      setWorkshop((prev) => ({ ...prev, is_archived: !prev.is_archived }));
      router.refresh();
    } catch (error) {
      console.error("Error archiving/unarchiving workshop:", error);
      toast({
        title: "Error",
        description: `Failed to ${workshop.is_archived ? "unarchive" : "archive"} conclave. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast({
        title: "Error",
        description: "Email address cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (trimmedEmail.includes(",")) {
      toast({
        title: "Error",
        description: "Please enter only one email address at a time.",
        variant: "destructive",
      });
      return;
    }

    setIsJoiningWaitlist(true);
    try {
      const response = await fetch(`/api/workshops/${workshop.id}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await response.json();

      if (
        response.ok ||
        (response.status === 200 &&
          data.message === "You are already on the waitlist.")
      ) {
        setJoinedWaitlist(true);
        if (response.status === 201) {
          setWaitlistCount((prev) => prev + 1);
        }
        setEmail("");
        toast({
          title: "Success",
          description:
            "✅ You're on the waitlist! We'll email you when we go live.",
        });
      } else {
        throw new Error(data.error || "Failed to join waitlist");
      }
    } catch (error) {
      console.error("Error joining waitlist:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoiningWaitlist(false);
    }
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(conclaveLink);
    toast({
      title: "Link Copied!",
      description: "The conclave link has been copied to your clipboard.",
    });
  };

  const handleDeleteConclave = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this conclave? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/workshops/${workshop.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to delete conclave");
      }

      toast({
        title: "Success",
        description: "Conclave deleted successfully.",
      });
      router.push("/workshops"); // Redirect to workshops page after deletion
      router.refresh();
    } catch (error) {
      console.error("Error deleting conclave:", error);
      toast({
        title: "Error",
        description: "Failed to delete conclave. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNotifyConclaveUsers = async () => {
    try {
      const response = await fetch("/api/notify/conclave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workshopId: workshop.id }),
      });

      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          toast({
            title: "Error!",
            description:
              errorData.message || "Failed to send conclave invitations.",
            variant: "destructive",
          });
        } else {
          const errorText = await response.text();
          toast({
            title: "Error!",
            description: `Server error: ${response.status} ${response.statusText} - ${errorText}`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Failed to notify conclave users:", error);
      toast({
        title: "Error!",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const isScheduled = workshop.status === "SCHEDULED";
  const isLive = workshop.status === "LIVE";
  const isEnded = workshop.status === "ENDED";

  // Determine if description is long enough to need "Read more"
  const hasLongDescription =
    (workshop.description || "").split(/\s+/).length > 40; // ~3 lines

  return (
    <Card
      className={`
        min-h-[360px] max-w-sm mx-auto overflow-hidden border-teal-700/50 shadow-sm 
        transition-all duration-300 bg-card/40 backdrop-blur-sm group font-manrope flex flex-col
        ${
          isEnded
            ? "opacity-80 grayscale-[0.3]"
            : "hover:shadow-[0_0_20px_rgba(39,88,79,0.25)] hover:border-teal-700"
        }
      `}
    >
      {/* Header */}
      <div
        className={`
          p-6 border-b border-teal-700/10 transition-colors
          ${isEnded ? "bg-zinc-900/10" : "bg-teal-700/5 group-hover:bg-teal-700/10"}
        `}
      >
        <h2 className="text-2xl font-medium text-foreground group-hover:text-foreground/90 transition-colors font-sora line-clamp-2">
          {workshop.title}
        </h2>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar size={16} />
            {formatDateTimeLocal(workshop.start_time)}
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest text-teal-500 border bg-teal-500/10 border-teal-500">
              {workshop.type}
            </div>
            <div
              className={`
                px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                ${
                  isLive
                    ? "bg-red-500 text-white animate-pulse"
                    : isEnded
                      ? "bg-foreground/20 text-foreground border border-zinc-700"
                      : "bg-blue-500 text-white"
                }
              `}
            >
              {isEnded ? (
                <span className="flex items-center gap-1">
                  Ended{" "}
                  {workshop.ended_at &&
                    formatDistanceToNowStrict(new Date(workshop.ended_at), {
                      addSuffix: true,
                    })}
                </span>
              ) : (
                workshop.status
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <CardContent className="p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Description with Read More */}
          {!isEnded && (
            <div className="text-foreground/80 leading-relaxed">
              <p
                className={`
                  transition-all duration-300
                  ${isExpanded ? "" : "line-clamp-3"}
                `}
              >
                {workshop.description || "No description available."}
              </p>

              {/* Read More / Less Button */}
              {hasLongDescription && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2 text-sm text-teal-500 hover:text-teal-400 font-medium flex items-center gap-1 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      Read less <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      Read more <ChevronDown size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Ended State Content */}
          {isEnded &&
            (workshop.recording_url ? (
              <div className="rounded-lg overflow-hidden border border-teal-700/20 shadow-inner bg-black/5">
                <VodPlayer
                  url={workshop.recording_url}
                  title={workshop.title}
                />
                <div className="p-3 bg-zinc-900/50 border-t border-teal-700/10 text-xs text-zinc-400 flex justify-between">
                  <span className="flex items-center gap-1">
                    <Video size={12} /> Recording Available
                  </span>
                  <span className="italic">
                    Ended{" "}
                    {workshop.ended_at &&
                      formatDistanceToNowStrict(new Date(workshop.ended_at), {
                        addSuffix: true,
                      })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4 rounded-lg border border-dashed border-teal-700/30 bg-teal-700/5 flex flex-col items-center justify-center text-center">
                <div className="p-2 rounded-full bg-teal-700/10 flex items-center justify-center mb-4 animate-pulse">
                  <Clock className=" text-[#48aa98]" size={28} />
                </div>
                <h4 className="font-semibold text-foreground font-sora">
                  Recording Processing
                </h4>
                <p className="text-xs text-muted-foreground mt-2 max-w-xs px-2">
                  The session has ended. We&apos;re currently processing the
                  recording for you.
                </p>
              </div>
            ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-full text-[11px] border-teal-700/30 hover:bg-foreground/10"
              onClick={handleShareLink}
            >
              <Share2 size={14} className="mr-1" /> Share
            </Button>
            {workshop.status !== "ENDED" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-full text-[11px] border-teal-700/30 hover:bg-foreground/10"
                  onClick={() => window.open(google(event), "_blank")}
                >
                  <CalendarPlus size={14} className="mr-1" /> Google
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-full text-[11px] border-teal-700/30 hover:bg-foreground/10"
                  onClick={() => window.open(outlook(event), "_blank")}
                >
                  <MailOpen size={14} /> Outlook
                </Button>
              </>
            )}
          </div>

          {/* CTA Button */}
          {isHost ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                {isScheduled && (
                  <Button
                    className="w-full bg-teal-700 hover:bg-teal-800 shadow-lg shadow-teal-700/20"
                    onClick={handleStartConclave}
                    disabled={isStarting}
                  >
                    <Play className="mr-2" />{" "}
                    {isStarting ? "Starting..." : "Start Conclave"}
                  </Button>
                )}
                {isLive && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleEndWorkshop}
                    disabled={isEnding}
                  >
                    <Square className="mr-2 w-6 h-6" />{" "}
                    {isEnding ? "Ending..." : "End Conclave"}
                  </Button>
                )}
                {isEnded && (
                  <Button disabled={!workshop.recording_url} className="w-full">
                    {workshop.recording_url ? (
                      <a
                        href={`/workshops/${workshop.id}/watch`}
                        className="flex items-center justify-center gap-2 w-full"
                      >
                        <PlayCircle className="w-6 h-6" /> Watch Recording
                      </a>
                    ) : (
                      <>Session Finished</>
                    )}
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  onClick={handleArchiveToggle}
                  disabled={isArchiving}
                >
                  <Archive size={14} className="mr-1" />{" "}
                  {isArchiving
                    ? "Processing..."
                    : workshop.is_archived
                      ? "Unarchive"
                      : "Archive"}
                </Button>
                <Button variant="destructive" onClick={handleDeleteConclave}>
                  <X size={14} className="mr-1" /> Delete
                </Button>
              </div>
            </div>
          ) : (
            <Button
              className="w-full text-base font-sora bg-teal-700 hover:bg-teal-800"
              variant={isLive ? "default" : "secondary"}
              asChild={isLive || (isEnded && !!workshop.recording_url)}
              disabled={isScheduled || (isEnded && !workshop.recording_url)}
            >
              {isLive ? (
                <a href={`/conclave/${workshop.id}`}>
                  <Video className="mr-2 w-6 h-6" /> Join Now
                </a>
              ) : isEnded && workshop.recording_url ? (
                <a href={`/workshops/${workshop.id}/watch`}>
                  <PlayCircle className="mr-2 w-6 h-6" /> Watch Recording
                </a>
              ) : (
                <>Event Scheduled</>
              )}
            </Button>
          )}
        </div>
      </CardContent>

      {/* Modal unchanged */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md bg-teal-700/10 border border-teal-700">
          <DialogHeader className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-teal-700 mx-auto" />
            <DialogTitle className="text-2xl">Email Sent!</DialogTitle>
            <DialogDescription>
              Your conclave invitation emails have been successfully sent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="w-full bg-teal-700 hover:bg-teal-700/90">
                OK
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
