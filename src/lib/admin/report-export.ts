import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import type { ParticipantJourney } from "@/types/admin";
import { formatDate, formatTime } from "./format";
import { todayKey } from "./report-filters";

const CLAIM_WINDOW_MS = 30 * 60 * 1000;

function isClaimExpired(p: ParticipantJourney): boolean {
  if (p.claimAccepted || p.claimLinkDeclined) return false;
  if (!p.detailsSubmittedAt) return false;
  return Date.now() - new Date(p.detailsSubmittedAt).getTime() > CLAIM_WINDOW_MS;
}

function consentAcknowledgementText(p: ParticipantJourney): string {
  if (p.coinResult === "COUPON") return "Accepted";
  if (p.coinResult === "COUPON_DECLINED") return "Declined";
  if (p.coinResult === "COUPON_PENDING") return isClaimExpired(p) ? "Link Expired" : "Pending";
  return "N/A";
}

function couponClaimText(p: ParticipantJourney): string {
  if (p.couponCode) return p.couponCode;
  if (p.coinResult === "COUPON_PENDING") {
    return isClaimExpired(p) ? "Link Expired — not claimed" : "Awaiting consent acknowledgement";
  }
  if (p.coinResult === "COUPON_DECLINED") return "Declined by participant";
  return "—";
}

const EXCEL_HEADERS = [
  "S.No",
  "Participant ID",
  "Name",
  "Phone",
  "Participant Started At",
  "Wheel Category",
  "Wheel Spin At",
  "Task Status",
  "Task Status At",
  "Coin Result",
  "Coin Flip At",
  "Consent Link Sent At",
  "Consent Acknowledgement",
  "Coupon Claim",
];

function excelStamp(iso?: string | null): string {
  if (!iso) return "";
  return `${formatDate(iso)}\n${formatTime(iso)}`;
}

function excelRow(p: ParticipantJourney, index: number): (string | number)[] {
  return [
    index,
    p.id,
    p.name ?? "",
    p.phone,
    excelStamp(p.registeredAt),
    p.wheelCategory ?? "",
    excelStamp(p.wheelSpinStartedAt ?? p.wheelSpinCompletedAt),
    p.taskStatus ?? "PENDING",
    excelStamp(p.taskCompletedAt ?? p.taskFailedAt),
    p.coinResult ?? "NOT_FLIPPED",
    excelStamp(p.coinFlipCompletedAt),
    p.claimToken ? excelStamp(p.detailsSubmittedAt) : "",
    consentAcknowledgementText(p),
    couponClaimText(p),
  ];
}

const EXCEL_GOLD = "FFC9A227";
const EXCEL_DARK = "FF14100A";
const EXCEL_ROW_DARK = "FF1E170D";
const EXCEL_TEXT_LIGHT = "FFE6DCC8";
const EXCEL_BORDER = "FF3C3018";

