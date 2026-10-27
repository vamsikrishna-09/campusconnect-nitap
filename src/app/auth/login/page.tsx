"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn, Sparkles, AlertCircle, ArrowRight, CheckCircle2, User, Shield, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      window.location.href = "/dashboard";
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Demo login failed");
      }

      window.location.href = "/dashboard";
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Demo login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-md shadow-primary-500/20">
            CC
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign In to CampusConnect
          </h2>
          <p className="text-xs text-slate-500">
            National Institute of Technology Andhra Pradesh
          </p>
        </div>

        {/* 1-Click Evaluation Bar */}
        <div className="bg-gradient-to-r from-primary-950 via-slate-900 to-primary-950 rounded-2xl p-4 text-white shadow-lg border border-primary-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              1-Click Demo Evaluation Login
            </span>
            <span className="text-[10px] bg-primary-500/30 text-primary-300 px-2 py-0.5 rounded-full font-semibold border border-primary-400/30">
              For Reviewers
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("STUDENT")}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all text-xs"
            >
              <div className="flex items-center gap-1.5 font-bold text-blue-300 text-[11px]">
                <User className="w-3.5 h-3.5" /> Student
              </div>
              <div className="text-[10px] text-slate-300 truncate mt-0.5">Arun (CSE)</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin("MODERATOR")}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all text-xs"
            >
              <div className="flex items-center gap-1.5 font-bold text-purple-300 text-[11px]">
                <Shield className="w-3.5 h-3.5" /> Moderator
              </div>
              <div className="text-[10px] text-slate-300 truncate mt-0.5">Priya (ECE)</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin("ADMIN")}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all text-xs"
            >
              <div className="flex items-center gap-1.5 font-bold text-emerald-300 text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5" /> Admin
              </div>
              <div className="text-[10px] text-slate-300 truncate mt-0.5">Dean Affairs</div>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Campus Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@nitandhra.ac.in"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Signing in..." : "Sign In to NIT-AP Account"}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New to NIT Andhra Pradesh?{" "}
              <Link href="/auth/register" className="font-semibold text-primary-600 hover:text-primary-700">
                Register as Student
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
