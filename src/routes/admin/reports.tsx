import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { RotateCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminLocationPanel } from "@/components/admin/AdminLocationPanel";
import { CampaignQuotaPanel } from "@/components/admin/CampaignQuotaPanel";
import { LocationHistoryButton } from "@/components/admin/LocationHistoryButton";
import { ParticipantDetailsDrawer } from "@/components/admin/ParticipantDetailsDrawer";
import { ParticipantJourneyTable } from "@/components/admin/ParticipantJourneyTable";
import { ReportPagination } from "@/components/admin/ReportPagination";
import { ReportStats } from "@/components/admin/ReportStats";
import { ReportToolbar } from "@/components/admin/ReportToolbar";

import { adminLogout, isAdminAuthed } from "@/hooks/useAdminAuth";
import { useTabletLandscapeLock } from "@/hooks/useTabletLandscapeLock";

import { isSlotBasedBusiness } from "@/lib/business-mode";
import { fetchCampaignDays, fetchJourneys } from "@/lib/admin/api";
import { formatCampaignDate } from "@/lib/admin/format";
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
      {
        title: "Participant Journey Report — Bigg Boss Admin",
      },
      {
        name: "description",
        content:
          "Admin dashboard showing every Bigg Boss participant journey from registration to coupon result.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),

  component: AdminReportsPage,
});

