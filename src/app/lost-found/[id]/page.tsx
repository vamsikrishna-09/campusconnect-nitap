"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Tag,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Trash2,
  Flag,
  Share2,
  Lock,
  Loader2,
  Send,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import ReportModal from "@/components/ReportModal";

interface Claim {
  id: string;
  message: string;
  proofDetails?: string;
  contactInfo?: string;
  createdAt: string;
  claimant: {
    name: string;
    department?: string;
    email: string;
  };
}

interface ItemDetail {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  campusLocation: string;
  itemDate: string;
  contactMethod: string;
  contactDetails?: string;
  imageUrl?: string;
  status: string;
  isOwner: boolean;
  reporter: {
    id: string;
    name: string;
    department?: string;
    email: string;
  };
  claims: Claim[];
}

export default function LostFoundDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimMessage, setClaimMessage] = useState("");
  const [claimProof, setClaimProof] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/lost-found/${itemId}`);
      if (res.ok) {
        const data = await res.json();
        setItem(data.item);
      } else {
        router.push("/lost-found");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) fetchItem();
  }, [itemId]);

  const handleResolveToggle = async () => {
    if (!item) return;
    try {
      setActionLoading(true);
      const nextStatus = item.status === "RESOLVED" ? "OPEN" : "RESOLVED";
      const res = await fetch(`/api/lost-found/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setMessage({
          text: nextStatus === "RESOLVED" ? "Item marked as resolved / reunited! 🎉" : "Item reopened.",
          type: "success",
        });
        await fetchItem();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this report?")) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/lost-found/${itemId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/lost-found");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimMessage) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/lost-found/${itemId}/claims`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: claimMessage,
          proofDetails: claimProof,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit claim");

      setMessage({
        text: "Your claim message has been sent to the reporter safely.",
        type: "success",
      });
      setClaimModalOpen(false);
      setClaimMessage("");
      setClaimProof("");
      await fetchItem();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage({ text: err.message, type: "error" });
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/lost-found"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Lost & Found
        </Link>
        <button
          onClick={() => setReportModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors"
        >
          <Flag className="w-3.5 h-3.5" /> Report Issue
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Photo Banner if exists */}
        {item.imageUrl && (
          <div className="h-72 sm:h-96 w-full bg-slate-900 relative">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 sm:p-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  item.type === "LOST"
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}
              >
                {item.type} REPORT
              </span>
              <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                {item.category.replace("_", " ")}
              </span>
            </div>

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                item.status === "RESOLVED"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-amber-100 text-amber-800 border border-amber-200"
              }`}
            >
              Status: {item.status}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {item.title}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Location: <strong className="text-slate-800">{item.campusLocation}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Date: <strong className="text-slate-800">{formatDate(item.itemDate)}</strong></span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Detailed Description</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* Safe Contact Notice */}
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs text-purple-900 space-y-2">
            <div className="font-bold flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" /> Safe Campus Contact
            </div>
            <p className="text-purple-800 text-[11px] leading-relaxed">
              To protect student privacy and avoid false claims, contact details are guarded. Use the safe claim form below to communicate proof of ownership with the reporter.
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Reported by: <strong className="text-slate-800">{item.reporter.name}</strong> ({item.reporter.department || "NIT-AP"})
            </div>

            <div className="flex items-center gap-3">
              {item.isOwner ? (
                <>
                  <button
                    onClick={handleResolveToggle}
                    disabled={actionLoading}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                      item.status === "RESOLVED"
                        ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {item.status === "RESOLVED" ? "Re-open Report" : "Mark as Resolved"}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : item.status === "OPEN" ? (
                <button
                  onClick={() => setClaimModalOpen(true)}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact / Claim Item
                </button>
              ) : (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Item Resolved
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Claims Inquiries List (For Item Owner) */}
      {item.isOwner && item.claims && item.claims.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">
            Received Inquiries & Claims ({item.claims.length})
          </h3>
          <div className="space-y-3">
            {item.claims.map((claim) => (
              <div
                key={claim.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{claim.claimant.name}</span>
                  <span className="text-[11px] text-slate-400">{formatDate(claim.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-700">{claim.message}</p>
                {claim.proofDetails && (
                  <div className="text-[11px] text-purple-900 bg-purple-50 p-2.5 rounded-xl border border-purple-100">
                    <strong>Proof Details:</strong> {claim.proofDetails}
                  </div>
                )}
                <div className="text-[11px] text-slate-500 pt-1">
                  Email: {claim.claimant.email}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Claim Submission Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Submit Claim / Message to Finder
            </h3>
            <p className="text-xs text-slate-500">
              Provide identifying details (e.g. wallpaper description, scratch mark, sticker, ID details) so the finder can verify ownership safely.
            </p>

            <form onSubmit={handleClaimSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message *
                </label>
                <textarea
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  rows={3}
                  placeholder="Hello, I believe this is mine. It was misplaced around..."
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proof of Ownership (Key Identifier)
                </label>
                <input
                  type="text"
                  value={claimProof}
                  onChange={(e) => setClaimProof(e.target.value)}
                  placeholder="e.g. Has a small silver sticker on bottom right"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClaimModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Send Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="LOST_FOUND"
        targetId={item.id}
        targetTitle={item.title}
      />
    </div>
  );
}
