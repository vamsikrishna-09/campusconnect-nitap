"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  HeartHandshake,
  ShieldCheck,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Sparkles,
  AlertTriangle,
  Loader2,
  FileText,
  User,
  Share2,
  Lock,
  Plus,
} from "lucide-react";
import { formatINR, formatDate, timeAgo } from "@/lib/utils";

interface Donation {
  id: string;
  donorName: string;
  amount: number;
  isAnonymous: boolean;
  message?: string;
  createdAt: string;
  paymentMethod: string;
}

interface CampaignUpdate {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  postedAt: string;
}

interface CampaignDetail {
  id: string;
  title: string;
  shortSummary: string;
  story: string;
  category: string;
  coverImage?: string;
  targetAmount: number;
  raisedAmount: number;
  percentage: number;
  beneficiaryInfo?: string;
  fundUsagePlan: string;
  supportingDocsUrl?: string;
  status: string;
  verificationNotes?: string;
  verifiedAt?: string;
  isOrganizer: boolean;
  isAdmin: boolean;
  organizer: {
    id: string;
    name: string;
    department?: string;
    email: string;
  };
  verifiedBy?: {
    name: string;
    department?: string;
  };
  donations: Donation[];
  updates: CampaignUpdate[];
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateContent, setUpdateContent] = useState("");
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/philanthropy/${campaignId}`);
      if (res.ok) {
        const data = await res.json();
        setCampaign(data.campaign);
      } else {
        router.push("/philanthropy");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) fetchCampaign();
  }, [campaignId]);

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateTitle || !updateContent) return;

    try {
      setSubmittingUpdate(true);
      const res = await fetch(`/api/philanthropy/${campaignId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: updateTitle, content: updateContent }),
      });

      if (res.ok) {
        setUpdateModalOpen(false);
        setUpdateTitle("");
        setUpdateContent("");
        await fetchCampaign();
      } else {
        alert("Failed to post update");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingUpdate(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600 mx-auto" />
      </div>
    );
  }

  if (!campaign) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/philanthropy"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Causes
        </Link>
      </div>

      {/* Hero Card */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm max-h-[380px]">
        <img
          src={
            campaign.coverImage ||
            "https://images.unsplash.com/photo-1532629345422-7515f3d16bb4?auto=format&fit=crop&q=80&w=1200"
          }
          alt={campaign.title}
          className="w-full h-80 object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold bg-rose-600 text-white px-3 py-0.5 rounded-full">
                {campaign.category.replace("_", " ")}
              </span>

              {campaign.status === "VERIFIED" ? (
                <span className="text-xs font-bold bg-emerald-500 text-white px-3 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Administration Verified
                </span>
              ) : (
                <span className="text-xs font-bold bg-amber-500 text-white px-3 py-0.5 rounded-full">
                  Status: {campaign.status}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {campaign.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Grid: Story & Checkout Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Story, Fund Usage, Updates, Donor Wall */}
        <div className="lg:col-span-2 space-y-8">
          {/* Detailed Story */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900">About this Initiative</h2>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {campaign.story}
            </div>

            {campaign.beneficiaryInfo && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1 mt-4">
                <span className="font-bold text-slate-900">Direct Beneficiaries:</span>
                <p>{campaign.beneficiaryInfo}</p>
              </div>
            )}
          </div>

          {/* Fund Usage Plan */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Audited Fund Usage Breakdown
              </h3>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Pre-Audited
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {campaign.fundUsagePlan}
            </p>

            {campaign.supportingDocsUrl && (
              <div className="pt-2">
                <a
                  href={campaign.supportingDocsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  <FileText className="w-4 h-4" /> View Verified Quotation & Proposal Documents
                </a>
              </div>
            )}
          </div>

          {/* Verification Audit Trail */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Administrative Verification Trail
            </h3>
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-950 space-y-1">
              <p className="font-semibold">
                Verified by: {campaign.verifiedBy ? campaign.verifiedBy.name : "Dean of Student Affairs"}
              </p>
              <p className="text-emerald-800 text-[11px]">
                Notes: {campaign.verificationNotes || "Approved according to NIT Andhra Pradesh student welfare guidelines."}
              </p>
              {campaign.verifiedAt && (
                <p className="text-[10px] text-emerald-700 pt-1">
                  Verification Timestamp: {formatDate(campaign.verifiedAt)}
                </p>
              )}
            </div>
          </div>

          {/* Organizer Updates */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Organizer Updates & Proof ({campaign.updates.length})
              </h3>
              {(campaign.isOrganizer || campaign.isAdmin) && (
                <button
                  onClick={() => setUpdateModalOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Post Update
                </button>
              )}
            </div>

            {campaign.updates.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 rounded-2xl">
                No updates posted yet. Organizers post photos and purchase receipts here.
              </p>
            ) : (
              <div className="space-y-4">
                {campaign.updates.map((up) => (
                  <div
                    key={up.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{up.title}</span>
                      <span className="text-[11px] text-slate-400">{timeAgo(up.postedAt)}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{up.content}</p>
                    {up.imageUrl && (
                      <img
                        src={up.imageUrl}
                        alt="Milestone"
                        className="rounded-xl mt-2 max-h-48 object-cover border border-slate-200"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Donor Wall (Hall of Fame) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Supporters & Donors ({campaign.donations.length})
            </h3>
            <p className="text-xs text-slate-500">
              Community contributions powering this campus cause
            </p>

            {campaign.donations.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 rounded-2xl">
                No donations recorded yet. Be the first to contribute!
              </p>
            ) : (
              <div className="space-y-3">
                {campaign.donations.map((don) => (
                  <div
                    key={don.id}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">
                          {don.donorName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {don.paymentMethod.replace("DEMO_", "")}
                        </span>
                      </div>
                      {don.message && (
                        <p className="text-xs text-slate-600 italic mt-0.5">&ldquo;{don.message}&rdquo;</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(don.createdAt)}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-extrabold text-rose-600">
                        {formatINR(don.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Funding Progress & Donation Action */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 sticky top-24">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Fundraising Progress
              </span>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {formatINR(campaign.raisedAmount)}
              </div>
              <p className="text-xs text-slate-500">
                Pledged of <strong>{formatINR(campaign.targetAmount)}</strong> target
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-primary-600 rounded-full transition-all duration-500"
                  style={{ width: `${campaign.percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 pt-0.5">
                <span>{campaign.percentage}% funded</span>
                <span>{campaign.donations.length} supporters</span>
              </div>
            </div>

            {/* Donation button */}
            <Link
              href={`/philanthropy/${campaign.id}/donate`}
              className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 text-center"
            >
              <HeartHandshake className="w-4 h-4" />
              Make a Test Donation (Simulated)
            </Link>

            {/* Simulation disclaimer */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <Sparkles className="w-3.5 h-3.5" /> Simulated Demo Mode
              </div>
              <p className="leading-relaxed">
                No real payments or cards are charged. This sandbox integration updates campaign balances and emits instant receipts for testing.
              </p>
            </div>

            {/* Organizer details */}
            <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <p>
                Student Organizer: <strong className="text-slate-800">{campaign.organizer.name}</strong>
              </p>
              <p>{campaign.organizer.department || "NIT Andhra Pradesh"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Post Update Modal */}
      {updateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Post Milestone Update</h3>
            <p className="text-xs text-slate-500">
              Share progress, receipts, or photos with students who supported this cause.
            </p>

            <form onSubmit={handlePostUpdate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Update Title *
                </label>
                <input
                  type="text"
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  placeholder="e.g. Phase 1 Completed: 14 Dogs Vaccinated!"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Content *
                </label>
                <textarea
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  rows={4}
                  placeholder="Describe recent actions taken with the funds..."
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUpdateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingUpdate}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-1.5"
                >
                  {submittingUpdate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Publish Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
