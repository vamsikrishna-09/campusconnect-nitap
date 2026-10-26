"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  HeartHandshake,
  CreditCard,
  Smartphone,
  Building,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  Download,
  Receipt,
  User,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

interface CampaignInfo {
  id: string;
  title: string;
  category: string;
  targetAmount: number;
  raisedAmount: number;
  status: string;
}

export default function DonatePage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<CampaignInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("500");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("DEMO_UPI");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success Receipt State
  interface ReceiptData {
    transactionRef: string;
    amount: number;
    donorName: string;
    paymentMethod: string;
    createdAt: string;
  }
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  useEffect(() => {
    async function fetchCampaign() {
      try {
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
    }
    fetchCampaign();
  }, [campaignId]);

  const handlePresetClick = (val: string) => {
    setAmount(val);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProcessing(true);

    try {
      const res = await fetch(`/api/philanthropy/${campaignId}/donate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          donorName,
          donorEmail,
          isAnonymous,
          message,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Donation failed");
      }

      setReceipt(data.donation);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Donation processing failed");
      }
    } finally {
      setProcessing(false);
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Link
        href={`/philanthropy/${campaignId}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Campaign Story
      </Link>

      {receipt ? (
        /* Digital Receipt Card */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6 animate-in fade-in">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-3 py-0.5 rounded-full">
              Simulated Sandbox Transaction
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Contribution Confirmed!
            </h2>
            <p className="text-xs text-slate-500">
              Thank you for supporting student initiatives at NIT Andhra Pradesh.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-slate-500">Amount Contributed</span>
              <span className="text-lg font-extrabold text-rose-600">
                {formatINR(receipt.amount)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Campaign</span>
              <span className="font-semibold text-slate-900 text-right truncate max-w-[200px]">
                {campaign.title}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Donor Name</span>
              <span className="font-semibold text-slate-900">{receipt.donorName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Payment Gateway Rail</span>
              <span className="font-semibold text-slate-900">
                {receipt.paymentMethod.replace("DEMO_", "")} (Simulated)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Audit Transaction ID</span>
              <span className="font-mono text-[11px] font-semibold text-slate-800">
                {receipt.transactionRef}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href={`/philanthropy/${campaignId}`}
              className="flex-1 py-3 text-xs font-bold text-center text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
            >
              Return to Campaign
            </Link>
            <button
              onClick={() => window.print()}
              className="px-4 py-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Receipt className="w-4 h-4" /> Print Receipt
            </button>
          </div>
        </div>
      ) : (
        /* Checkout Form */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
                Philanthropy
              </span>
              <span className="text-xs text-slate-400">• NIT-AP Verified</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Contribute to {campaign.title}
            </h1>
          </div>

          {/* Sandbox Notice Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <Sparkles className="w-4 h-4 text-amber-600" /> Demo Payment Sandbox
            </div>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              This checkout operates in simulated test mode. No actual debit/credit transaction occurs. Your contribution will atomically update the campaign balance and record an auditable ledger entry.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCheckoutSubmit} className="space-y-5">
            {/* Amount Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Contribution Amount (INR ₹) *
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {["200", "500", "1000", "2500"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                      amount === preset
                        ? "border-rose-600 bg-rose-50 text-rose-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>

              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="10"
                required
                placeholder="Or enter custom amount in ₹"
                className="w-full px-3.5 py-2.5 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Payment Rail Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Test Payment Method *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("DEMO_UPI")}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    paymentMethod === "DEMO_UPI"
                      ? "border-rose-600 bg-rose-50/50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-purple-600 mb-1" />
                  <div className="text-xs font-bold text-slate-900">Simulated UPI</div>
                  <div className="text-[10px] text-slate-500">GPay/PhonePe</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("DEMO_CARD")}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    paymentMethod === "DEMO_CARD"
                      ? "border-rose-600 bg-rose-50/50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-600 mb-1" />
                  <div className="text-xs font-bold text-slate-900">Test Card</div>
                  <div className="text-[10px] text-slate-500">Debit / Credit</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("DEMO_NETBANKING")}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    paymentMethod === "DEMO_NETBANKING"
                      ? "border-rose-600 bg-rose-50/50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Building className="w-4 h-4 text-emerald-600 mb-1" />
                  <div className="text-xs font-bold text-slate-900">NetBanking</div>
                  <div className="text-[10px] text-slate-500">SBI / HDFC</div>
                </button>
              </div>
            </div>

            {/* Donor info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Leave blank to use profile name"
                  disabled={isAnonymous}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Receipt Email (Optional)
                </label>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="receipt@nitandhra.ac.in"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Anonymous Toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <span>Donate anonymously (Hide my name from public supporter list)</span>
            </label>

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Words of Encouragement (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                placeholder="Share a short encouraging note for the organizers..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={processing}
                className="w-full py-3.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <HeartHandshake className="w-4 h-4" />
                    Complete Simulated Test Donation of {formatINR(parseFloat(amount) || 0)}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
