"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, HeartHandshake, ShieldCheck, AlertCircle, Loader2, Sparkles, FileText } from "lucide-react";
import { PHILANTHROPY_CATEGORIES } from "@/lib/constants";

export default function CreatePhilanthropyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    shortSummary: "",
    story: "",
    category: "ANIMAL_WELFARE",
    targetAmount: "30000",
    beneficiaryInfo: "",
    fundUsagePlan: "",
    supportingDocsUrl: "",
    coverImage: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/philanthropy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit campaign");
      }

      router.push(`/philanthropy/${data.campaign.id}`);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to submit campaign");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        href="/philanthropy"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Philanthropy
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Propose a Student Philanthropy Cause
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Initiatives for campus animal welfare, team competition sponsorship, or student emergency relief.
          </p>
        </div>

        {/* Verification Requirement Alert */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-950">
            <ShieldCheck className="w-4 h-4 text-amber-600" /> Mandatory Administrative Verification
          </div>
          <p className="text-amber-800 text-[11px] leading-relaxed">
            All submitted campaigns are placed in <strong>Pending Review</strong> status. Verification badges are only granted by the Dean of Student Affairs after reviewing proof documents. No public donations are accepted until approved.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Campaign Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. NIT-AP Campus Paws: Stray Animal Care & Vaccination Drive"
              required
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white"
              >
                {PHILANTHROPY_CATEGORIES.filter((c) => c.value !== "ALL").map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Fundraising Amount (₹ INR) *
              </label>
              <input
                type="number"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleChange}
                min="500"
                required
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Short Summary (One-liner for cards) *
            </label>
            <input
              type="text"
              name="shortSummary"
              value={formData.shortSummary}
              onChange={handleChange}
              placeholder="e.g. Vaccinating 28 resident dogs and providing winter feeding shelters on NIT-AP campus."
              required
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Campaign Story & Motivation *
            </label>
            <textarea
              name="story"
              value={formData.story}
              onChange={handleChange}
              rows={5}
              placeholder="Detail the background, problem, plan of action, and expected campus impact..."
              required
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Audited Fund Usage Plan *
            </label>
            <textarea
              name="fundUsagePlan"
              value={formData.fundUsagePlan}
              onChange={handleChange}
              rows={3}
              placeholder="Detailed breakdown: e.g. ₹15,000 for vaccines, ₹10,000 for neutering, ₹5,000 for collars and food..."
              required
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Direct Beneficiaries
              </label>
              <input
                type="text"
                name="beneficiaryInfo"
                value={formData.beneficiaryInfo}
                onChange={handleChange}
                placeholder="e.g. 28 campus community dogs"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Supporting Documents / Proposal URL
              </label>
              <input
                type="url"
                name="supportingDocsUrl"
                value={formData.supportingDocsUrl}
                onChange={handleChange}
                placeholder="https://... (quotation PDF or proposal)"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Cover Image URL
            </label>
            <input
              type="url"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              href="/philanthropy"
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit for Admin Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
