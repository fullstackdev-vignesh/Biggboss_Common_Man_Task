// import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
// import { motion } from 'framer-motion';
// import { Eraser, PenLine } from 'lucide-react';

// export function SignaturePad({
//   value,
//   onChange,
//   invalidPulse,
// }: {
//   value: string | null;
//   onChange: (value: string | null) => void;
//   invalidPulse: number;
// }) {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const drawingRef = useRef(false);
//   const hasInkRef = useRef(Boolean(value));

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const rect = canvas.getBoundingClientRect();
//     const dpr = Math.max(window.devicePixelRatio || 1, 1);
//     canvas.width = Math.max(1, Math.floor(rect.width * dpr));
//     canvas.height = Math.max(1, Math.floor(rect.height * dpr));

//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;
//     ctx.scale(dpr, dpr);
//     ctx.lineCap = 'round';
//     ctx.lineJoin = 'round';
//     ctx.lineWidth = 2.4;
//     ctx.strokeStyle = '#d9a72c';

//     if (value) {
//       const image = new Image();
//       image.onload = () => {
//         ctx.clearRect(0, 0, rect.width, rect.height);
//         ctx.drawImage(image, 0, 0, rect.width, rect.height);
//       };
//       image.src = value;
//     }
//   }, []); // initialize once; resizing the page should not silently wipe an in-progress signature

//   function point(event: ReactPointerEvent<HTMLCanvasElement>) {
//     const canvas = canvasRef.current!;
//     const rect = canvas.getBoundingClientRect();
//     return { x: event.clientX - rect.left, y: event.clientY - rect.top };
//   }

//   function start(event: ReactPointerEvent<HTMLCanvasElement>) {
//     const canvas = canvasRef.current;
//     const ctx = canvas?.getContext('2d');
//     if (!canvas || !ctx) return;
//     event.preventDefault();
//     canvas.setPointerCapture(event.pointerId);
//     drawingRef.current = true;
//     const p = point(event);
//     ctx.beginPath();
//     ctx.moveTo(p.x, p.y);
//   }

//   function move(event: ReactPointerEvent<HTMLCanvasElement>) {
//     if (!drawingRef.current) return;
//     const canvas = canvasRef.current;
//     const ctx = canvas?.getContext('2d');
//     if (!canvas || !ctx) return;
//     event.preventDefault();
//     const p = point(event);
//     ctx.lineTo(p.x, p.y);
//     ctx.stroke();
//     hasInkRef.current = true;
//   }

//   function finish(event?: ReactPointerEvent<HTMLCanvasElement>) {
//     if (!drawingRef.current) return;
//     drawingRef.current = false;
//     if (event && canvasRef.current?.hasPointerCapture(event.pointerId)) {
//       canvasRef.current.releasePointerCapture(event.pointerId);
//     }
//     const canvas = canvasRef.current;
//     if (!canvas || !hasInkRef.current) return;
//     onChange(canvas.toDataURL('image/png'));
//   }

//   function clear() {
//     const canvas = canvasRef.current;
//     const ctx = canvas?.getContext('2d');
//     if (!canvas || !ctx) return;
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     hasInkRef.current = false;
//     onChange(null);
//   }

//   return (
//     <motion.div
//       key={invalidPulse}
//       className="rounded-xl border border-primary/30 bg-black/20 p-4"
//       animate={
//         invalidPulse > 0
//           ? {
//               boxShadow: [
//                 '0 0 0 0 rgba(239,68,68,0)',
//                 '0 0 0 3px rgba(239,68,68,.65)',
//                 '0 0 0 0 rgba(239,68,68,0)',
//                 '0 0 0 3px rgba(239,68,68,.65)',
//                 '0 0 0 0 rgba(239,68,68,0)',
//                 '0 0 0 3px rgba(239,68,68,.65)',
//                 '0 0 0 0 rgba(239,68,68,0)',
//               ],
//             }
//           : undefined
//       }
//       transition={{ duration: 1.05, ease: 'easeInOut' }}
//     >
//       <div className="mb-3 flex items-center justify-between gap-3">
//         <div>
//           <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-primary sm:text-sm">
//             <PenLine className="size-4" /> DIGITAL SIGNATURE
//           </p>
//           <p className="mt-1 text-xs text-muted-foreground">
//             Sign inside the box using your mouse or finger.
//           </p>
//         </div>
//         <button
//           type="button"
//           onClick={clear}
//           className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 px-3 py-2 text-xs text-primary hover:bg-primary/10"
//         >
//           <Eraser className="size-3.5" /> Clear
//         </button>
//       </div>

