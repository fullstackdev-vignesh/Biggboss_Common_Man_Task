
/* eslint-disable */
// @ts-nocheck

import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ParticipantJourney } from "@/types/admin";
import { isSlotBasedBusiness } from "@/lib/business-mode";
import type { CampaignDaySummary } from "./api";
import { formatCampaignDate, formatDate, formatTime } from "./format";
import { istDayKey, istHourOf, todayKey } from "./report-filters";
const CLAIM_WINDOW_MS = 5 * 60 * 1000;
const EXCEL_GOLD = "FFC9A227";
const EXCEL_DARK = "FF14100A";
const EXCEL_ROW_DARK = "FF1E170D";
const EXCEL_TEXT_LIGHT = "FFE6DCC8";
const EXCEL_BORDER = "FF3C3018";
const BG_DARK: [number, number, number] = [17, 13, 8];
const ROW_DARK: [number, number, number] = [26, 20, 12];
const GOLD: [number, number, number] = [201, 162, 39];
const TEXT_LIGHT: [number, number, number] = [230, 220, 200];
const BORDER: [number, number, number] = [60, 48, 24];
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
  "Slot Plan",
  "Time Window",
  "Consent Link Sent At",
  "Consent Acknowledgement",
  "Coupon Claim",
];
const QUOTA_HEADERS = [
  "Date",
  "Slot Plan",
  "Time Window",
  "Base %",
  "Base Quota",
  "Carry-Forward",
  "Effective Quota",
  "Confirmed (Accepted)",
  "Remaining",
];
const PDF_HEADERS = [
  "S.No",
  "Participant",
  "Participant Started",
  "Wheel",
  "Task Status",
  "Coin Result",
  "Slot/Window",
  "Consent Link",
  "Consent Acknowledgement",
  "Coupon Claim",
];
interface DerivedSlotWindow {
  slotPlan: number | null;
  label: string | null;
}
interface JsPdfWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}
function deriveSlotWindow(
  participant: ParticipantJourney,
  campaignDays: CampaignDaySummary[],
): DerivedSlotWindow {
  const spinTime =
    participant.wheelSpinCompletedAt ?? participant.wheelSpinStartedAt;
  if (!spinTime) {
    return {
      slotPlan: null,
      label: null,
    };
  }
  const day = campaignDays.find(
    (campaignDay) => campaignDay.dateStr === istDayKey(spinTime),
  );
  if (!day) {
    return {
      slotPlan: null,
      label: null,
    };
  }
  const hour = istHourOf(spinTime);
  const window = day.windows.find((item) => {
    const [start, end] = item.windowKey.split("-").map(Number);
    return hour >= start && hour < end;
  });
  if (!window) {
    return {
      slotPlan: null,
      label: null,
    };
  }
  return {
    slotPlan: window.slotPlan,
    label: window.label,
  };
}
function isClaimExpired(participant: ParticipantJourney): boolean {
  if (participant.claimAccepted || participant.claimLinkDeclined) {
    return false;
  }
  if (!participant.detailsSubmittedAt) {
    return false;
  }
  return (
    Date.now() - new Date(participant.detailsSubmittedAt).getTime() >
    CLAIM_WINDOW_MS
  );
}
function consentAcknowledgementText(
  participant: ParticipantJourney,
): string {
  if (participant.coinResult === "COUPON") {
    return "Accepted";
  }
  if (participant.coinResult === "COUPON_DECLINED") {
    return "Declined";
  }
  if (participant.coinResult === "COUPON_PENDING") {
    return isClaimExpired(participant) ? "Link Expired" : "Pending";
  }
  return "N/A";
}
function couponClaimText(participant: ParticipantJourney): string {
  if (participant.couponCode) {
    return participant.couponCode;
  }
  if (participant.coinResult === "COUPON_PENDING") {
    return isClaimExpired(participant)
      ? "Link Expired - not claimed"
      : "Awaiting consent acknowledgement";
  }
  if (participant.coinResult === "COUPON_DECLINED") {
    return "Declined by participant";
  }
  return "—";
}
function excelStamp(iso?: string | null): string {
  if (!iso) {
    return "";
  }
  return `${formatDate(iso)}\n${formatTime(iso)}`;
}
function excelRow(
  participant: ParticipantJourney,
  index: number,
  campaignDays: CampaignDaySummary[],
): (string | number)[] {
  const slotWindow = deriveSlotWindow(participant, campaignDays);
  return [
    index,
    participant.id,
    participant.name ?? "",
    participant.phone,
    excelStamp(participant.registeredAt),
    participant.wheelCategory ?? "",
    excelStamp(
      participant.wheelSpinStartedAt ?? participant.wheelSpinCompletedAt,
    ),
    participant.taskStatus ?? "PENDING",
    excelStamp(participant.taskCompletedAt ?? participant.taskFailedAt),
    participant.coinResult ?? "NOT_FLIPPED",
    excelStamp(participant.coinFlipCompletedAt),
    slotWindow.slotPlan ? `Slot ${slotWindow.slotPlan}` : "",
    slotWindow.label ?? "",
    participant.claimToken ? excelStamp(participant.detailsSubmittedAt) : "",
    consentAcknowledgementText(participant),
    couponClaimText(participant),
  ];
}
function quotaRow(
  day: CampaignDaySummary,
  window: CampaignDaySummary["windows"][number],
): (string | number)[] {
  return [
    formatCampaignDate(day.dateStr),
    `Slot Plan ${window.slotPlan}`,
    window.label,
    `${window.basePercent}%`,
    window.baseQuota,
    window.carryIn,
    window.effectiveQuota,
    window.used,
    window.remaining,
  ];
}
export async function downloadExcel(
  rows: ParticipantJourney[],
  campaignDays: CampaignDaySummary[] = [],
  windowLabel?: string,
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const slotBased = isSlotBasedBusiness();
  if (slotBased && campaignDays.length > 0) {
    const quotaSheet = workbook.addWorksheet(
      "Campaign Slot & Window Quota",
    );
    const quotaHeaderRow = quotaSheet.addRow(QUOTA_HEADERS);
    quotaHeaderRow.font = {
      bold: true,
    };
    for (const day of campaignDays) {
      for (const window of day.windows) {
        quotaSheet.addRow(quotaRow(day, window));
      }
    }
    quotaSheet.columns.forEach((column, index) => {
      column.width = Math.max(
        14,
        Math.min(28, (QUOTA_HEADERS[index] ?? "").length + 6),
      );
    });
  }
  const sheet = workbook.addWorksheet("Participant Journey Report", {
    views: [
      {
        state: "frozen",
        ySplit: 4,
      },
    ],
  });
  const columnCount = EXCEL_HEADERS.length;
  sheet.mergeCells(1, 1, 1, columnCount);
  sheet.mergeCells(2, 1, 2, columnCount);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = "BIGG BOSS — Participant Journey Report";
  titleCell.font = {
    bold: true,
    size: 14,
    color: {
      argb: EXCEL_GOLD,
    },
  };
  titleCell.alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: EXCEL_DARK,
    },
  };
  const subtitleCell = sheet.getCell(2, 1);
  subtitleCell.value = `Generated on ${formatDate(
    new Date().toISOString(),
  )}${windowLabel ? ` (${windowLabel})` : ""}`;
  subtitleCell.font = {
    size: 10,
    color: {
      argb: EXCEL_TEXT_LIGHT,
    },
  };
  subtitleCell.alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  subtitleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: EXCEL_DARK,
    },
  };
  sheet.getRow(1).height = 24;
  sheet.getRow(2).height = 18;
  sheet.getRow(3).height = 6;
  sheet.mergeCells(3, 1, 3, columnCount);
  sheet.getCell(3, 1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: EXCEL_DARK,
    },
  };
  const headerRow = sheet.getRow(4);
  headerRow.values = EXCEL_HEADERS;
  headerRow.eachCell((cell) => {
    cell.font = {
      bold: true,
      color: {
        argb: EXCEL_DARK,
      },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: EXCEL_GOLD,
      },
    };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    cell.border = {
      top: {
        style: "thin",
        color: {
          argb: EXCEL_BORDER,
        },
      },
      bottom: {
        style: "thin",
        color: {
          argb: EXCEL_BORDER,
        },
      },
      left: {
        style: "thin",
        color: {
          argb: EXCEL_BORDER,
        },
      },
      right: {
        style: "thin",
        color: {
          argb: EXCEL_BORDER,
        },
      },
    };
  });
  headerRow.height = 28;
  rows.forEach((participant, index) => {
    const row = sheet.addRow(
      excelRow(participant, index + 1, campaignDays),
    );
    const shade = index % 2 === 0 ? EXCEL_ROW_DARK : EXCEL_DARK;
    row.eachCell((cell) => {
      cell.font = {
        color: {
          argb: EXCEL_TEXT_LIGHT,
        },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: shade,
        },
      };
      cell.alignment = {
        vertical: "top",
        wrapText: true,
      };
      cell.border = {
        top: {
          style: "hair",
          color: {
            argb: EXCEL_BORDER,
          },
        },
        bottom: {
          style: "hair",
          color: {
            argb: EXCEL_BORDER,
          },
        },
        left: {
          style: "hair",
          color: {
            argb: EXCEL_BORDER,
          },
        },
        right: {
          style: "hair",
          color: {
            argb: EXCEL_BORDER,
          },
        },
      };
    });
  });
  sheet.columns.forEach((column, index) => {
    const header = EXCEL_HEADERS[index] ?? "";
    column.width = Math.max(
      14,
      Math.min(30, header.length + 6),
    );
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
function stamp(iso?: string | null): string {
  if (!iso) {
    return "";
  }
  return `${formatDate(iso)}\n${formatTime(iso)}`;
}
function pdfRow(
  participant: ParticipantJourney,
  index: number,
  campaignDays: CampaignDaySummary[],
): string[] {
  const wheel = participant.wheelCategory
    ? `${participant.wheelCategory}\n${stamp(
        participant.wheelSpinStartedAt ??
          participant.wheelSpinCompletedAt,
      )}`
    : "—";
  const taskStatus = `${
    participant.taskStatus ?? "PENDING"
  }\n${stamp(
    participant.taskCompletedAt ?? participant.taskFailedAt,
  )}`;
  const coinResult = `${
    participant.coinResult ?? "NOT_FLIPPED"
  }\n${stamp(participant.coinFlipCompletedAt)}`;
  const consentLink = participant.claimToken
    ? `Sent\n${stamp(participant.detailsSubmittedAt)}`
    : "—";
  const acknowledgementAt =
    participant.claimAcceptedAt ??
    participant.claimLinkDeclinedAt;
  const acknowledgement = acknowledgementAt
    ? `${consentAcknowledgementText(participant)}\n${stamp(
        acknowledgementAt,
      )}`
    : consentAcknowledgementText(participant);
  const couponClaim = participant.couponCode
    ? `${couponClaimText(participant)}\n${stamp(
        participant.claimAcceptedAt,
      )}`
    : couponClaimText(participant);
  const derived = deriveSlotWindow(participant, campaignDays);
  const slotWindow = derived.slotPlan
    ? `Slot ${derived.slotPlan}\n${derived.label ?? ""}`
    : "—";
  return [
    String(index),
    `${participant.name?.trim() || "Guest"}\n${
      participant.phone || "—"
    }`,
    stamp(participant.registeredAt),
    wheel,
    taskStatus,
    coinResult,
    slotWindow,
    consentLink,
    acknowledgement,
    couponClaim,
  ];
}
async function loadImageAsDataUrl(
  src: string,
): Promise<string | null> {
  try {
    const response = await fetch(src);
    if (!response.ok) {
      return null;
    }
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
          return;
        }
        reject(new Error("Unable to read image."));
      };
      reader.onerror = () => {
        reject(reader.error ?? new Error("Unable to read image."));
      };
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
function paintPageBackground(doc: jsPDF): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(...BG_DARK);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
}
export async function downloadPdf(
  rows: ParticipantJourney[],
  campaignDays: CampaignDaySummary[] = [],
  windowLabel?: string,
): Promise<void> {
  const slotBased = isSlotBasedBusiness();
  const doc = new jsPDF({
    orientation: "landscape",
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  paintPageBackground(doc);
  const originalAddPage = doc.addPage.bind(doc);
  doc.addPage = ((
    ...args: Parameters<jsPDF["addPage"]>
  ): jsPDF => {
    const result = originalAddPage(...args);
    paintPageBackground(doc);
    return result;
  }) as jsPDF["addPage"];
  const logo = await loadImageAsDataUrl(
    `${import.meta.env.BASE_URL}images/bb-logo.png`,
  );
  if (logo) {
    const logoWidth = 60;
    const logoHeight = 30;
    doc.addImage(
      logo,
      "PNG",
      (pageWidth - logoWidth) / 2,
      6,
      logoWidth,
      logoHeight,
    );
  }
  doc.setTextColor(...GOLD);
  doc.setFontSize(16);
  doc.text("BIGG BOSS", pageWidth / 2, 44, {
    align: "center",
  });
  doc.setFontSize(10);
  doc.text("Participant Journey Report", pageWidth / 2, 50, {
    align: "center",
  });
  doc.setTextColor(...TEXT_LIGHT);
  doc.setFontSize(8);
  doc.text(
    `Generated on ${formatDate(
      new Date().toISOString(),
    )}${windowLabel ? ` (${windowLabel})` : ""}`,
    pageWidth / 2,
    56,
    {
      align: "center",
    },
  );
  let tableStartY = 62;
  if (slotBased && campaignDays.length > 0) {
    autoTable(doc, {
      head: [QUOTA_HEADERS],
      body: campaignDays.flatMap((day) =>
        day.windows.map((window) => quotaRow(day, window)),
      ),
      startY: tableStartY,
      theme: "grid",
      styles: {
        fontSize: 7.5,
        cellPadding: 2.5,
        fillColor: ROW_DARK,
        textColor: TEXT_LIGHT,
        lineColor: BORDER,
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: GOLD,
        textColor: BG_DARK,
        fontStyle: "bold",
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: BG_DARK,
      },
      margin: {
        top: 10,
      },
    });
    const pdfWithTable = doc as JsPdfWithAutoTable;
    if (pdfWithTable.lastAutoTable) {
      tableStartY = pdfWithTable.lastAutoTable.finalY + 8;
    }
  }
  autoTable(doc, {
    head: [PDF_HEADERS],
    body: rows.map((participant, index) =>
      pdfRow(participant, index + 1, campaignDays),
    ),
    startY: tableStartY,
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
    alternateRowStyles: {
      fillColor: BG_DARK,
    },
    columnStyles: {
      0: {
        cellWidth: 10,
        halign: "center",
      },
    },
    margin: {
      top: 10,
    },
  });
  doc.save(`biggboss-report-${todayKey()}.pdf`);
}