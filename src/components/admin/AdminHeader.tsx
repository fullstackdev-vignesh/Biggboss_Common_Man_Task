import { RefreshCw, FileSpreadsheet, FileText, LogOut } from "lucide-react";

import { ASSETS } from "@/lib/assets";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/admin/format";

export function AdminHeader({
  onRefresh,
  onExportExcel,
  onExportPdf,
  onLogout,
  lastUpdated,
  refreshing,
}: {
  onRefresh: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onLogout: () => void;
  lastUpdated: Date | null;
  refreshing: boolean;
}) {
  return (
    <header className="glass-panel flex flex-col gap-4 rounded-2xl p-5 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <img src={import.meta.env.BASE_URL + "images/bb-eye.png"} alt="Bigg Boss eye" className="h-10 w-auto" />
        <div>
          <h1 className="display-font text-2xl gold-text">BIGG BOSS COMMON MAN</h1>
          <p className="text-sm font-semibold text-foreground">Participant Journey Report</p>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Admin Dashboard
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold">{formatDate(new Date().toISOString())}</p>
          <p className="text-xs text-muted-foreground">
            {lastUpdated ? `Last updated ${formatTime(lastUpdated.toISOString())}` : "—"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw className={refreshing ? "animate-spin" : ""} /> Refresh
        </Button>
        <Button size="sm" onClick={onExportExcel}>
          <FileSpreadsheet /> Excel
        </Button>
        <Button size="sm" onClick={onExportPdf}>
          <FileText /> PDF
        </Button>
        <Button variant="ghost" size="sm" onClick={onLogout}>
          <LogOut /> Logout
        </Button>
      </div>
    </header>
  );
}
