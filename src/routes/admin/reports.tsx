import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { RotateCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { DailyLimitPanel } from "@/components/admin/DailyLimitPanel";
import { ParticipantDetailsDrawer } from "@/components/admin/ParticipantDetailsDrawer";
import { ParticipantJourneyTable } from "@/components/admin/ParticipantJourneyTable";
import { ReportPagination } from "@/components/admin/ReportPagination";
import { ReportStats } from "@/components/admin/ReportStats";
import { ReportToolbar } from "@/components/admin/ReportToolbar";
import { adminLogout, isAdminAuthed } from "@/hooks/useAdminAuth";
import { useTabletLandscapeLock } from "@/hooks/useTabletLandscapeLock";
import { fetchJourneys } from "@/lib/admin/api";
import { downloadExcel, downloadPdf } from "@/lib/admin/report-export";
import {
  applyFilters,
  computeStats,
  dateRangeFor,
  defaultFilters,
  sortRows,
  type ReportFilters,
  type SortKey,
} from "@/lib/admin/report-filters";
import type { ParticipantJourney } from "@/types/admin";

export const Route = createFileRoute("/admin/reports")({
  ssr: false,
  beforeLoad: () => {
    if (!isAdminAuthed()) {
      throw redirect({ to: "/admin" });
    }
  },
  head: () => ({
    meta: [
      { title: "Participant Journey Report — Bigg Boss Admin" },
      {
        name: "description",
        content:
          "Admin dashboard showing every Bigg Boss participant journey from registration to coupon result.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminReportsPage,
});

function AdminReportsPage() {
  const { isTablet, isPortrait, isLocked, requestLandscape } = useTabletLandscapeLock();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ReportFilters>(defaultFilters);
  const [searchInput, setSearchInput] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("registeredAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<ParticipantJourney | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, search: searchInput })), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const range = useMemo(() => dateRangeFor(filters), [filters]);

  const query = useQuery({
    queryKey: ["admin-participant-journeys", range.from, range.to],
    queryFn: () => fetchJourneys(range),
    refetchOnWindowFocus: false,
  });

  const all = useMemo(() => query.data ?? [], [query.data]);
  const filtered = useMemo(() => applyFilters(all, filters), [all, filters]);
  const sorted = useMemo(() => sortRows(filtered, sortKey, sortDir), [filtered, sortKey, sortDir]);
  const stats = useMemo(() => computeStats(filtered), [filtered]);

  useEffect(() => {
    setPage(1);
  }, [filters, pageSize]);

  const start = (page - 1) * pageSize;
  const pageRows = sorted.slice(start, start + pageSize);

  const emptyMessage = filters.search
    ? "No participants match your search."
    : filters.taskStatus !== "ALL" || filters.category !== "ALL" || filters.coinResult !== "ALL"
      ? "No participants match the selected filters."
      : filters.datePreset === "TODAY"
        ? "No participants yet today."
        : "No participant records found.";

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function handleReset() {
    setFilters(defaultFilters());
    setSearchInput("");
  }

  function handleLogout() {
    adminLogout();
    navigate({ to: "/admin" });
  }

  return (
    <main className="stage-bg min-h-screen px-4 py-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-5">
        <AdminHeader
          onRefresh={() => void query.refetch()}
          onExportExcel={() => void downloadExcel(sorted)}
          onExportPdf={() => void downloadPdf(sorted)}
          onLogout={handleLogout}
          lastUpdated={query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null}
          refreshing={query.isFetching}
        />

        <DailyLimitPanel />

        <div className="flex items-baseline gap-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Today&apos;s Activity
          </p>
          <p className="text-sm font-semibold text-primary">{filtered.length} participants</p>
        </div>

        <ReportStats stats={stats} loading={query.isLoading} />

        <ReportToolbar
          filters={filters}
          searchInput={searchInput}
          onSearchInput={setSearchInput}
          onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
          onReset={handleReset}
          onExport={() => void downloadExcel(sorted)}
        />

        <p className="text-sm text-muted-foreground">
          {sorted.length === 0
            ? "Showing 0 participants"
            : `Showing ${start + 1}–${Math.min(start + pageSize, sorted.length)} of ${sorted.length} participants`}
        </p>

        <ParticipantJourneyTable
          rows={pageRows}
          startIndex={start + 1}
          loading={query.isLoading}
          error={query.isError}
          emptyMessage={emptyMessage}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          onOpen={setSelected}
          onRetry={() => void query.refetch()}
        />

        <ReportPagination
          page={page}
          pageSize={pageSize}
          total={sorted.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <ParticipantDetailsDrawer participant={selected} onClose={() => setSelected(null)} />

      {isTablet && isPortrait && !isLocked && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Rotate your device"
        >
          <div className="glass-panel flex max-w-xs flex-col items-center gap-4 rounded-2xl p-6 text-center sm:max-w-sm sm:p-8">
            {/* <img
              src={import.meta.env.BASE_URL + "smartphone_screen_orientation.svg"}
              alt="Rotate device to landscape"
              className="h-28 w-28 sm:h-36 sm:w-36 "
            /> */}
            <img
              src={import.meta.env.BASE_URL + "images/smartphone_screen_orientation.svg"}
              alt="Rotate device to landscape"
              className="h-28 w-28 sm:h-36 sm:w-36 brightness-0 invert"
            />
            <div>
              <p className="display text-gold text-lg sm:text-xl">Rotate your device</p>
              <p className="mt-2 text-sm text-muted-foreground">
                For the best report view, switch to landscape mode.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void requestLandscape()}
              className="btn-gold inline-flex items-center gap-2 px-6 py-3 text-xs"
            >
              <RotateCw className="size-4" />
              View in Landscape
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
