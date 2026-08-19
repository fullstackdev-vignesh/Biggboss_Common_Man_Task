import type { ChallengeCategory } from "@/types";

export const challengeCategories: ChallengeCategory[] = [
  {
    id: "pose",
    label: "POSE",
    tasks: [
      "Give your best 10-second Bigg Boss entry pose.",
      "Show your strongest “I am ready” pose.",
      "Give a winner pose for the camera.",
    ],
  },
  {
    id: "dialogue",
    label: "DIALOGUE",
    tasks: [
      "Say any Tamil movie dialogue in your own style.",
      "Turn a normal line into a dramatic Bigg Boss dialogue.",
      "Deliver one dialogue like you are entering the house.",
    ],
  },
  {
    id: "dance",
    label: "DANCE",
    tasks: [
      "Show one favourite Tamil cinema dance step.",
      "Give a 10-second celebration move.",
      "Show your “finale night” dance step.",
    ],
  },
  {
    id: "reaction",
    label: "REACTION",
    tasks: [
      "Show your reaction if Bigg Boss says: “You are nominated.”",
      "React as if you just became captain.",
      "React as if Bigg Boss gives you a secret task.",
    ],
  },
  {
    id: "city",
    label: "CITY",
    tasks: [
      "Complete: “My city is the best because…”",
      "Sell your hometown to Bigg Boss in one line.",
      "Name one thing Bigg Boss must experience in your city.",
    ],
  },
  {
    id: "food",
    label: "FOOD",
    tasks: [
      "Name your favourite Tamil Nadu food and say why in one line.",
      "Pick one dish you would take into the Bigg Boss house.",
      "Name one food you could eat for a full week.",
    ],
  },
  {
    id: "intro",
    label: "INTRO",
    tasks: [
      "Introduce yourself like a Bigg Boss contestant in one line.",
      "Give Bigg Boss your 10-second entry introduction.",
      "Say your name, city and one thing people should remember about you.",
    ],
  },
  {
    id: "surprise",
    label: "SURPRISE",
    tasks: [
      "Celebrate as if you just won Bigg Boss.",
      "Give Bigg Boss your funniest 5-second expression.",
      "Create one funny rule for the Bigg Boss house.",
    ],
  },
];
