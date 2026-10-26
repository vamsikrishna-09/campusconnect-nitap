"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Search,
  MapPin,
  Clock,
  Users,
  Plus,
  Filter,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { EVENT_CATEGORIES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";

interface EventItem {
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
  attendeeCount: number;
  isRegistered: boolean;
  isCreator: boolean;
  status: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [filterRegistered, setFilterRegistered] = useState(false);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search);
      if (category !== "ALL") params.set("category", category);
      if (filterRegistered) params.set("registeredOnly", "true");

      const res = await fetch(`/api/events?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [category, filterRegistered]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleRegisterToggle = async (eventId: string, isRegistered: boolean) => {
    try {
      setRegisteringId(eventId);
      setMessage(null);

      const endpoint = `/api/events/${eventId}/register`;
      const method = isRegistered ? "DELETE" : "POST";

      const res = await fetch(endpoint, { method });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update registration");
      }

      setMessage({
        text: isRegistered ? "Registration cancelled" : "Successfully registered for event!",
        type: "success",
      });

      // Refresh list
      await fetchEvents();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage({ text: err.message, type: "error" });
      } else {
        setMessage({ text: "Registration action failed", type: "error" });
      }
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Campus Events & Fests
            </h1>
            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
              NIT-AP
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover hackathons, cultural festivals, guest lectures, and sports tournaments.
          </p>
        </div>

        <Link
          href="/events/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Host an Event
        </Link>
      </div>

      {/* Alert message if any */}
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
          <button
            onClick={() => setMessage(null)}
            className="text-[11px] underline font-semibold hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event title, venue (e.g. SRK Bhavan, SAC Grounds), organizer..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
          >
            Search
          </button>
        </form>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {EVENT_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                category === cat.value
                  ? "bg-primary-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
            <input
              type="checkbox"
              checked={filterRegistered}
              onChange={(e) => setFilterRegistered(e.target.checked)}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <span>Show my registered events only</span>
          </label>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
          <p className="text-xs text-slate-500 mt-2">Loading campus events...</p>
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No events found"
          description="There are currently no events matching your search or filters. Try adjusting your query or create a new event!"
          actionHref="/events/new"
          actionText="Create an Event"
          icon={Calendar}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => {
            const isFull = ev.attendeeCount >= ev.capacity;
            const percentFilled = Math.min(Math.round((ev.attendeeCount / ev.capacity) * 100), 100);

            return (
              <div
                key={ev.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Cover */}
                  <div className="h-48 bg-slate-100 relative overflow-hidden">
                    <img
                      src={
                        ev.coverImage ||
                        "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800"
                      }
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-white/95 backdrop-blur text-slate-900 px-2.5 py-0.5 rounded-full shadow-xs">
                        {ev.category}
                      </span>
                    </div>

                    {ev.isRegistered && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Registered
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-primary-600 transition-colors">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {ev.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatDate(ev.date)}</span>
                        <span className="text-slate-300">•</span>
                        <span>{ev.startTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{ev.venue}</span>
                      </div>
                    </div>

                    {/* Capacity Indicator */}
                    <div className="pt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {ev.attendeeCount} / {ev.capacity} Attendees
                        </span>
                        <span>{isFull ? "Full" : `${percentFilled}% capacity`}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isFull ? "bg-rose-500" : percentFilled > 80 ? "bg-amber-500" : "bg-primary-500"
                          }`}
                          style={{ width: `${percentFilled}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-5 pt-0 flex items-center gap-2 border-t border-slate-100 mt-4">
                  <Link
                    href={`/events/${ev.id}`}
                    className="flex-1 text-center py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    View Details
                  </Link>

                  <button
                    onClick={() => handleRegisterToggle(ev.id, ev.isRegistered)}
                    disabled={registeringId === ev.id || (!ev.isRegistered && isFull)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
                      ev.isRegistered
                        ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                        : isFull
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-primary-600 text-white hover:bg-primary-700 shadow-xs"
                    }`}
                  >
                    {registeringId === ev.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : ev.isRegistered ? (
                      "Cancel Pass"
                    ) : isFull ? (
                      "Event Full"
                    ) : (
                      "Register"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
