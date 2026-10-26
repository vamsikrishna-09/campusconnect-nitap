"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Search,
  MessageSquare,
  HeartHandshake,
  Edit,
  Mail,
  Phone,
  Hash,
  Building,
  GraduationCap,
  Loader2,
  Sparkles,
} from "lucide-react";
import { formatINR, formatDate, timeAgo } from "@/lib/utils";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  rollNumber?: string;
  department?: string;
  graduationYear?: number;
  phone?: string;
  avatar?: string;
  bio?: string;
  role: string;
  verificationStatus: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [lostFoundReports, setLostFoundReports] = useState<any[]>([]);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"events" | "lostFound" | "posts" | "donations">("events");

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setRegisteredEvents(data.registeredEvents || []);
        setLostFoundReports(data.lostFoundReports || []);
        setCommunityPosts(data.communityPosts || []);
        setDonations(data.donations || []);

        setEditPhone(data.profile.phone || "");
        setEditBio(data.profile.bio || "");
        setEditAvatar(data.profile.avatar || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: editPhone,
          bio: editBio,
          avatar: editAvatar,
        }),
      });

      if (res.ok) {
        setIsEditing(false);
        await fetchProfile();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
          <User className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Please Sign In</h2>
        <p className="text-xs text-slate-500">
          Sign in or select a demo persona to view your student profile and campus activity.
        </p>
        <Link
          href="/auth/login"
          className="inline-block px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-900 to-primary-700 text-white flex items-center justify-center text-2xl font-bold uppercase overflow-hidden shadow-md shrink-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.name.slice(0, 2)
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {profile.name}
                </h1>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                    profile.verificationStatus === "VERIFIED"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  {profile.verificationStatus === "VERIFIED" ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Student
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Verification Pending
                    </>
                  )}
                </span>
                <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                  {profile.role}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  <span>Roll No: <strong>{profile.rollNumber || "421101"}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile.department || "NIT Andhra Pradesh"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  <span>Batch of {profile.graduationYear || 2026}</span>
                </div>
              </div>

              {profile.bio && (
                <p className="text-xs text-slate-600 pt-2 leading-relaxed max-w-xl">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 self-start"
          >
            <Edit className="w-3.5 h-3.5" /> {isEditing ? "Close Edit" : "Edit Profile"}
          </button>
        </div>

        {/* Edit Profile Form */}
        {isEditing && (
          <form onSubmit={handleUpdateProfile} className="mt-6 pt-6 border-t border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Update Profile Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bio / Interests
              </label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={2}
                placeholder="Write a brief introduction about your technical interests, clubs, or sports..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl flex items-center gap-1.5"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Profile
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Activity Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: "events", label: `My Events (${registeredEvents.length})`, icon: Calendar },
          { id: "lostFound", label: `Lost & Found (${lostFoundReports.length})`, icon: Search },
          { id: "posts", label: `Community Posts (${communityPosts.length})`, icon: MessageSquare },
          { id: "donations", label: `Donations (${donations.length})`, icon: HeartHandshake },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-4">
        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="space-y-3">
            {registeredEvents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                You haven&apos;t joined any campus events yet.
              </div>
            ) : (
              registeredEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {ev.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{ev.title}</h3>
                    <p className="text-xs text-slate-500">{ev.venue} • {formatDate(ev.date)}</p>
                  </div>
                  <Link
                    href={`/events/${ev.id}`}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                  >
                    View Details
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {/* Lost & Found Tab */}
        {activeTab === "lostFound" && (
          <div className="space-y-3">
            {lostFoundReports.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                No lost or found reports published by you.
              </div>
            ) : (
              lostFoundReports.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.type === "LOST" ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>
                        {item.type}
                      </span>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                        {item.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                    <p className="text-xs text-slate-500">{item.campusLocation} • {formatDate(item.itemDate)}</p>
                  </div>
                  <Link
                    href={`/lost-found/${item.id}`}
                    className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl"
                  >
                    Manage
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div className="space-y-3">
            {communityPosts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                You haven&apos;t published any community discussions yet.
              </div>
            ) : (
              communityPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {post.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{post.title}</h3>
                    <p className="text-xs text-slate-400">{timeAgo(post.createdAt)} • {post._count.comments} comments</p>
                  </div>
                  <Link
                    href={`/community/${post.id}`}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl"
                  >
                    View Thread
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === "donations" && (
          <div className="space-y-3">
            {donations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                No donations recorded yet. Support campus causes in the Philanthropy portal!
              </div>
            ) : (
              donations.map((don) => (
                <div
                  key={don.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-rose-600">
                      Contributed {formatINR(don.amount)}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{don.campaign.title}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Ref: {don.transactionRef} • {formatDate(don.createdAt)}
                    </p>
                  </div>
                  <Link
                    href={`/philanthropy/${don.campaign.id}`}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl"
                  >
                    View Cause
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
