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
  Bell,
  Calendar,
  CalendarPlus,
  CheckCircle,
  Clock,
  MailOpen,
  Play,
  PlayCircle,
  Share2,
  Square,
  SquareCheckBig,
  User as UserIcon,
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // New: for description toggle

  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  const conclaveLink = `${getBaseUrl()}/conclave/${workshop.id}`;

  // Polling and waitlist logic unchanged
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from("workshops")
          .select("status")
          .eq("id", workshop.id)
          .single();

        if (error && error.code === "PGRST116") {
          clearInterval(interval);
          return;
        }

        if (data && data.status !== workshop.status) {
          setWorkshop((prev) => ({ ...prev, status: data.status }));
        }
      } catch (err) {
        console.warn("Polling error:", err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [workshop.id, workshop.status, supabase]);

  const event: CalendarEvent = {
    title: workshop.title,
    description: workshop.description || "",
    start: workshop.start_time,
    duration: [1, "hour"],
    url: conclaveLink,
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
                <div className="w-16 h-16 rounded-full bg-teal-700/10 flex items-center justify-center mb-4 animate-pulse">
                  <Clock className="w-10 h-10 text-[#48aa98]" />
                </div>
                <h4 className="font-semibold text-foreground font-sora">
                  Recording Processing
                </h4>
                <p className="text-xs text-muted-foreground mt-2 max-w-xs px-2">
                  The session has ended. We're currently processing the
                  recording for you.
                </p>
              </div>
            ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-[11px] border-teal-700/30 hover:bg-foreground/10"
              onClick={() => {
                navigator.clipboard.writeText(conclaveLink);
                toast({
                  title: "Copied!",
                  description: "Link copied to clipboard.",
                });
              }}
            >
              <Share2 size={14} className="mr-1" /> Share
            </Button>
            {workshop.status !== "ENDED" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-[11px] border-teal-700/30 hover:bg-foreground/10"
                  onClick={() => window.open(google(event), "_blank")}
                >
                  <CalendarPlus size={14} className="mr-1" /> Google
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-[11px] border-teal-700/30 hover:bg-foreground/10"
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
                  <Button className="w-full bg-teal-700 hover:bg-teal-800 shadow-lg shadow-teal-700/20">
                    <Play className="mr-2" /> Start Conclave
                  </Button>
                )}
                {isLive && (
                  <Button asChild className="w-full bg-teal-700 hover:bg-teal-800">
                    <a href={`/conclave/${workshop.id}`}>
                      <Video className="mr-2 w-6 h-6" /> Join as Host
                    </a>
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
                <Button variant="secondary">
                  <Archive size={14} className="mr-1" />{" "}
                  {workshop.is_archived ? "Unarchive" : "Archive"}
                </Button>
                <Button variant="destructive">
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
