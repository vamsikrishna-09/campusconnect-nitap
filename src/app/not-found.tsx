import React from "react";
import Link from "next/link";
import { Compass, ArrowRight, Home, Calendar, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-primary-600 flex items-center justify-center mx-auto border border-blue-100 shadow-sm">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">
            Error 404
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Lost on Campus?
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            The page you are looking for does not exist or may have been moved. Let&apos;s get you back to the active campus zones of NIT Andhra Pradesh.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href="/"
            className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            <Home className="w-4 h-4 text-slate-400" /> Home Page
          </Link>
          <Link
            href="/events"
            className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            <Calendar className="w-4 h-4 text-slate-400" /> Campus Events
          </Link>
          <Link
            href="/lost-found"
            className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            <Search className="w-4 h-4 text-slate-400" /> Lost & Found
          </Link>
          <Link
            href="/dashboard"
            className="p-3 rounded-2xl bg-primary-600 hover:bg-primary-700 shadow-xs flex items-center justify-center gap-2 text-xs font-bold text-white transition-all"
          >
            Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
