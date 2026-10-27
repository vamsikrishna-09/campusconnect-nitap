import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Calendar,
  Search,
  MessageSquare,
  HeartHandshake,
  CheckCircle,
  AlertTriangle,
  Plus,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Users,
  ShieldAlert,
  Bell,
} from "lucide-react";
import { formatDateTime, formatINR } from "@/lib/utils";

export const revalidate = 0;

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // If not logged in, show demo banner or redirect prompt
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Welcome to CampusConnect NIT-AP</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Please log in or select a demo persona to view your personalized student dashboard, registered events, and active reports.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/auth/login"
            className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-md transition-all"
          >
            Go to Sign In & Demo Switcher
          </Link>
        </div>
      </div>
    );
  }

  let registeredEvents: any[] = [];
  let userLostFound: any[] = [];
  let recentPosts: any[] = [];
  let activeCampaign: any = null;
  let unreadCount = 0;

  try {
    const [rEvents, lItems, rPosts, aCamp, uCount] = await Promise.all([
      prisma.eventRegistration.findMany({
        where: { userId: user.id, status: "CONFIRMED" },
        include: {
          event: true,
        },
        orderBy: { registeredAt: "desc" },
        take: 3,
      }),
      prisma.lostAndFoundItem.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.communityPost.findMany({
        where: { status: "ACTIVE" },
        include: {
          author: { select: { name: true, department: true } },
          _count: { select: { comments: true, reactions: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.campaign.findFirst({
        where: { status: "VERIFIED" },
        orderBy: { raisedAmount: "desc" },
      }),
      prisma.notification.count({
        where: { userId: user.id, isRead: false },
      }),
    ]);

    registeredEvents = rEvents;
    userLostFound = lItems;
    recentPosts = rPosts;
    activeCampaign = aCamp;
    unreadCount = uCount;
  } catch (err) {
    console.error("Dashboard query error:", err);
  }


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Welcome Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-primary-900/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-400">
                Student Dashboard
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                  user.verificationStatus === "VERIFIED"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                    : "bg-amber-500/20 text-amber-300 border-amber-400/30"
                }`}
              >
                {user.verificationStatus === "VERIFIED" ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    Verified Student
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    Verification Pending
                  </>
                )}
              </span>
              <span className="text-[10px] bg-white/10 text-slate-300 px-2.5 py-0.5 rounded-full border border-white/10">
                {user.role}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user.name} 👋
            </h1>

            <p className="text-xs sm:text-sm text-slate-300">
              {user.department || "NIT Andhra Pradesh"} • Roll No: {user.rollNumber || "421101"}
            </p>
          </div>

          {/* Quick Stats in Banner */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 text-xs">
            <div className="text-center px-2">
              <div className="text-xl font-bold text-white">{registeredEvents.length}</div>
              <div className="text-[11px] text-slate-300">Registered Events</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center px-2">
              <div className="text-xl font-bold text-white">{userLostFound.length}</div>
              <div className="text-[11px] text-slate-300">My Reports</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center px-2">
              <div className="text-xl font-bold text-white">{unreadCount}</div>
              <div className="text-[11px] text-slate-300">Notifications</div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Warning if status == PENDING */}
      {user.verificationStatus === "PENDING" && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-amber-950">Campus Verification Pending</p>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Your student profile is currently undergoing review by the administrator. Once approved, you can publish crowdfunding causes and manage council activities.
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold shrink-0"
          >
            Check Status
          </Link>
        </div>
      )}

      {/* Quick Action Toolbar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/events/new"
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-primary-400 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Host an Event</div>
            <div className="text-[10px] text-slate-500">Club or fest activity</div>
          </div>
        </Link>

        <Link
          href="/lost-found/new"
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-purple-400 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Report Lost/Found</div>
            <div className="text-[10px] text-slate-500">Tag campus location</div>
          </div>
        </Link>

        <Link
          href="/community/new"
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Post Teammate Search</div>
            <div className="text-[10px] text-slate-500">SIH & projects pool</div>
          </div>
        </Link>

        <Link
          href="/philanthropy/new"
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-rose-400 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Start a Cause</div>
            <div className="text-[10px] text-slate-500">Verified student relief</div>
          </div>
        </Link>
      </div>

      {/* Main Grid: My Events & Campus Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Events & Lost/Found (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Registered Events */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-bold text-slate-900">My Registered Events</h2>
              </div>
              <Link
                href="/events"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                Find More Events <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {registeredEvents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                You haven&apos;t registered for any upcoming events yet. Check out Vulcanzy 2026 or HackNITAP!
              </div>
            ) : (
              <div className="space-y-3">
                {registeredEvents.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {r.event.category}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Confirmed
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{r.event.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {r.event.venue}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {r.event.startTime}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/events/${r.event.id}`}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-primary-600 rounded-lg transition-colors text-center shrink-0"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Lost & Found Reports */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-slate-900">My Lost & Found Activity</h2>
              </div>
              <Link
                href="/lost-found"
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                Lost & Found Hub <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {userLostFound.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                No active lost or found reports submitted by you.
              </div>
            ) : (
              <div className="space-y-3">
                {userLostFound.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.type === "LOST"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {item.type}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.status === "RESOLVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{item.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {item.campusLocation}
                      </p>
                    </div>

                    <Link
                      href={`/lost-found/${item.id}`}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors shrink-0"
                    >
                      Manage
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Philanthropy Spotlight & Recent Campus Buzz */}
        <div className="space-y-8">
          {/* Active Philanthropy Campaign Card */}
          {activeCampaign && (
            <div className="bg-gradient-to-br from-white to-rose-50/40 rounded-2xl p-6 border border-rose-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <HeartHandshake className="w-3 h-3" /> Verified Student Cause
                </span>
                <span className="text-[10px] text-slate-500">Transparent</span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{activeCampaign.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {activeCampaign.shortSummary}
                </p>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900">{formatINR(activeCampaign.raisedAmount)}</span>
                  <span className="text-slate-500">Goal: {formatINR(activeCampaign.targetAmount)}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-primary-600 rounded-full"
                    style={{
                      width: `${Math.min(
                        Math.round((activeCampaign.raisedAmount / activeCampaign.targetAmount) * 100),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <Link
                href={`/philanthropy/${activeCampaign.id}`}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs shadow-rose-600/20"
              >
                View Cause & Test Donation
              </Link>
            </div>
          )}

          {/* Recent Community Feed */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Campus Buzz</h2>
              </div>
              <Link
                href="/community"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Feed
              </Link>
            </div>

            <div className="space-y-3">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/community/${post.id}`}
                  className="block p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all space-y-1"
                >
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {post.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-xs line-clamp-1 mt-1">
                    {post.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>{post.author.name}</span>
                    <span>{post._count.comments} replies</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
