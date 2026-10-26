"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Check,
  Loader2,
  Sparkles,
  Filter,
} from "lucide-react";
import { formatDate, timeAgo } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";

interface ReportItem {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  details?: string;
  status: string; // PENDING, DISMISSED, ACTION_TAKEN
  createdAt: string;
  resolutionNotes?: string;
  reporter: {
    name: string;
    email: string;
    department?: string;
  };
  reviewedBy?: {
    name: string;
  };
}

export default function ModeratorDashboard() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/moderator/reports?status=${statusFilter}`);
      if (res.status === 403) {
        setUnauthorized(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleResolve = async (reportId: string, action: "DISMISS" | "ACTION_TAKEN", removeContent = false) => {
    try {
      setActionLoadingId(reportId);
      const res = await fetch(`/api/moderator/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          removeContent,
          resolutionNotes: action === "DISMISS" ? "Dismissed as non-violating." : "Content flagged and removed by Moderator.",
        }),
      });

      if (res.ok) {
        await fetchReports();
      } else {
        alert("Action failed");
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
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Moderator Access Required</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          This dashboard is reserved for Student Council moderators and campus administrators to review reported content and uphold community guidelines.
        </p>
        <p className="text-xs text-slate-600 font-semibold">
          💡 Use the top bar &ldquo;Switch Persona&rdquo; button to switch to <strong>Priya Sharma (Moderator)</strong> or Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Moderator Review Queue
            </h1>
            <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-purple-600" /> Council Governance
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review reported discussions, comments, and lost & found notices flagged by NIT-AP students.
          </p>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          {["ALL", "PENDING", "ACTION_TAKEN", "DISMISSED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          title="No reported items"
          description="The moderation queue is completely clear. No content flags require review at this time."
          icon={Shield}
        />
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className={`bg-white rounded-3xl p-6 border shadow-xs space-y-4 transition-all ${
                rep.status === "PENDING"
                  ? "border-rose-200 bg-rose-50/10"
                  : "border-slate-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold bg-slate-900 text-white px-2.5 py-0.5 rounded-full">
                    Target: {rep.targetType}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      rep.status === "PENDING"
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : rep.status === "ACTION_TAKEN"
                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    Status: {rep.status}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Flagged {timeAgo(rep.createdAt)}
                  </span>
                </div>

                <div className="text-xs text-slate-500">
                  Reporter: <strong className="text-slate-800">{rep.reporter.name}</strong> ({rep.reporter.department || "NIT-AP"})
                </div>
              </div>

              {/* Reason & Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-500">Report Reason:</span>{" "}
                  <strong className="text-rose-700">{rep.reason}</strong>
                </div>
                {rep.details && (
                  <div>
                    <span className="text-slate-500">Context Provided:</span>{" "}
                    <span className="text-slate-700">{rep.details}</span>
                  </div>
                )}
                {rep.resolutionNotes && (
                  <div className="pt-2 border-t border-slate-200 text-slate-600">
                    <strong>Moderation Resolution:</strong> {rep.resolutionNotes} (by {rep.reviewedBy?.name || "Council"})
                  </div>
                )}
              </div>

              {/* Action Buttons for Pending Reports */}
              {rep.status === "PENDING" && (
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleResolve(rep.id, "DISMISS")}
                    disabled={actionLoadingId === rep.id}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Dismiss Flag
                  </button>
                  <button
                    onClick={() => handleResolve(rep.id, "ACTION_TAKEN", true)}
                    disabled={actionLoadingId === rep.id}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Content & Close
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
