import React from "react";
import Link from "next/link";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionHref?: string;
  actionText?: string;
  icon?: React.ElementType;
}

export default function EmptyState({
  title,
  description,
  actionHref,
  actionText,
  icon: Icon = FolderOpen,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm max-w-lg mx-auto my-6">
      <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4 border border-primary-100">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      {actionHref && actionText && (
        <div className="mt-5">
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition-all shadow-primary-500/20"
          >
            {actionText}
          </Link>
        </div>
      )}
    </div>
  );
}
