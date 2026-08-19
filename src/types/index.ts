export type Stage = "splash" | "wheel" | "coin";

export interface Participant {
  name: string;
  phone: string;
}

export interface ChallengeCategory {
  id: string;
  label: string;
  tasks: string[];
}

export interface SpinResult {
  category: ChallengeCategory;
  task: string;
  index: number;
}

export type CoinFace = "success" | "retry";