export async function downloadExcel(rows: ParticipantJourney[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Participant Journey Report", {
    views: [{ state: "frozen", ySplit: 4 }],
  });

  const columnCount = EXCEL_HEADERS.length;
  sheet.mergeCells(1, 1, 1, columnCount);
  sheet.mergeCells(2, 1, 2, columnCount);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = "BIGG BOSS — Participant Journey Report";
  titleCell.font = { bold: true, size: 14, color: { argb: EXCEL_GOLD } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXCEL_DARK } };

  const subtitleCell = sheet.getCell(2, 1);
  subtitleCell.value = `Generated on ${formatDate(new Date().toISOString())}`;
  subtitleCell.font = { size: 10, color: { argb: EXCEL_TEXT_LIGHT } };
  subtitleCell.alignment = { horizontal: "center", vertical: "middle" };
  subtitleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXCEL_DARK } };

  sheet.getRow(1).height = 24;
  sheet.getRow(2).height = 18;
  sheet.getRow(3).height = 6;
  const spacerCell = sheet.getCell(3, 1);
  sheet.mergeCells(3, 1, 3, columnCount);
  spacerCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXCEL_DARK } };

  const headerRow = sheet.getRow(4);
  headerRow.values = EXCEL_HEADERS;
  headerRow.eachCell((c) => {
    c.font = { bold: true, color: { argb: EXCEL_DARK } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: EXCEL_GOLD } };
    c.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    c.border = {
      top: { style: "thin", color: { argb: EXCEL_BORDER } },
      bottom: { style: "thin", color: { argb: EXCEL_BORDER } },
      left: { style: "thin", color: { argb: EXCEL_BORDER } },
      right: { style: "thin", color: { argb: EXCEL_BORDER } },
    };
  });
  headerRow.height = 28;

  rows.forEach((p, i) => {
    const row = sheet.addRow(excelRow(p, i + 1));
    const shade = i % 2 === 0 ? EXCEL_ROW_DARK : EXCEL_DARK;
    row.eachCell((c) => {
      c.font = { color: { argb: EXCEL_TEXT_LIGHT } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: shade } };
      c.alignment = { vertical: "top", wrapText: true };
      c.border = {
        top: { style: "hair", color: { argb: EXCEL_BORDER } },
        bottom: { style: "hair", color: { argb: EXCEL_BORDER } },
        left: { style: "hair", color: { argb: EXCEL_BORDER } },
        right: { style: "hair", color: { argb: EXCEL_BORDER } },
      };
    });
  });

  sheet.columns.forEach((col, i) => {
    const header = EXCEL_HEADERS[i] ?? "";
    col.width = Math.max(14, Math.min(30, header.length + 6));
  });
  sheet.getColumn(1).width = 8;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `biggboss-report-${todayKey()}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const PDF_HEADERS = [
  "S.No",
  "Participant",
  "Participant Started",
  "Wheel",
  "Task Status",
  "Coin Result",
  "Consent Link",
  "Consent Acknowledgement",
  "Coupon Claim",
];

function stamp(iso?: string | null): string {
  if (!iso) return "";
  return `${formatDate(iso)}\n${formatTime(iso)}`;
}

function pdfRow(p: ParticipantJourney, index: number): string[] {
  const wheel = p.wheelCategory
    ? `${p.wheelCategory}\n${stamp(p.wheelSpinStartedAt ?? p.wheelSpinCompletedAt)}`
    : "—";

  const taskStatus = `${p.taskStatus ?? "PENDING"}\n${stamp(p.taskCompletedAt ?? p.taskFailedAt)}`;

  const coinResult = `${p.coinResult ?? "NOT_FLIPPED"}\n${stamp(p.coinFlipCompletedAt)}`;

  const consentLink = p.claimToken ? `Sent\n${stamp(p.detailsSubmittedAt)}` : "—";

  const ackAt = p.claimAcceptedAt ?? p.claimLinkDeclinedAt;
  const acknowledgement = ackAt
    ? `${consentAcknowledgementText(p)}\n${stamp(ackAt)}`
    : consentAcknowledgementText(p);

  const couponClaim = p.couponCode
    ? `${couponClaimText(p)}\n${stamp(p.claimAcceptedAt)}`
    : couponClaimText(p);

  return [
    String(index),
    `${p.name?.trim() || "Guest"}\n${p.phone || "—"}`,
    stamp(p.registeredAt),
    wheel,
    taskStatus,
    coinResult,
    consentLink,
    acknowledgement,
    couponClaim,
  ];
}

async function loadImageAsDataUrl(src: string): Promise<string | null> {
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

const BG_DARK: [number, number, number] = [17, 13, 8];
const ROW_DARK: [number, number, number] = [26, 20, 12];
const GOLD: [number, number, number] = [201, 162, 39];
const TEXT_LIGHT: [number, number, number] = [230, 220, 200];
const BORDER: [number, number, number] = [60, 48, 24];

function paintPageBackground(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(...BG_DARK);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
}

export async function downloadPdf(rows: ParticipantJourney[]) {
  const doc = new jsPDF({ orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  paintPageBackground(doc);

  // Paint the dark background on every new page the moment it's created,
  // before autoTable draws any rows on it.
  const originalAddPage = doc.addPage.bind(doc);
  doc.addPage = (...args: Parameters<typeof originalAddPage>) => {
    const result = originalAddPage(...args);
    paintPageBackground(doc);
    return result;
  };

  const logo = await loadImageAsDataUrl(`${import.meta.env.BASE_URL}images/bb-logo.png`);
  if (logo) {
    const logoWidth = 60;
    const logoHeight = 30;
    doc.addImage(logo, "PNG", (pageWidth - logoWidth) / 2, 6, logoWidth, logoHeight);
  }

  doc.setTextColor(...GOLD);
  doc.setFontSize(16);
  doc.text("BIGG BOSS ", pageWidth / 2, 44, { align: "center" });
  doc.setFontSize(10);
  doc.text("Participant Journey Report", pageWidth / 2, 50, { align: "center" });
  doc.setTextColor(...TEXT_LIGHT);
  doc.setFontSize(8);
  doc.text(`Generated on ${formatDate(new Date().toISOString())}`, pageWidth / 2, 56, {
    align: "center",
  });

  autoTable(doc, {
    head: [PDF_HEADERS],
    body: rows.map((p, i) => pdfRow(p, i + 1)),
    startY: 62,
    theme: "grid",
    styles: {
      fontSize: 7.5,
      cellPadding: 3,
      fillColor: ROW_DARK,
      textColor: TEXT_LIGHT,
      lineColor: BORDER,
      lineWidth: 0.2,
      valign: "top",
    },
    headStyles: {
      fillColor: GOLD,
      textColor: BG_DARK,
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: { fillColor: BG_DARK },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
    },
    margin: { top: 10 },
  });

  doc.save(`biggboss-report-${todayKey()}.pdf`);
}
