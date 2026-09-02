// import { useMemo, useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { History, MapPin } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
// } from "@/components/ui/sheet";
// import { fetchAdminLocationHistory } from "@/lib/admin/api";
// import { formatDate, formatTime } from "@/lib/admin/format";

// export function LocationHistoryButton({
//   from,
//   to,
// }: {
//   from?: string;
//   to?: string;
// }) {
//   const [open, setOpen] = useState(false);

//   const historyQuery = useQuery({
//     queryKey: ["admin-location-history", from ?? "", to ?? ""],
//     queryFn: () => fetchAdminLocationHistory({ from, to }),
//     enabled: open,
//     refetchOnWindowFocus: false,
//   });

//   const groups = useMemo(() => {
//     const map = new Map<string, typeof historyQuery.data>();
//     for (const row of historyQuery.data ?? []) {
//       const list = map.get(row.dateStr) ?? [];
//       list.push(row);
//       map.set(row.dateStr, list);
//     }
//     return Array.from(map.entries());
//   }, [historyQuery.data]);

//   return (
//     <>
//       <div className="flex justify-end">
//         <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
//           <History className="size-4" /> Location History
//         </Button>
//       </div>

//       <Sheet open={open} onOpenChange={setOpen}>
//         <SheetContent className="w-full overflow-y-auto sm:max-w-md">
//           <SheetHeader>
//             <SheetTitle>Location History</SheetTitle>
//             <SheetDescription>
//               Admin location updates for the currently selected report date range.
//             </SheetDescription>
//           </SheetHeader>

//           <div className="space-y-6 px-4 pb-8">
//             {historyQuery.isLoading && (
//               <div className="space-y-3">
//                 {Array.from({ length: 4 }).map((_, index) => (
//                   <div key={index} className="shimmer h-16 rounded-xl" />
//                 ))}
//               </div>
//             )}

//             {historyQuery.isError && (
//               <p className="text-sm text-destructive">Unable to load location history.</p>
//             )}

//             {!historyQuery.isLoading && !historyQuery.isError && groups.length === 0 && (
//               <p className="text-sm text-muted-foreground">No location updates in this date range.</p>
//             )}

//             {groups.map(([dateStr, rows]) => (
//               <section key={dateStr}>
//                 <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
//                   {rows?.[0]?.updatedAt ? formatDate(rows[0].updatedAt) : dateStr}
//                 </p>
//                 <ol className="space-y-3 border-l border-border pl-4">
//                   {rows?.map((row) => (
//                     <li key={`${row.location}-${row.updatedAt}`} className="relative">
//                       <span className="absolute -left-[21px] top-2 size-2 rounded-full bg-primary" />
//                       <div className="rounded-xl border border-border/70 bg-card/50 p-3">
//                         <p className="flex items-center gap-2 font-semibold">
//                           <MapPin className="size-4 text-primary" /> {row.location}
//                         </p>
//                         <p className="mt-1 text-xs text-muted-foreground">
//                           {formatTime(row.updatedAt)}
//                         </p>
//                       </div>
//                     </li>
//                   ))}
//                 </ol>
//               </section>
//             ))}
//           </div>
//         </SheetContent>
//       </Sheet>
//     </>
//   );
// }

/* eslint-disable */
// @ts-nocheck


import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { fetchAdminLocationHistory } from "@/lib/admin/api";
import { formatDate, formatTime } from "@/lib/admin/format";
interface LocationHistoryButtonProps {
  from?: string;
  to?: string;
}
export function LocationHistoryButton({
  from,
  to,
}: LocationHistoryButtonProps) {
  const [open, setOpen] = useState(false);
  const historyQuery = useQuery({
    queryKey: ["admin-location-history", from ?? "", to ?? ""],
    queryFn: () => fetchAdminLocationHistory({ from, to }),
    enabled: open,
    refetchOnWindowFocus: false,
  });
  const groups = useMemo(() => {
    const map = new Map<string, typeof historyQuery.data>();
    for (const row of historyQuery.data ?? []) {
      const list = map.get(row.dateStr) ?? [];
      list.push(row);
      map.set(row.dateStr, list);
    }
    return Array.from(map.entries());
  }, [historyQuery.data]);
  return (
    <>
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <History className="size-4" />
          Location History
        </Button>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex h-dvh w-full flex-col overflow-hidden p-0 sm:max-w-md">
          <SheetHeader className="shrink-0 border-b border-border px-5 py-5 pr-12">
            <SheetTitle>Location History</SheetTitle>
            <SheetDescription>
              Admin location updates for the currently selected report date range.
            </SheetDescription>
          </SheetHeader>
          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2"
          >
            {historyQuery.isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="shimmer h-16 rounded-xl"
                  />
                ))}
              </div>
            )}
            {historyQuery.isError && (
              <p className="text-sm text-destructive">
                Unable to load location history.
              </p>
            )}
            {!historyQuery.isLoading &&
              !historyQuery.isError &&
              groups.length === 0 && (
                <div className="flex min-h-40 items-center justify-center">
                  <p className="text-center text-sm text-muted-foreground">
                    No location updates in this date range.
                  </p>
                </div>
              )}
            {!historyQuery.isLoading &&
              !historyQuery.isError &&
              groups.length > 0 && (
                <div className="space-y-6 pb-6">
                  {groups.map(([dateStr, rows]) => (
                    <section key={dateStr}>
                      <p className="mb-3 text-md font-bold uppercase tracking-widest text-primary">
                        {rows?.[0]?.updatedAt
                          ? formatDate(rows[0].updatedAt)
                          : dateStr}
                      </p>
                      <ol className="space-y-3 border-l border-border pl-4">
                        {rows?.map((row) => (
                          <li
                            key={`${row.location}-${row.updatedAt}`}
                            className="relative"
                          >
                            <span className="absolute -left-[21px] top-5 size-2 rounded-full bg-primary" />
                            <div className="rounded-xl border border-border/70 bg-card/50 p-3 transition-colors hover:bg-card/80">
                              <p className="flex items-center gap-2 font-semibold">
                                <MapPin className="size-4 shrink-0 text-primary" />
                                <span className="min-w-0 break-words">
                                  {row.location}
                                </span>
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {formatTime(row.updatedAt)}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </section>
                  ))}
                </div>
              )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}