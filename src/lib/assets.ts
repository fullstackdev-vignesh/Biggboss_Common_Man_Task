import bbEye from "@/assets/bb-eye.png.asset.json";
import bbLogo from "@/assets/bb-logo.png.asset.json";
import loginScreen from "@/assets/login-screen.png.asset.json";

/** Swap these paths to replace the branded artwork. */
export const ASSETS = {
  /** Bigg Boss eye mark — wheel centre, coin faces, badges. */
  eye: bbEye.url,
  /** Full Bigg Boss Season 10 lockup — splash hero. */
  logo: bbLogo.url,
  /** Registration screen key art (uploaded `login-screen`). */
  registrationArt: loginScreen.url,
} as const;
