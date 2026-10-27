"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  Search,
  MessageSquare,
  HeartHandshake,
  Bell,
  Menu,
  X,
  User,
  Shield,
  ShieldAlert,
  LogOut,
  Sparkles,
  LayoutDashboard,
  CheckCircle,
} from "lucide-react";
import DemoSwitcherModal from "./DemoSwitcherModal";

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  avatar?: string;
  verificationStatus: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchAuth() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          setUnreadCount(data.unreadNotificationsCount || 0);
        }
      } catch (err) {
        console.error("Error checking auth status:", err);
      }
    }
    fetchAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/lost-found", label: "Lost & Found", icon: Search },
    { href: "/community", label: "Community", icon: MessageSquare },
    { href: "/philanthropy", label: "Philanthropy", icon: HeartHandshake },
  ];

  if (currentUser?.role === "MODERATOR" || currentUser?.role === "ADMIN") {
    navLinks.push({ href: "/moderator", label: "Moderator", icon: Shield });
  }

  if (currentUser?.role === "ADMIN") {
    navLinks.push({ href: "/admin", label: "Admin Panel", icon: ShieldAlert });
  }

  return (
    <>
      {/* Top Banner / Announcement */}
      <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 text-white text-[12px] py-1.5 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary-400">NIT Andhra Pradesh</span>
            <span className="text-slate-400 hidden sm:inline">• Tadepalligudem Campus Platform</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDemoModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 border border-primary-400/30 px-2.5 py-0.5 rounded-full font-medium transition-colors"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Switch Persona ({currentUser ? currentUser.role : "Guest"})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-700 to-primary-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
                  CC
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-lg tracking-tight">CampusConnect</span>
                    <span className="text-[10px] font-bold bg-primary-100 text-primary-800 px-1.5 py-0.5 rounded-md border border-primary-200">
                      NIT-AP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">NIT Andhra Pradesh Portal</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-primary-50 text-primary-700 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-primary-600" : "text-slate-400"}`} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              {currentUser && (
                <Link
                  href="/notifications"
                  className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {/* User Dropdown / Auth Button */}
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200/60"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center text-xs font-bold uppercase overflow-hidden">
                      {currentUser.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        currentUser.name.slice(0, 2)
                      )}
                    </div>
                    <div className="hidden md:block text-left pr-1">
                      <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                        {currentUser.name}
                        {currentUser.verificationStatus === "VERIFIED" && (
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {currentUser.role}
                      </div>
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                        <div className="mt-1 flex items-center gap-1">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              currentUser.verificationStatus === "VERIFIED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {currentUser.verificationStatus === "VERIFIED"
                              ? "Verified Student"
                              : "Verification Pending"}
                          </span>
                        </div>
                      </div>

                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Student Profile & Activity
                      </Link>

                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        Dashboard
                      </Link>

                      <button
                        onClick={() => setDemoModalOpen(true)}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-primary-600 hover:bg-primary-50"
                      >
                        <Sparkles className="w-4 h-4" />
                        Switch Persona (Demo)
                      </button>

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-xs transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive ? "bg-primary-50 text-primary-700" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-5 h-5 text-slate-400" />
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setDemoModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-primary-700 bg-primary-50"
              >
                <Sparkles className="w-4 h-4" />
                Switch Demo Persona
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Demo Persona Switcher Modal */}
      <DemoSwitcherModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        currentUser={currentUser}
      />
    </>
  );
}
