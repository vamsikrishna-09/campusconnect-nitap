"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Users,
  Calendar,
  Search,
  HeartHandshake,
  Check,
  X,
  FileText,
  AlertCircle,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { formatINR, formatDate, timeAgo } from "@/lib/utils";

interface Stats {
  totalUsers: number;
  pendingVerifications: number;
  totalEvents: number;
  totalRegistrations: number;
  openLostFound: number;
  resolvedLostFound: number;
  totalPosts: number;
  verifiedCampaigns: number;
  pendingCampaigns: number;
  totalRaised: number;
  pendingReports: number;
}

interface PendingUser {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  department: string;
  verificationStatus: string;
  idCardUrl?: string;
  createdAt: string;
}

interface PendingCampaign {
  id: string;
  title: string;
  shortSummary: string;
  category: string;
  targetAmount: number;
  fundUsagePlan: string;
  supportingDocsUrl?: string;
  status: string;
  organizer: {
    name: string;
    department?: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [pendingCampaigns, setPendingCampaigns] = useState<PendingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"verifications" | "campaigns" | "overview">("verifications");

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, campRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/verifications?status=PENDING"),
        fetch("/api/philanthropy?status=PENDING_REVIEW"),
      ]);

      if (statsRes.status === 403 || usersRes.status === 403) {
        setUnauthorized(true);
        return;
      }

      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats);
      }
      if (usersRes.ok) {
        const d = await usersRes.json();
        setPendingUsers(d.users || []);
      }
      if (campRes.ok) {
        const d = await campRes.json();
        setPendingCampaigns(d.campaigns || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyUser = async (userId: string, status: "VERIFIED" | "REJECTED") => {
    try {
      setActionLoadingId(userId);
      const res = await fetch(`/api/admin/verifications/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        await loadData();
      } else {
        alert("Verification update failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleVerifyCampaign = async (campaignId: string, action: "VERIFY" | "REJECT") => {
    try {
      setActionLoadingId(campaignId);
      const notes = prompt(
        action === "VERIFY"
          ? "Add optional verification approval notes:"
          : "Add rejection reason for student:"
      );

      const res = await fetch(`/api/philanthropy/${campaignId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          verificationNotes: notes || "Reviewed and verified by Dean of Student Affairs.",
        }),
      });

      if (res.ok) {
        await loadData();
      } else {
        alert("Campaign verification action failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (unauthorized) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Administrator Access Required</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The Admin Panel is restricted to NIT Andhra Pradesh administration (Dean of Student Affairs / Faculty In-Charge).
        </p>
        <p className="text-xs text-slate-700 font-semibold">
          💡 Use the top bar &ldquo;Switch Persona&rdquo; button to switch to <strong>Prof. K. Ramesh (Administrator)</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Administrator Governance Console
            </h1>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" /> Dean Student Affairs
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Student identity verification, philanthropy campaign approvals, and institute health metrics.
          </p>
        </div>
      </div>

      {/* Analytics Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Verified Students</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.totalUsers}</div>
            <div className="text-[11px] text-amber-600 font-semibold">
              {stats.pendingVerifications} Pending ID Reviews
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Events & Regs</span>
              <Calendar className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.totalEvents} Events</div>
            <div className="text-[11px] text-purple-600 font-semibold">
              {stats.totalRegistrations} Registrations
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Lost & Found</span>
              <Search className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.resolvedLostFound} Reunited</div>
            <div className="text-[11px] text-slate-500">
              {stats.openLostFound} currently open
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Philanthropy Raised</span>
              <HeartHandshake className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-extrabold text-rose-600">{formatINR(stats.totalRaised)}</div>
            <div className="text-[11px] text-amber-600 font-semibold">
              {stats.pendingCampaigns} Campaigns Awaiting Review
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("verifications")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "verifications"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Pending Student Verifications ({pendingUsers.length})
        </button>

        <button
          onClick={() => setActiveTab("campaigns")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "campaigns"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Campaign Verification Reviews ({pendingCampaigns.length})
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
        </div>
      ) : activeTab === "verifications" ? (
        /* Student Verifications Workflow */
        <div className="space-y-4">
          {pendingUsers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-3xl border border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All student ID verification requests have been processed!
            </div>
          ) : (
            pendingUsers.map((u) => (
              <div
                key={u.id}
                className="bg-white rounded-3xl p-6 border border-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {u.name}
                    </span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                      Verification Pending
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <span>Roll: <strong>{u.rollNumber}</strong></span> • <span>{u.department}</span> • <span>{u.email}</span>
                  </div>
                  {u.idCardUrl && (
                    <div className="pt-1">
                      <a
                        href={u.idCardUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                      >
                        <FileText className="w-3.5 h-3.5" /> Inspect Uploaded Physical ID Card
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleVerifyUser(u.id, "REJECTED")}
                    disabled={actionLoadingId === u.id}
                    className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button
                    onClick={() => handleVerifyUser(u.id, "VERIFIED")}
                    disabled={actionLoadingId === u.id}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve Student ID
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Philanthropy Verification Workflow */
        <div className="space-y-4">
          {pendingCampaigns.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-3xl border border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              No philanthropy campaigns pending administrative review.
            </div>
          ) : (
            pendingCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-white rounded-3xl p-6 border border-amber-200 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                      Awaiting Verification
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1">{camp.title}</h3>
                    <p className="text-xs text-slate-500">
                      Organized by {camp.organizer.name} ({camp.organizer.department || "NIT-AP"}) • Goal: {formatINR(camp.targetAmount)}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-2">
                  <p><strong>Summary:</strong> {camp.shortSummary}</p>
                  <p><strong>Fund Usage Plan:</strong> {camp.fundUsagePlan}</p>
                  {camp.supportingDocsUrl && (
                    <a
                      href={camp.supportingDocsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-600 font-semibold hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Proposal & Cost Quotation PDF
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleVerifyCampaign(camp.id, "REJECT")}
                    disabled={actionLoadingId === camp.id}
                    className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                  >
                    Reject Campaign
                  </button>
                  <button
                    onClick={() => handleVerifyCampaign(camp.id, "VERIFY")}
                    disabled={actionLoadingId === camp.id}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve & Grant Verified Badge
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
