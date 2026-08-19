import { motion } from "framer-motion";

export function WheelPointer({ active }: { active?: boolean }) {
  return (
    <motion.div
      className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-[46%]"
      animate={
        active
          ? { scale: [1, 1.22, 1], filter: ["brightness(1)", "brightness(1.6)", "brightness(1)"] }
          : {}
      }
      transition={{ duration: 0.9, repeat: active ? Infinity : 0, ease: "easeInOut" }}
    >
      <div
        className="size-0 border-x-[14px] border-t-[30px] border-x-transparent"
        style={{
          borderTopColor: "var(--gold-bright)",
          filter: "drop-shadow(0 6px 14px color-mix(in oklab, var(--gold) 85%, transparent))",
        }}
      />
      <div className="mx-auto -mt-1 size-3 rounded-full bg-primary shadow-[0_0_16px_var(--gold)]" />
    </motion.div>
  );
}
