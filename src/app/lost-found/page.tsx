"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  MapPin,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Tag,
  ArrowRight,
} from "lucide-react";
import { LOST_FOUND_CATEGORIES, CAMPUS_LANDMARKS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";

interface LostFoundItem {
  id: string;
  title: string;
  description: string;
  type: string; // LOST or FOUND
  category: string;
  campusLocation: string;
  itemDate: string;
  imageUrl?: string;
  status: string; // OPEN or RESOLVED
  reporter: {
    name: string;
    department?: string;
    avatar?: string;
  };
  _count: { claims: number };
}

export default function LostFoundPage() {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeTab, setTypeTab] = useState("ALL"); // ALL, LOST, FOUND, RESOLVED
  const [category, setCategory] = useState("ALL");
  const [myItemsOnly, setMyItemsOnly] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search);
      if (typeTab === "LOST") params.set("type", "LOST");
      if (typeTab === "FOUND") params.set("type", "FOUND");
      if (typeTab === "RESOLVED") params.set("status", "RESOLVED");
      if (category !== "ALL") params.set("category", category);
      if (myItemsOnly) params.set("myItems", "true");

      const res = await fetch(`/api/lost-found?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [typeTab, category, myItemsOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              NIT-AP Lost & Found Hub
            </h1>
            <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
              Hyperlocal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quickly publish lost student IDs, keys, calculators, and electronics. Tagged by campus zones.
          </p>
        </div>

        <Link
          href="/lost-found/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Report Lost or Found Item
        </Link>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: "ALL", label: "All Active Items" },
          { id: "LOST", label: "Lost Belongings" },
          { id: "FOUND", label: "Found Belongings" },
          { id: "RESOLVED", label: "Reunited / Resolved" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTypeTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              typeTab === tab.id
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Category Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by item name, description, or campus building (e.g. SRK Bhavan, Library)..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
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
          {LOST_FOUND_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                category === cat.value
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
            <input
              type="checkbox"
              checked={myItemsOnly}
              onChange={(e) => setMyItemsOnly(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <span>Show my reports only</span>
          </label>
        </div>
      </div>

      {/* Grid of Reports */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
          <p className="text-xs text-slate-500 mt-2">Searching items...</p>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No items found"
          description="No lost or found reports match the current criteria. If you found or lost an item, report it now!"
          actionHref="/lost-found/new"
          actionText="File a Report"
          icon={Search}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail / Header */}
                <div className="h-44 bg-slate-100 relative overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                      <Tag className="w-10 h-10" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs ${
                        item.type === "LOST"
                          ? "bg-rose-600 text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-[10px] font-semibold bg-white/90 backdrop-blur text-slate-800 px-2 py-0.5 rounded-full shadow-xs">
                      {item.category.replace("_", " ")}
                    </span>
                  </div>

                  <span
                    className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${
                      item.status === "RESOLVED"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-purple-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.campusLocation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formatDate(item.itemDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action footer */}
              <div className="p-5 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  By {item.reporter.name}
                </div>
                <Link
                  href={`/lost-found/${item.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                >
                  View & Claim <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
