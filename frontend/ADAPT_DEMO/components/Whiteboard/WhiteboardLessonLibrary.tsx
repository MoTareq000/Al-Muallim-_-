"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchDashboard, fetchTeacherDashboard, type DashboardParams } from "@/lib/api";
import type { DashboardResponse, DashboardLesson } from "@/lib/types";
import {
  IconSearch,
  IconFileText,
  IconAlertCircle,
  IconChevronRight,
  IconClock,
  IconUpload,
} from "@/components/shared/FluxIcons";

function IconPlus({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" stroke="currentColor" className={className}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function IconTrash({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className={className}>
      <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" strokeLinecap="round" />
    </svg>
  );
}

function IconChevronLeft({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" className={className}>
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WhiteboardLessonLibrary({ icon, title, subtitle, teacher }: { icon?: React.ReactNode; title: string; subtitle?: string; teacher?: boolean }) {
  const deletable = !teacher;
  const router = useRouter();

  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState<"recent" | "oldest" | "title">("recent");
  const [page, setPage] = useState(1);
  const limit = 12;

  const [searchInput, setSearchInput] = useState("");

  const fetchFn = teacher ? fetchTeacherDashboard : fetchDashboard;

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: DashboardParams = { page, limit, sort };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      const result = await fetchFn(params);
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load lessons");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, sort, teacher]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  function handleDelete(lessonId: string) {
    if (!confirm("Delete this lesson?")) return;
    import("@/lib/api").then(({ deleteLesson }) =>
      deleteLesson(lessonId).then(() => loadDashboard()).catch(() => {})
    );
  }

  function handleLessonClick(lesson: DashboardLesson) {
    if (lesson.status !== "ready") return;
    const params = new URLSearchParams();
    if (lesson.series_id) params.set("series", lesson.series_id);
    if (lesson.total_lessons > 1) params.set("total", String(lesson.total_lessons));
    const qs = params.toString();
    router.push(`/lesson/${lesson.id}${qs ? `?${qs}` : ""}`);
  }

  const stats = data?.stats;
  const lessons = data?.lessons ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-[#D6F63E] flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
          <div>
            {subtitle && <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">{subtitle}</p>}
            <h2 className="text-xl font-bold text-[#0F0F0F]">{title}</h2>
          </div>
        </div>
        {!teacher && (
          <button
            onClick={() => router.push("/upload")}
            className="inline-flex items-center gap-2 px-4 py-3 sm:py-2.5 bg-[#0F0F0F] text-white rounded-xl font-semibold text-sm hover:bg-[#2A2A2A] transition-colors"
          >
            <IconPlus />
            New Lesson
          </button>
        )}
      </div>

      {subtitle && (
        <p className="text-sm text-[#6B6B6B] -mt-2">
          {teacher
            ? "Whiteboard lessons created by your teacher. Ready lessons open instantly."
            : "Browse your generated whiteboard lessons. Ready lessons open instantly; processing ones stay here until finished."}
        </p>
      )}

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total" value={stats.total} color="#0F0F0F" bg="#F5F5F5" />
          <StatCard label="Ready" value={stats.ready} color="#059669" bg="#ECFDF5" />
          <StatCard label="Processing" value={stats.processing} color="#D97706" bg="#FFFBEB" />
          <StatCard label="Errors" value={stats.error} color="#DC2626" bg="#FEF2F2" />
        </div>
      )}

      {/* Filters */}
      <div className="flux-card p-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]">
              <IconSearch size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by title, subject, or filename…"
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5E5E5] rounded-lg text-sm text-[#0F0F0F] placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#D6F63E] focus:border-transparent transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-sm text-[#0F0F0F] focus:outline-none focus:ring-2 focus:ring-[#D6F63E]"
          >
            <option value="">All Statuses</option>
            <option value="ready">Ready</option>
            <option value="processing">Processing</option>
            <option value="error">Error</option>
          </select>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value as typeof sort); setPage(1); }}
            className="px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-sm text-[#0F0F0F] focus:outline-none focus:ring-2 focus:ring-[#D6F63E]"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="title">By Title</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-7 h-7 border-2 border-[#E5E5E5] border-t-[#D6F63E] rounded-full animate-spin" />
          <span className="ml-3 text-sm text-[#6B6B6B]">Loading lessons…</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <IconAlertCircle size={16} className="shrink-0 text-red-500" />
          <span className="flex-1">{error}</span>
          <button onClick={loadDashboard} className="font-semibold underline underline-offset-2 hover:text-red-900 transition text-red-700">
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && lessons.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#F5F5F5] flex items-center justify-center text-[#A0A0A0] mb-4">
            <IconFileText size={28} />
          </div>
          <p className="text-[#0F0F0F] font-medium mb-1">
            {search || statusFilter ? "No lessons match your filters" : teacher ? "No teacher lessons yet" : "No whiteboard lessons yet"}
          </p>
          <p className="text-sm text-[#6B6B6B]">
            {search || statusFilter
              ? "Try adjusting your search or filters."
              : teacher
                ? "Your teacher hasn't published any whiteboard lessons yet."
                : "Upload a document or type a topic to generate your first lesson."}
          </p>
          {!search && !statusFilter && !teacher && (
            <button
              onClick={() => router.push("/upload")}
              className="mt-4 px-4 py-2 bg-[#0F0F0F] text-white rounded-xl font-semibold text-sm hover:bg-[#2A2A2A] transition-colors inline-flex items-center gap-2"
            >
              <IconUpload size={16} />
              Create Your First Lesson
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {!loading && !error && lessons.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6B6B6B]">
              {pagination?.total ?? lessons.length} {pagination?.total === 1 ? "lesson" : "lessons"} total
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                deletable={deletable}
                onClick={() => handleLessonClick(lesson)}
                onDelete={() => handleDelete(lesson.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-[#E5E5E5] bg-white text-[#6B6B6B] hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <IconChevronLeft />
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-[36px] h-9 text-sm font-medium rounded-lg border transition ${
                    p === page
                      ? "bg-[#D6F63E] text-[#0F0F0F] border-[#D6F63E]"
                      : "bg-white text-[#6B6B6B] border-[#E5E5E5] hover:bg-[#F5F5F5]"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="p-2 rounded-lg border border-[#E5E5E5] bg-white text-[#6B6B6B] hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <IconChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, color, bg }: { label: string; value: string | number; color: string; bg: string }) {
  return (
    <div className="rounded-2xl border border-[#E5E5E5] px-4 py-4 shadow-sm" style={{ backgroundColor: bg }}>
      <p className="text-[11px] font-semibold uppercase tracking-wider opacity-60 mb-1.5 leading-none" style={{ color }}>{label}</p>
      <p className="text-2xl font-bold tabular-nums leading-none" style={{ color }}>{value}</p>
    </div>
  );
}

// ─── Lesson Card ───────────────────────────────────────────────────────────────

const statusCfg: Record<string, { dot: string; text: string; bg: string; label: string }> = {
  ready:      { dot: "bg-emerald-400",           text: "text-emerald-700", bg: "bg-emerald-50", label: "Ready"      },
  processing: { dot: "bg-amber-400 animate-pulse", text: "text-amber-700",  bg: "bg-amber-50",  label: "Processing" },
  error:      { dot: "bg-red-400",               text: "text-red-700",    bg: "bg-red-50",    label: "Error"      },
};

function LessonCard({ lesson, onClick, onDelete, deletable = true }: {
  lesson: DashboardLesson; onClick: () => void; onDelete: () => void; deletable?: boolean;
}) {
  const cfg = statusCfg[lesson.status] ?? statusCfg.error;
  const date = new Date(lesson.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl border bg-white/95 shadow-sm transition-all ${
        lesson.status === "ready"
          ? "border-[#E5E5E5] hover:-translate-y-0.5 hover:border-[#A0A0A0] hover:shadow-md cursor-pointer"
          : "border-[#E5E5E5] cursor-default"
      }`}
    >
      {deletable && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete lesson"
          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg text-[#A0A0A0] hover:text-red-500 hover:bg-red-50 transition z-10"
        >
          <IconTrash />
        </button>
      )}

      <div className={`p-4 ${deletable ? 'pr-10' : ''}`}>
        <div className="flex items-center justify-between mb-2.5">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
            {cfg.label}
          </span>
          <span className="text-[11px] text-[#A0A0A0] flex items-center gap-1">
            <IconClock size={12} />
            {date}
          </span>
        </div>

        <h3 className="font-semibold text-[#0F0F0F] text-[15px] leading-6 tracking-[-0.025em] mb-1.5 line-clamp-2">
          {lesson.title || "Untitled Lesson"}
        </h3>

        {lesson.subject && (
          <p className="text-xs text-[#6B6B6B] mb-2 truncate">{lesson.subject}</p>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-[#A0A0A0] mb-2">
          <IconFileText size={12} />
          <span className="truncate">{lesson.source_filename}</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#A0A0A0]">
          {lesson.parts_count > 0 && <span>{lesson.parts_count} parts</span>}
          {lesson.total_lessons > 1 && (
            <span className="text-[#A78BFA] font-medium">
              {lesson.lesson_index + 1} / {lesson.total_lessons}
            </span>
          )}
        </div>

        {lesson.status === "error" && lesson.error_message && (
          <p className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg p-2 line-clamp-2 leading-relaxed">
            {lesson.error_message}
          </p>
        )}

        {lesson.status === "processing" && (
          <div className="mt-2 flex items-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-[#E5E5E5] border-t-amber-500 shrink-0" />
            <span className="text-[11px] text-amber-600 capitalize">{lesson.processing_step}</span>
          </div>
        )}
      </div>
    </div>
  );
}