function AdminReportsPage() {
  const { isTablet, isPortrait, isLocked, requestLandscape } =
    useTabletLandscapeLock();

  const navigate = useNavigate();

  const slotBased = isSlotBasedBusiness();

  const [filters, setFilters] =
    useState<ReportFilters>(defaultFilters);

  const [searchInput, setSearchInput] = useState("");

  const [sortKey, setSortKey] =
    useState<SortKey>("registeredAt");

  const [sortDir, setSortDir] =
    useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  const [selected, setSelected] =
    useState<ParticipantJourney | null>(null);

  /*
   * Search debounce
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => ({
        ...current,
        search: searchInput,
      }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  /*
   * IMPORTANT:
   *
   * This range is the single source for:
   * - participant API
   * - campaign days
   * - location history
   *
   * Therefore:
   * Today
   * Yesterday
   * Last 7 Days
   * Last 30 Days
   * Custom Date
   * Custom Range
   * All Time
   *
   * automatically work for Location History also.
   */
  const range = useMemo(
    () => dateRangeFor(filters),
    [filters],
  );

  /*
   * Participant Journey API
   */
  const query = useQuery({
    queryKey: [
      "admin-participant-journeys",
      range.from,
      range.to,
    ],

    queryFn: () => fetchJourneys(range),

    refetchOnWindowFocus: false,
  });

  /*
   * Campaign Window API
   */
  const campaignDaysQuery = useQuery({
    queryKey: [
      "admin-campaign-days",
      "range",
      range.from,
      range.to,
    ],

    queryFn: () => fetchCampaignDays(range),

    refetchOnWindowFocus: false,
  });

  const campaignDays = useMemo(
    () => campaignDaysQuery.data ?? [],
    [campaignDaysQuery.data],
  );

  /*
   * Campaign time-window filter options
   *
   * Only used for SLOT_BASED_BUSINESS=true.
   */
  const timeWindowOptions = useMemo(() => {
    if (!slotBased) {
      return [];
    }

    const seen = new Map<string, string>();

    for (const day of campaignDays) {
      for (const window of day.windows) {
        /*
         * A single day may contain multiple slot plans
         * if admin changes the plan during the day.
         *
         * Therefore use window.slotPlan.
         */
        if (
          filters.slotPlan !== "ALL" &&
          window.slotPlan !== filters.slotPlan
        ) {
          continue;
        }

        seen.set(
          window.windowKey,
          window.label,
        );
      }
    }

    return Array.from(
      seen,
      ([value, label]) => ({
        value,
        label,
      }),
    );
  }, [
    campaignDays,
    filters.slotPlan,
    slotBased,
  ]);

  const selectedWindowLabel = useMemo(
    () =>
      timeWindowOptions.find(
        (option) =>
          option.value === filters.timeWindow,
      )?.label,
    [
      timeWindowOptions,
      filters.timeWindow,
    ],
  );

  /*
   * Client-side report filtering
   */
  const all = useMemo(
    () => query.data ?? [],
    [query.data],
  );

  const filtered = useMemo(
    () => applyFilters(all, filters),
    [all, filters],
  );

  const sorted = useMemo(
    () =>
      sortRows(
        filtered,
        sortKey,
        sortDir,
      ),
    [
      filtered,
      sortKey,
      sortDir,
    ],
  );

  const stats = useMemo(
    () => computeStats(filtered),
    [filtered],
  );

  /*
   * Reset pagination when filters change
   */
  useEffect(() => {
    setPage(1);
  }, [
    filters,
    pageSize,
  ]);

  /*
   * Pagination
   */
  const start =
    (page - 1) * pageSize;

  const pageRows = sorted.slice(
    start,
    start + pageSize,
  );

  /*
   * Empty message
   */
  const emptyMessage = filters.search
    ? "No participants match your search."
    : filters.taskStatus !== "ALL" ||
        filters.category !== "ALL" ||
        filters.coinResult !== "ALL"
      ? "No participants match the selected filters."
      : filters.datePreset === "TODAY"
        ? "No participants yet today."
        : "No participant records found.";

  /*
   * Sort handler
   */
  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((direction) =>
        direction === "asc"
          ? "desc"
          : "asc",
      );

      return;
    }

    setSortKey(key);
    setSortDir("desc");
  }

  /*
   * Reset filters
   */
  function handleReset() {
    setFilters(defaultFilters());
    setSearchInput("");
  }

  /*
   * Admin logout
   */
  function handleLogout() {
    adminLogout();

    navigate({
      to: "/admin",
    });
  }

  return (
    <main className="stage-bg min-h-screen px-4 py-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-5">

        {/* ========================================
            ADMIN HEADER
        ======================================== */}

        <AdminHeader
          onRefresh={() => {
            void query.refetch();
            void campaignDaysQuery.refetch();
          }}
          onExportExcel={() =>
            void downloadExcel(
              sorted,
              campaignDays,
              selectedWindowLabel,
            )
          }
          onExportPdf={() =>
            void downloadPdf(
              sorted,
              campaignDays,
              selectedWindowLabel,
            )
          }
          onLogout={handleLogout}
          lastUpdated={
            query.dataUpdatedAt
              ? new Date(query.dataUpdatedAt)
              : null
          }
          refreshing={
            query.isFetching ||
            campaignDaysQuery.isFetching
          }
        />

        {/* ========================================
            SLOT BUSINESS QUOTA PANEL
        ======================================== */}

        <CampaignQuotaPanel />

        {/* ========================================
            CAMPAIGN WINDOW BREAKDOWN

            SLOT_BASED_BUSINESS=true only
        ======================================== */}

        {slotBased &&
          campaignDays.length > 0 && (
            <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Campaign Window Breakdown
              </p>

              <div className="flex flex-wrap gap-3">
                {campaignDays.flatMap(
                  (day) =>
                    day.windows.map(
                      (window) => (
                        <div
                          key={`${day.dateStr}-${window.windowKey}`}
                          className="min-w-[220px] flex-1 rounded-xl border border-border/60 bg-card/40 p-3 text-xs"
                        >
                          <p className="text-sm font-semibold text-primary">
                            {formatCampaignDate(
                              day.dateStr,
                            )}{" "}
                            · {window.label} · Slot{" "}
                            {window.slotPlan}
                          </p>

                          <p className="mt-1 text-muted-foreground">
                            {
                              window.basePercent
                            }
                            % · Base{" "}
                            {window.baseQuota} ·
                            Carry{" "}
                            {window.carryIn} ·
                            Effective{" "}
                            {
                              window.effectiveQuota
                            }
                          </p>

                          <p className="mt-1 text-primary/80">
                            Confirmed
                            (Accepted){" "}
                            {window.used} ·
                            Remaining{" "}
                            {
                              window.remaining
                            }
                          </p>
                        </div>
                      ),
                    ),
                )}
              </div>
            </div>
          )}

        {/* ========================================
            ADMIN CURRENT LOCATION

            IMPORTANT:
            Location comes BEFORE Today's Activity
        ======================================== */}

        <AdminLocationPanel />

        {/* ========================================
            TODAY'S ACTIVITY
        ======================================== */}

        <div className="flex items-baseline gap-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Today&apos;s Activity
          </p>

          <p className="text-sm font-semibold text-primary">
            {filtered.length} participants
          </p>
        </div>

        {/* ========================================
            REPORT STAT CARDS
        ======================================== */}

        <ReportStats
          stats={stats}
          loading={query.isLoading}
        />

        {/* ========================================
            SEARCH + FILTERS
        ======================================== */}

        <ReportToolbar
          filters={filters}
          searchInput={searchInput}
          onSearchInput={
            setSearchInput
          }
          onChange={(patch) =>
            setFilters(
              (current) => ({
                ...current,
                ...patch,
              }),
            )
          }
          onReset={handleReset}
          onExport={() =>
            void downloadExcel(
              sorted,
              campaignDays,
              selectedWindowLabel,
            )
          }
          timeWindowOptions={
            timeWindowOptions
          }
          slotBased={slotBased}
        />

        {/* ========================================
            LOCATION HISTORY

            IMPORTANT:

            We use the SAME range created from
            the existing dashboard date filter.

            Do NOT use:
            YOUR_EXISTING_RANGE

            Correct:
            range.from
            range.to
        ======================================== */}

        <LocationHistoryButton
          from={range.from}
          to={range.to}
        />

        {/* ========================================
            SHOWING COUNT
        ======================================== */}

        <p className="text-sm text-muted-foreground">
          {sorted.length === 0
            ? "Showing 0 participants"
            : `Showing ${
                start + 1
              }–${Math.min(
                start + pageSize,
                sorted.length,
              )} of ${
                sorted.length
              } participants`}
        </p>

        {/* ========================================
            PARTICIPANT TABLE
        ======================================== */}

        <ParticipantJourneyTable
          rows={pageRows}
          startIndex={start + 1}
          loading={query.isLoading}
          error={query.isError}
          emptyMessage={
            emptyMessage
          }
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          onOpen={setSelected}
          onRetry={() =>
            void query.refetch()
          }
        />

        {/* ========================================
            PAGINATION
        ======================================== */}

        <ReportPagination
          page={page}
          pageSize={pageSize}
          total={sorted.length}
          onPageChange={setPage}
          onPageSizeChange={
            setPageSize
          }
        />
      </div>

      {/* ========================================
          PARTICIPANT JOURNEY DRAWER
      ======================================== */}

      <ParticipantDetailsDrawer
        participant={selected}
        onClose={() =>
          setSelected(null)
        }
      />

      {/* ========================================
          TABLET PORTRAIT LANDSCAPE LOCK
      ======================================== */}

      {isTablet &&
        isPortrait &&
        !isLocked && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6 backdrop-blur-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Rotate your device"
          >
            <div className="glass-panel flex max-w-xs flex-col items-center gap-4 rounded-2xl p-6 text-center sm:max-w-sm sm:p-8">

              <img
                src={
                  import.meta.env
                    .BASE_URL +
                  "images/smartphone_screen_orientation.svg"
                }
                alt="Rotate device to landscape"
                className="h-28 w-28 brightness-0 invert sm:h-36 sm:w-36"
              />

              <div>
                <p className="display text-gold text-lg sm:text-xl">
                  Rotate your device
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                  For the best report
                  view, switch to
                  landscape mode.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  void requestLandscape()
                }
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