//       <canvas
//         ref={canvasRef}
//         className="h-44 w-full touch-none rounded-lg border border-primary/25 bg-white"
//         onPointerDown={start}
//         onPointerMove={move}
//         onPointerUp={finish}
//         onPointerCancel={finish}
//         onPointerLeave={(event) => {
//           if (drawingRef.current) finish(event);
//         }}
//         aria-label="Digital signature pad"
//       />
//     </motion.div>
//   );
// }


import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { Eraser, PenLine } from "lucide-react";
interface SignaturePadProps {
  value: string | null;
  onChange: (value: string | null) => void;
  invalidPulse: number;
}
export function SignaturePad({ value, onChange, invalidPulse }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const hasInkRef = useRef(Boolean(value));
  const animationControls = useAnimationControls();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = "#d9a72c";
    if (value) {
      const image = new Image();
      image.onload = () => {
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(image, 0, 0, rect.width, rect.height);
        hasInkRef.current = true;
      };
      image.src = value;
    }
  }, []);
  useEffect(() => {
    if (invalidPulse <= 0) return;
    animationControls.stop();
    animationControls.set({
      boxShadow: "0 0 0 0 rgba(239,68,68,0)",
    });
    void animationControls.start({
      boxShadow: [
        "0 0 0 0 rgba(239,68,68,0)",
        "0 0 0 3px rgba(239,68,68,.65)",
        "0 0 0 0 rgba(239,68,68,0)",
        "0 0 0 3px rgba(239,68,68,.65)",
        "0 0 0 0 rgba(239,68,68,0)",
        "0 0 0 3px rgba(239,68,68,.65)",
        "0 0 0 0 rgba(239,68,68,0)",
      ],
      transition: {
        duration: 1.05,
        ease: "easeInOut",
      },
    });
  }, [invalidPulse, animationControls]);
  function getPoint(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }
  function startDrawing(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    event.preventDefault();
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is not supported by this browser/device.
    }
    drawingRef.current = true;
    const point = getPoint(event);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }
  function draw(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    event.preventDefault();
    const point = getPoint(event);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    hasInkRef.current = true;
  }
  function finishDrawing(event?: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.closePath();
    if (event) {
      try {
        if (canvas.hasPointerCapture(event.pointerId)) {
          canvas.releasePointerCapture(event.pointerId);
        }
      } catch {
        // Ignore pointer capture release errors.
      }
    }
    if (!hasInkRef.current) return;
    onChange(canvas.toDataURL("image/png"));
  }
  function clearSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    drawingRef.current = false;
    hasInkRef.current = false;
    onChange(null);
  }
  return (
    <motion.div
      animate={animationControls}
      className="rounded-xl border border-primary/30 bg-black/20 p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-primary sm:text-sm">
            <PenLine className="size-4" />
            DIGITAL SIGNATURE
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sign inside the box using your mouse or finger.
          </p>
        </div>
        <button
          type="button"
          onClick={clearSignature}
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 px-3 py-2 text-xs text-primary transition-colors hover:bg-primary/10"
        >
          <Eraser className="size-3.5" />
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="h-44 w-full touch-none rounded-lg border border-primary/25 bg-white"
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={finishDrawing}
        onPointerCancel={finishDrawing}
        onPointerLeave={(event) => {
          if (drawingRef.current) finishDrawing(event);
        }}
        aria-label="Digital signature pad"
      />
    </motion.div>
  );
}