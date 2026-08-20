import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { ASSETS } from "@/lib/assets";
import { tryAdminLogin } from "@/hooks/useAdminAuth";

const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 26, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const },
});

export function AdminLoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (tryAdminLogin(username, password)) {
      setError(null);
      onSuccess();
      return;
    }
    setError("Invalid username or password.");
  };

  return (
    <section className="relative flex min-h-screen flex-col lg:flex-row">
      <AnimatedBackground particleCount={16} rays={false} />

      {/* LEFT — key art */}
      <motion.div
        className="relative h-[42vh] w-full overflow-hidden lg:h-auto lg:min-h-screen lg:w-[54%]"
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img
          src={import.meta.env.BASE_URL + "images/login-screen.png"}
          alt="Bigg Boss Season 10 key art"
          draggable={false}
          className="size-full select-none object-cover object-center"
          initial={{ scale: 1.18 }}
          animate={{ scale: [1.12, 1.18, 1.12] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, oklch(0.13 0.012 60) 4%, transparent 55%), linear-gradient(to right, oklch(0.13 0.012 60 / 45%), transparent 45%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 hidden lg:block"
          style={{
            background: "linear-gradient(to right, transparent 60%, oklch(0.13 0.012 60) 100%)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-px lg:bg-gradient-to-b" />
      </motion.div>

      {/* RIGHT — form */}
      <div className="relative flex w-full flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:px-14">
        <form onSubmit={handleSubmit} className="w-full max-w-lg" noValidate>
          <motion.p {...reveal(0.35)} className="text-xs tracking-[0.4em] text-primary sm:text-sm">
            ADMIN LOGIN
          </motion.p>
          {/* <motion.h1
            {...reveal(0.45)}
            className="display mt-5 text-3xl leading-[1.05] text-gold sm:text-4xl lg:text-[2.9rem]"
          >
            
              Sign in to view the Common Man participant journey report.
          </motion.h1> */}
          <motion.p {...reveal(0.6)} className="mt-4 text-sm text-muted-foreground sm:text-base">
            Sign in to view the Common Man participant journey report.
          </motion.p>

          <motion.div {...reveal(0.75)} className="mt-10">
            <label htmlFor="username" className="text-xs tracking-[0.25em] text-muted-foreground">
              USERNAME
            </label>
            <input
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              placeholder="Enter your username"
              autoComplete="username"
              className="mt-3 w-full rounded-xl border border-input bg-card/60 px-5 py-4 text-base text-foreground outline-none backdrop-blur transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--gold)_18%,transparent)]"
              required
            />
          </motion.div>

          <motion.div {...reveal(0.88)} className="mt-6">
            <label htmlFor="password" className="text-xs tracking-[0.25em] text-muted-foreground">
              PASSWORD
            </label>
            <div className="relative mt-3">
              <input
                id="password"
                value={password}
                type={showPassword ? "text" : "password"}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-input bg-card/60 px-5 py-4 pr-12 text-base text-foreground outline-none backdrop-blur transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--gold)_18%,transparent)]"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "password-error" : undefined}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
            <AnimatePresence>
              {error && (
                <motion.p
                  id="password-error"
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  className="mt-2 text-sm text-destructive"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.button
            {...reveal(1.05)}
            type="submit"
            className="btn-gold mt-10 w-full px-10 py-4 text-sm sm:w-auto sm:text-base"
          >
            Login
          </motion.button>
        </form>
      </div>
    </section>
  );
}
