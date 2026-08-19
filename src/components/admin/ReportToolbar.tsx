import { CalendarIcon, Search, RotateCcw, FileDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DATE_PRESET_LABEL,
  todayKey,
  type DatePreset,
  type ReportFilters,
} from "@/lib/admin/report-filters";
import { WHEEL_CATEGORIES } from "@/lib/admin/wheel-tasks";

const YEAR_RANGE = 5;
const now = new Date();
const DROPDOWN_START = new Date(now.getFullYear() - YEAR_RANGE, 0, 1);
const DROPDOWN_END = new Date(now.getFullYear() + YEAR_RANGE, 11, 31);

function toDateStr(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function DatePickerField({
  value,
  onChange,
  label,
  minDate,
}: {
  value: string;
  onChange: (dateStr: string) => void;
  label: string;
  /** Dates before this (exclusive) are disabled — used so "To date" can't precede "From date". */
  minDate?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(`${value}T00:00:00`) : undefined;
  const disabledBefore = minDate ? new Date(`${minDate}T00:00:00`) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-[150px] justify-start font-normal text-foreground"
        >
          <CalendarIcon className="size-4" />
          {selected
            ? selected.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          startMonth={DROPDOWN_START}
          endMonth={DROPDOWN_END}
          selected={selected}
          defaultMonth={selected ?? new Date()}
          disabled={disabledBefore ? { before: disabledBefore } : undefined}
          onSelect={(date) => {
            if (!date) return;
            onChange(toDateStr(date));
            setOpen(false);
          }}
        />
        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          <button
            type="button"
            className="text-xs font-medium text-muted-foreground hover:text-primary"
            onClick={() => {
              onChange(todayKey());
              setOpen(false);
            }}
          >
            Clear
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function ReportToolbar({
  filters,
  searchInput,
  onSearchInput,
  onChange,
  onReset,
  onExport,
}: {
  filters: ReportFilters;
  searchInput: string;
  onSearchInput: (value: string) => void;
  onChange: (patch: Partial<ReportFilters>) => void;
  onReset: () => void;
  onExport: () => void;
}) {
  return (
    <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 lg:flex-row lg:items-center">
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => onSearchInput(e.target.value)}
          placeholder="Search participant name or phone number"
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.datePreset}
          onValueChange={(v) => onChange({ datePreset: v as DatePreset })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_PRESET_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(filters.datePreset === "CUSTOM_DATE" || filters.datePreset === "CUSTOM_RANGE") && (
          <DatePickerField
            label="From date"
            value={filters.fromDate}
            onChange={(fromDate) =>
              onChange(fromDate > filters.toDate ? { fromDate, toDate: fromDate } : { fromDate })
            }
          />
        )}
        {filters.datePreset === "CUSTOM_RANGE" && (
          <DatePickerField
            label="To date"
            value={filters.toDate}
            onChange={(toDate) => onChange({ toDate })}
            minDate={filters.fromDate}
          />
        )}

        <Select
          value={filters.taskStatus}
          onValueChange={(v) => onChange({ taskStatus: v as ReportFilters["taskStatus"] })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Task Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Task Status</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.category} onValueChange={(v) => onChange({ category: v })}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {WHEEL_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.coinResult}
          onValueChange={(v) => onChange({ coinResult: v as ReportFilters["coinResult"] })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Coin Result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Coin Results</SelectItem>
            <SelectItem value="COUPON">Coupon Winner</SelectItem>
            <SelectItem value="COUPON_PENDING">Pending (Claim Link)</SelectItem>
            <SelectItem value="BETTER_LUCK_NEXT_TIME">Better Luck Next Time</SelectItem>
            <SelectItem value="NOT_ELIGIBLE">Not Eligible</SelectItem>
            <SelectItem value="NOT_FLIPPED">Not Flipped Yet</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw /> Reset
        </Button>
        <Button size="sm" onClick={onExport}>
          <FileDown /> Export CSV
        </Button>
      </div>
    </div>
  );
}
