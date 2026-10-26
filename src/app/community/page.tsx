"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Plus,
  ThumbsUp,
  MessageCircle,
  Share2,
  Tag,
  Pin,
  Clock,
  User,
  Users,
  Trophy,
  Car,
  BookOpen,
  LifeBuoy,
  Home,
  Loader2,
  Sparkles,
} from "lucide-react";
import { COMMUNITY_CATEGORIES } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";

interface CommunityPostItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string;
  isPinned: boolean;
  createdAt: string;
  commentCount: number;
  reactionCount: number;
  userReaction: string | null;
  isAuthor: boolean;
  author: {
    id: string;
    name: string;
    department?: string;
    avatar?: string;
    role: string;
  };
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [reactingId, setReactingId] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search);
      if (category !== "ALL") params.set("category", category);

      const res = await fetch(`/api/community?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleReactionToggle = async (postId: string) => {
    try {
      setReactingId(postId);
      const res = await fetch(`/api/community/${postId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "LIKE" }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  reactionCount: data.count,
                  userReaction: data.reacted ? "LIKE" : null,
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReactingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Campus Community Feed
            </h1>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              Hyperlocal NIT-AP
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Find teammates for SIH, pool cabs to Tadepalligudem station, borrow textbooks, and connect.
          </p>
        </div>

        <Link
          href="/community/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Community Post
        </Link>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {COMMUNITY_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              category === cat.value
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search discussions by keyword, tags (#SIH2026, #RideShare)..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
        >
          Search
        </button>
      </form>

      {/* Posts Feed */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-xs text-slate-500 mt-2">Loading campus discussions...</p>
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          title="No discussions found"
          description="Be the first to break the ice! Post a teammate request, travel pool, or academic question."
          actionHref="/community/new"
          actionText="Create Post"
          icon={MessageSquare}
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`bg-white rounded-2xl p-6 border transition-all ${
                post.isPinned
                  ? "border-amber-300 bg-amber-50/20 shadow-xs"
                  : "border-slate-200 shadow-xs hover:border-slate-300"
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                      {post.author.avatar ? (
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        post.author.name.slice(0, 2)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {post.author.name}
                        </span>
                        {post.author.role !== "STUDENT" && (
                          <span className="text-[10px] font-bold bg-primary-100 text-primary-800 px-1.5 py-0.2 rounded">
                            {post.author.role}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[11px] text-slate-500">
                          {post.author.department || "NIT-AP"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{timeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.isPinned && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Post Title & Content */}
                <div>
                  <Link href={`/community/${post.id}`}>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 hover:text-emerald-700 transition-colors">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed line-clamp-3">
                    {post.content}
                  </p>
                </div>

                {/* Tags */}
                {post.tags && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {post.tags.split(",").map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                        onClick={() => {
                          setSearch(tag.trim().replace("#", ""));
                          fetchPosts();
                        }}
                      >
                        #{tag.trim().replace("#", "")}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Reactions & Comments */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleReactionToggle(post.id)}
                      disabled={reactingId === post.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                        post.userReaction
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.reactionCount} Likes</span>
                    </button>

                    <Link
                      href={`/community/${post.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 text-slate-600 font-semibold transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{post.commentCount} Comments</span>
                    </Link>
                  </div>

                  <Link
                    href={`/community/${post.id}`}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    Join Thread →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
