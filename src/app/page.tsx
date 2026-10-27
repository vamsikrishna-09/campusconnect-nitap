import React from "react";
import Link from "next/link";
import {
  Calendar,
  Search,
  MessageSquare,
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  Users,
  Sparkles,
  MapPin,
  CheckCircle2,
  Building,
  GraduationCap,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/utils";

export const revalidate = 0;

export default async function LandingPage() {
  let userCount = 5;
  let eventCount = 4;
  let resolvedCount = 8;
  let totalRaised = 32500;
  let featuredEvents: any[] = [];
  let featuredCampaigns: any[] = [];

  try {
    const [
      uCount,
      eCount,
      rCount,
      donationSum,
      fEvents,
      fCampaigns,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.event.count({ where: { status: "UPCOMING" } }),
      prisma.lostAndFoundItem.count({ where: { status: "RESOLVED" } }),
      prisma.donation.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true },
      }),
      prisma.event.findMany({
        where: { status: "UPCOMING" },
        take: 2,
        orderBy: { date: "asc" },
        include: {
          _count: { select: { registrations: true } },
        },
      }),
      prisma.campaign.findMany({
        where: { status: "VERIFIED" },
        take: 2,
        orderBy: { raisedAmount: "desc" },
      }),
    ]);

    userCount = uCount;
    eventCount = eCount;
    resolvedCount = rCount;
    totalRaised = donationSum._sum.amount || 32500;
    featuredEvents = fEvents;
    featuredCampaigns = fCampaigns;
  } catch (err) {
    console.error("Landing page data fetch fallback:", err);
  }


  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-primary-950 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold text-primary-300">
            <GraduationCap className="w-4 h-4 text-primary-400" />
            <span>National Institute of Technology Andhra Pradesh</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            The Central Hub for{" "}
            <span className="bg-gradient-to-r from-blue-400 via-primary-300 to-emerald-400 bg-clip-text text-transparent">
              Campus Life at NIT-AP
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            No more fragmented WhatsApp groups, missed Vulcanzy announcements, or lost ID cards. Discover campus events, reunite lost items, find hackathon teammates, and support verified student causes.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/events"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold shadow-lg shadow-primary-600/30 transition-all hover:scale-[1.02]"
            >
              <Calendar className="w-4 h-4" />
              Explore Events
            </Link>
            <Link
              href="/lost-found"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-all hover:scale-[1.02]"
            >
              <Search className="w-4 h-4" />
              Lost & Found Portal
            </Link>
            <Link
              href="/community"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-semibold transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Campus Buzz
            </Link>
          </div>

          <div className="pt-2 text-xs text-slate-400 flex items-center justify-center gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Institute-Verified Members
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Role-Based Moderation
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Student-Driven
            </span>
          </div>
        </div>

        {/* Live Campus Metric Counter Bar */}
        <div className="relative max-w-5xl mx-auto mt-14 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 p-6 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="pt-2 md:pt-0">
              <div className="text-3xl font-extrabold text-white tracking-tight">{userCount}</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Students & Faculty</div>
            </div>
            <div className="pt-2 md:pt-0">
              <div className="text-3xl font-extrabold text-blue-400 tracking-tight">{eventCount}</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Upcoming Events</div>
            </div>
            <div className="pt-2 md:pt-0">
              <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">{resolvedCount}+</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Belongings Reunited</div>
            </div>
            <div className="pt-2 md:pt-0">
              <div className="text-3xl font-extrabold text-amber-400 tracking-tight">{formatINR(totalRaised)}</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Verified Causes Raised</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Modules Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">
            Complete Ecosystem
          </span>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Designed for Every Aspect of NIT-AP Life
          </h2>
          <p className="text-sm text-slate-500">
            Four specialized modules working together to keep students informed, connected, and safe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Events */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Event Discovery</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Discover fests like Vulcanzy, IEEE workshops, and sports tournaments. Register with enforced capacity limits and never miss out.
              </p>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Browse Events <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Lost & Found */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Lost and Found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hyperlocal reporting tagged by campus locations (SRK Bhavan, Central Library, Hostels). Safe claim workflow prevents impersonation.
              </p>
            </div>
            <Link
              href="/lost-found"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700"
            >
              View Lost Items <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Community */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Campus Community</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Find SIH hackathon teammates, coordinate Tadepalligudem station cab pools, share engineering notes, and ask for help.
              </p>
            </div>
            <Link
              href="/community"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              Join Discussion <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: Philanthropy */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Verified Causes</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Student-led campaigns verified by the Dean of Student Welfare before fundraising. Transparent fund usage and audit trails.
              </p>
            </div>
            <Link
              href="/philanthropy"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700"
            >
              Explore Causes <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Events & Causes Previews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Happening This Month</h3>
            <p className="text-xs text-slate-500 mt-1">Official events on the NIT-AP calendar</p>
          </div>
          <Link
            href="/events"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
          >
            All Events <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredEvents.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row"
            >
              <div className="sm:w-48 h-44 sm:h-auto bg-slate-100 relative shrink-0">
                <img
                  src={ev.coverImage || "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800"}
                  alt={ev.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 text-[10px] font-bold bg-white/90 backdrop-blur text-slate-900 px-2 py-0.5 rounded-full shadow-xs">
                  {ev.category}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-base line-clamp-1">{ev.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {ev.description}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[180px]">{ev.venue}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {ev._count.registrations} / {ev.capacity}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/events/${ev.id}`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-primary-600 rounded-xl transition-colors"
                >
                  View Details & Register
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Campus Location Focus Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-primary-800/40 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 text-primary-300 text-xs font-bold">
              <Building className="w-4 h-4" />
              <span>Permanent Campus at Tadepalligudem</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hyperlocal for NIT Andhra Pradesh
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every feature is tuned to the geography of our 172-acre campus. Tag lost items by Hostels 1–4, Central Library, or SRK Bhavan. Arrange auto pools from Tadepalligudem station.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/auth/register"
                className="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-white text-xs font-bold transition-all"
              >
                Join with @nitandhra.ac.in
              </Link>
              <Link
                href="/auth/login"
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
              >
                Demo Sign In
              </Link>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 w-full lg:w-96 space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Administration
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Moderated by Student Council representatives and supervised by the Dean of Student Affairs to uphold institute standards.
            </p>
            <div className="border-t border-white/10 pt-3 flex items-center justify-between text-slate-400 text-[11px]">
              <span>Tadepalligudem - 534101</span>
              <span>West Godavari, AP</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
