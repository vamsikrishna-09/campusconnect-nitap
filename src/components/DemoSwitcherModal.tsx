"use client";

import React, { useState } from "react";
import { User, Shield, ShieldAlert, CheckCircle, ArrowRight, X, Sparkles, RefreshCw } from "lucide-react";

interface DemoSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export default function DemoSwitcherModal({ isOpen, onClose, currentUser }: DemoSwitcherModalProps) {
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSwitch = async (role: string) => {
    try {
      setLoadingRole(role);
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert("Demo login failed. Make sure the database is seeded.");
      }
    } catch (err) {
      console.error(err);
      alert("Error switching demo accounts");
    } finally {
      setLoadingRole(null);
    }
  };

  const personas = [
    {
      role: "STUDENT",
      name: "Arun Kumar",
      roll: "421101 (Final Year CSE)",
      email: "arun.cse@nitandhra.ac.in",
      title: "Student Persona",
      badge: "Verified Student",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      icon: User,
      color: "border-blue-500 hover:bg-blue-50/50",
      desc: "Full student experience: discover events, register with capacity limits, report/claim lost items, publish hackathon teammate requests, and complete test donations.",
    },
    {
      role: "MODERATOR",
      name: "Priya Sharma",
      roll: "422215 (Pre-final ECE)",
      email: "priya.ece@nitandhra.ac.in",
      title: "Moderator Persona",
      badge: "Campus Moderator",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      icon: Shield,
      color: "border-purple-500 hover:bg-purple-50/50",
      desc: "Student council moderator: review reported posts and comments in the Moderator Dashboard, dismiss flags or delete offending content with audit logs.",
    },
    {
      role: "ADMIN",
      name: "Prof. K. Ramesh",
      roll: "Dean of Student Affairs",
      email: "admin@nitandhra.ac.in",
      title: "Administrator Persona",
      badge: "Institute Admin",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: ShieldAlert,
      color: "border-emerald-500 hover:bg-emerald-50/50",
      desc: "Executive administrative oversight: approve/reject student identity verifications, inspect and verify student-led philanthropy campaigns before fundraising, and monitor campus analytics.",
    },
    {
      role: "UNVERIFIED",
      name: "Rahul Varma",
      roll: "423340 (2nd Year EEE)",
      email: "rahul.eee@nitandhra.ac.in",
      title: "Pending Verification Student",
      badge: "Verification Pending",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      icon: User,
      color: "border-amber-500 hover:bg-amber-50/50",
      desc: "Use this persona to test the Admin verification workflow! Login as Rahul, see the pending banner, then switch to Admin to approve his ID card.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-primary-900 to-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-500/20 rounded-xl border border-primary-400/30 text-primary-300">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Demo Persona Switcher</h3>
              <p className="text-sm text-slate-300">
                1-Click test access across roles for NIT Andhra Pradesh evaluators
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Currently active:{" "}
            <span className="font-semibold text-slate-900">
              {currentUser ? `${currentUser.name} (${currentUser.role})` : "Guest / Not Logged In"}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
            <CheckCircle className="w-3.5 h-3.5" /> Instant Session Switch
          </span>
        </div>

        {/* Personas Grid */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {personas.map((p) => {
            const Icon = p.icon;
            const isCurrent = currentUser?.email === p.email;
            return (
              <div
                key={p.role}
                onClick={() => !loadingRole && handleSwitch(p.role)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCurrent
                    ? "border-primary-500 bg-primary-50/40 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 text-base">{p.name}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${p.badgeColor}`}>
                        {p.badge}
                      </span>
                      {isCurrent && (
                        <span className="text-[11px] font-bold bg-primary-600 text-white px-2 py-0.5 rounded-full">
                          Active Now
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{p.roll} • {p.email}</p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{p.desc}</p>
                  </div>
                </div>

                <button
                  disabled={loadingRole !== null}
                  className={`shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                    isCurrent
                      ? "bg-slate-200 text-slate-600 cursor-default"
                      : "bg-slate-900 hover:bg-primary-600 text-white shadow-sm"
                  }`}
                >
                  {loadingRole === p.role ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {isCurrent ? "Active" : "Switch"} <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Default test password: <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-800">Password123!</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
