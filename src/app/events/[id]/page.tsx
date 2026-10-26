"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  Share2,
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  User,
  Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface EventDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  coverImage?: string;
  organizerName: string;
  organizerContact?: string;
  attendeeCount: number;
  isRegistered: boolean;
  isCreator: boolean;
  status: string;
  creator: {
    id: string;
    name: string;
    avatar?: string;
    department?: string;
    email: string;
  };
  registrations: Array<{
    id: string;
    registeredAt: string;
    user: {
      id: string;
      name: string;
      avatar?: string;
      department?: string;
      rollNumber?: string;
    };
  }>;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data.event);
      } else {
        router.push("/events");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handleRegisterToggle = async () => {
    if (!event) return;
    try {
      setActionLoading(true);
      setMessage(null);

      const endpoint = `/api/events/${event.id}/register`;
      const method = event.isRegistered ? "DELETE" : "POST";

      const res = await fetch(endpoint, { method });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update registration");
      }

      setMessage({
        text: event.isRegistered
          ? "Your registration has been cancelled."
          : "Registration confirmed! See you at the event.",
        type: "success",
      });

      await fetchEvent();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage({ text: err.message, type: "error" });
      } else {
        setMessage({ text: "Action failed", type: "error" });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to cancel and delete this campus event?")) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/events");
      } else {
        alert("Failed to delete event");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
        <p className="text-xs text-slate-500 mt-2">Loading event details...</p>
      </div>
    );
  }

  if (!event) return null;

  const isFull = event.attendeeCount >= event.capacity;
  const remaining = Math.max(0, event.capacity - event.attendeeCount);
  const percentFilled = Math.min(Math.round((event.attendeeCount / event.capacity) * 100), 100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Events
        </Link>
      </div>

      {/* Alert */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="underline text-[11px] font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Cover Image & Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm max-h-[360px]">
        <img
          src={
            event.coverImage ||
            "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200"
          }
          alt={event.title}
          className="w-full h-80 object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-primary-600 text-white px-3 py-0.5 rounded-full">
                {event.category}
              </span>
              <span className="text-xs font-medium text-slate-300">
                {event.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {event.title}
            </h1>
          </div>

          {event.isCreator && (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/events/${event.id}/edit`}
                className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur flex items-center gap-1.5 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" /> Edit
              </Link>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold backdrop-blur flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description & Attendees */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Event */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900">About the Event</h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Organized by: <strong className="text-slate-800">{event.organizerName}</strong></span>
              {event.organizerContact && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {event.organizerContact}
                </span>
              )}
            </div>
          </div>

          {/* Attendees List */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Registered Attendees ({event.attendeeCount})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Students attending from various engineering departments
                </p>
              </div>
            </div>

            {event.registrations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                No students registered yet. Be the first to register!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                      {reg.user.avatar ? (
                        <img
                          src={reg.user.avatar}
                          alt={reg.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        reg.user.name.slice(0, 2)
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {reg.user.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {reg.user.department || "NIT Andhra Pradesh"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Venue, Date & Registration Action Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5 sticky top-24">
            <h3 className="font-bold text-slate-900 text-base">Date & Venue</h3>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">Date</div>
                  <div>{formatDate(event.date)}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">Timing</div>
                  <div>{event.startTime} – {event.endTime}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">Campus Venue</div>
                  <div className="text-slate-700">{event.venue}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Tadepalligudem, NIT-AP</div>
                </div>
              </div>
            </div>

            {/* Capacity status */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">Seat Capacity</span>
                <span className="text-slate-500 font-medium">
                  {event.attendeeCount} / {event.capacity}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isFull ? "bg-rose-500" : percentFilled > 80 ? "bg-amber-500" : "bg-primary-600"
                  }`}
                  style={{ width: `${percentFilled}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {isFull ? (
                  <span className="text-rose-600 font-semibold">Event has reached full capacity.</span>
                ) : (
                  <span>{remaining} seats remaining. Duplicate registrations strictly prevented.</span>
                )}
              </p>
            </div>

            {/* Register button */}
            <button
              onClick={handleRegisterToggle}
              disabled={actionLoading || (!event.isRegistered && isFull)}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs ${
                event.isRegistered
                  ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                  : isFull
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/20"
              }`}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : event.isRegistered ? (
                <>
                  <CheckCircle className="w-4 h-4" /> Cancel Registration
                </>
              ) : isFull ? (
                "Event Full"
              ) : (
                "Confirm Event Registration"
              )}
            </button>

            {event.isRegistered && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Registered Student
                </div>
                <p>Your entry is confirmed. Please carry your NIT-AP student ID card to {event.venue}.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
