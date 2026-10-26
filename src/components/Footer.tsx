import React from "react";
import Link from "next/link";
import { ShieldCheck, MapPin, Mail, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
                CC
              </div>
              <span className="font-bold text-white text-base tracking-tight">CampusConnect</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unified community platform designed for students, faculty, and clubs of National Institute of Technology Andhra Pradesh.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-primary-400 font-medium">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Tadepalligudem, Andhra Pradesh</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Features</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/events" className="hover:text-white transition-colors">
                  Campus Events & Fests
                </Link>
              </li>
              <li>
                <Link href="/lost-found" className="hover:text-white transition-colors">
                  Lost & Found Hub
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-white transition-colors">
                  Teammates & Discussion Feed
                </Link>
              </li>
              <li>
                <Link href="/philanthropy" className="hover:text-white transition-colors">
                  Verified Student Philanthropy
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Governance */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Governance</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/moderator" className="hover:text-white transition-colors">
                  Moderator Queue
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Admin Verification & Audits
                </Link>
              </li>
              <li>
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Role-Based Security
                </span>
              </li>
              <li>
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  @nitandhra.ac.in Verified
                </span>
              </li>
            </ul>
          </div>

          {/* Simulation disclaimer & evaluation */}
          <div className="space-y-2 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo & Evaluation Mode</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Philanthropy donations on this platform are simulated for student testing and accreditation review. No real currency is charged.
            </p>
            <p className="text-[11px] text-slate-400">
              Evaluators can switch between Student, Moderator, and Administrator personas anytime via the top bar.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 CampusConnect — National Institute of Technology Andhra Pradesh.</p>
          <p>Built with Next.js 14, Tailwind CSS & Prisma ORM.</p>
        </div>
      </div>
    </footer>
  );
}
