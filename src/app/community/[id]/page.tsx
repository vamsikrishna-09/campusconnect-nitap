"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ThumbsUp,
  MessageCircle,
  Flag,
  Trash2,
  Edit,
  Clock,
  Send,
  Loader2,
  Share2,
  Pin,
  CheckCircle,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";
import ReportModal from "@/components/ReportModal";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    department?: string;
    avatar?: string;
    role: string;
  };
}

interface PostDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string;
  isPinned: boolean;
  createdAt: string;
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
  comments: Comment[];
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/community/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data.post);
      } else {
        router.push("/community");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) fetchPost();
  }, [postId]);

  const handleReactionToggle = async () => {
    if (!post) return;
    try {
      const res = await fetch(`/api/community/${post.id}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "LIKE" }),
      });

      if (res.ok) {
        const data = await res.json();
        setPost({
          ...post,
          reactionCount: data.count,
          userReaction: data.reacted ? "LIKE" : null,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await fetch(`/api/community/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        setNewComment("");
        await fetchPost();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to post comment");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this discussion post?")) return;
    try {
      const res = await fetch(`/api/community/${postId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/community");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/community"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Campus Feed
        </Link>
        <button
          onClick={() => setReportModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors"
        >
          <Flag className="w-3.5 h-3.5" /> Report Post
        </button>
      </div>

      {/* Main Post Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        {/* Author info */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm uppercase overflow-hidden">
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
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm sm:text-base">
                  {post.author.name}
                </span>
                {post.author.role !== "STUDENT" && (
                  <span className="text-[10px] font-bold bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full">
                    {post.author.role}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{post.author.department || "NIT Andhra Pradesh"}</span>
                <span>•</span>
                <span>{timeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {post.isPinned && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Pin className="w-3 h-3" /> Pinned
              </span>
            )}
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              {post.category}
            </span>
          </div>
        </div>

        {/* Title & Body */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {post.title}
          </h1>
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {post.content}
          </div>
        </div>

        {/* Tags */}
        {post.tags && (
          <div className="flex items-center gap-2 flex-wrap pt-2">
            {post.tags.split(",").map((t) => (
              <span
                key={t}
                className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg"
              >
                #{t.trim().replace("#", "")}
              </span>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleReactionToggle}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                post.userReaction
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{post.reactionCount} Likes</span>
            </button>
            <span className="text-xs text-slate-500 font-medium">
              {post.comments.length} Comments
            </span>
          </div>

          {post.isAuthor && (
            <div className="flex items-center gap-2">
              <Link
                href={`/community/${post.id}/edit`}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" /> Edit
              </Link>
              <button
                onClick={handleDelete}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl"
                title="Delete Post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900">
          Discussion ({post.comments.length})
        </h3>

        {/* New Comment Input */}
        <form onSubmit={handleCommentSubmit} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            placeholder="Share your thoughts, offer to collaborate, or coordinate details..."
            required
            className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingComment || !newComment.trim()}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Post Comment
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          {post.comments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              No replies yet. Join the conversation!
            </p>
          ) : (
            post.comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{comment.author.name}</span>
                    <span className="text-[11px] text-slate-500">
                      ({comment.author.department || "NIT-AP"})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{timeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Content Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="POST"
        targetId={post.id}
        targetTitle={post.title}
      />
    </div>
  );
}
