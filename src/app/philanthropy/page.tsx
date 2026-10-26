"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HeartHandshake,
  Search,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Users,
  ArrowRight,
  Loader2,
  Sparkles,
  Info,
} from "lucide-react";
import { PHILANTHROPY_CATEGORIES } from "@/lib/constants";
import { formatINR } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";

interface CampaignItem {
  id: string;
  title: string;
  shortSummary: string;
  category: string;
  coverImage?: string;
  targetAmount: number;
  raisedAmount: number;
  percentage: number;
  status: string;
  donorCount: number;
  organizer: {
    name: string;
    department?: string;
  };
  verifiedBy?: {
    name: string;
  };
}

export default function PhilanthropyPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search);
      if (category !== "ALL") params.set("category", category);

      const res = await fetch(`/api/philanthropy?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCampaigns();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Verified Student Philanthropy
            </h1>
            <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" /> Admin Verified
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Student-driven causes at NIT Andhra Pradesh. Every rupee is audited and approved before public fundraising.
          </p>
        </div>

        <Link
          href="/philanthropy/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Propose a Campus Cause
        </Link>
      </div>

      {/* Verification Transparency Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-primary-950 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-rose-900/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Strict Verification Standards</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Only campaigns verified by the Dean of Student Affairs appear publicly. Creators must submit quotation documents, veterinary plans, or faculty club approvals.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl text-[11px] text-amber-300 border border-white/10 shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Demo Checkout Mode Active</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search causes by title, keyword, or community initiative..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PHILANTHROPY_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                category === cat.value
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-rose-600 mx-auto" />
          <p className="text-xs text-slate-500 mt-2">Loading campus causes...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          title="No verified causes found"
          description="There are currently no active verified campaigns matching your filter. Feel free to propose a student welfare or animal welfare drive."
          actionHref="/philanthropy/new"
          actionText="Propose Cause"
          icon={HeartHandshake}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Cover */}
                <div className="h-48 bg-slate-100 relative overflow-hidden">
                  <img
                    src={
                      camp.coverImage ||
                      "https://images.unsplash.com/photo-1532629345422-7515f3d16bb4?auto=format&fit=crop&q=80&w=800"
                    }
                    alt={camp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold bg-white/95 backdrop-blur text-slate-900 px-2.5 py-0.5 rounded-full shadow-xs">
                      {camp.category.replace("_", " ")}
                    </span>
                  </div>

                  <span className="absolute top-3 right-3 text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Cause
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-rose-600 transition-colors">
                      {camp.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1">
                      {camp.shortSummary}
                    </p>
                  </div>

                  {/* Financial progress bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-900">
                        {formatINR(camp.raisedAmount)}
                      </span>
                      <span className="text-slate-500 font-medium">
                        Goal: {formatINR(camp.targetAmount)}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-primary-600 rounded-full transition-all duration-500"
                        style={{ width: `${camp.percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span>{camp.percentage}% funded</span>
                      <span>{camp.donorCount} supporters</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-5 pt-0 border-t border-slate-100 mt-4 flex items-center gap-2">
                <Link
                  href={`/philanthropy/${camp.id}`}
                  className="flex-1 text-center py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  View Story & Updates
                </Link>

                <Link
                  href={`/philanthropy/${camp.id}/donate`}
                  className="flex-1 text-center py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs shadow-rose-600/20"
                >
                  Test Donate
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
