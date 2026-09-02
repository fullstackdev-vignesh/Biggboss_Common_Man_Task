// import { Download, FileText } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { adminConsentPdfUrl } from "@/lib/admin/api";
// import { formatDate, formatTime } from "@/lib/admin/format";
// import { formatPhone } from "@/lib/utils";
// import type { ParticipantJourney } from "@/types/admin";

// export function ConsentPdfDialog({
//   participant,
//   onClose,
// }: {
//   participant: ParticipantJourney | null;
//   onClose: () => void;
// }) {
//   if (!participant) return null;

//   const previewUrl = adminConsentPdfUrl(participant.id, false);
//   const downloadUrl = adminConsentPdfUrl(participant.id, true);

//   return (
//     <Dialog open onOpenChange={(open) => !open && onClose()}>
//       <DialogContent className="max-h-[94vh] max-w-5xl overflow-hidden p-0">
//         <DialogHeader className="border-b border-border px-5 py-4">
//           <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
//             <div>
//               <DialogTitle className="flex items-center gap-2">
//                 <FileText className="size-5 text-primary" /> Consent Release Letter
//               </DialogTitle>
//               <DialogDescription className="mt-1">
//                 {participant.name?.trim() || "Participant"} · {formatPhone(participant.phone)}
//                 {participant.claimAcceptedAt
//                   ? ` · Accepted ${formatDate(participant.claimAcceptedAt)} ${formatTime(participant.claimAcceptedAt)}`
//                   : ""}
//               </DialogDescription>
//             </div>
//             <Button
//               size="sm"
//               onClick={() => window.open(downloadUrl, "_blank", "noopener,noreferrer")}
//             >
//               <Download className="size-4" /> Download PDF
//             </Button>
//           </div>
//         </DialogHeader>

//         <iframe
//           src={previewUrl}
//           title={`Consent letter for ${participant.name || participant.id}`}
//           className="h-[78vh] w-full bg-white"
//         />
//       </DialogContent>
//     </Dialog>
//   );
// }


import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminConsentPdfUrl } from "@/lib/admin/api";
import { formatDate, formatTime } from "@/lib/admin/format";
import { formatPhone } from "@/lib/utils";
import type { ParticipantJourney } from "@/types/admin";
interface ConsentPdfDialogProps {
  participant: ParticipantJourney | null;
  onClose: () => void;
}
export function ConsentPdfDialog({
  participant,
  onClose,
}: ConsentPdfDialogProps) {
  if (!participant) return null;
  const previewUrl = adminConsentPdfUrl(participant.id, false);
  const downloadUrl = adminConsentPdfUrl(participant.id, true);
  const handleDownload = (): void => {
    window.open(downloadUrl, "_blank", "noopener,noreferrer");
  };
  return (
    <Dialog
      open
      onOpenChange={(open: boolean) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[94vh] w-[96vw] max-w-5xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-5 py-4 pr-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="min-w-0 flex-1">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="size-5 shrink-0 text-primary" />
                <span>Consent Release Letter</span>
              </DialogTitle>
              <DialogDescription className="mt-1">
                {participant.name?.trim() || "Participant"} ·{" "}
                {formatPhone(participant.phone)}
                {participant.claimAcceptedAt
                  ? ` · Accepted ${formatDate(
                      participant.claimAcceptedAt,
                    )} ${formatTime(participant.claimAcceptedAt)}`
                  : ""}
              </DialogDescription>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleDownload}
              className="shrink-0 gap-2 sm:mr-2"
            >
              <Download className="size-4" />
              <span>Download PDF</span>
            </Button>
          </div>
        </DialogHeader>
        <iframe
          src={previewUrl}
          title={`Consent letter for ${participant.name || participant.id}`}
          className="h-[78vh] w-full border-0 bg-white"
        />
      </DialogContent>
    </Dialog>
  );
}