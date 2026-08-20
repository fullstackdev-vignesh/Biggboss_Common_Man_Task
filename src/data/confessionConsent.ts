export interface ConsentSection {
  title: string;
  paragraphs: (string | { intro: string; items: string[] })[];
}

export const CONSENT_INTRO =
  "You are about to participate in the Confession Room stage of the Bigg Boss Tamil Common Man Audition process. Please read the following information carefully before entering the Confession Room.";

export const CONSENT_SECTIONS: ConsentSection[] = [
  {
    title: "1. CONFESSION ROOM PARTICIPATION",
    paragraphs: [
      "I voluntarily agree to participate in the Confession Room audition process.",
      "I understand that during this stage, I will be seated inside a designated Confession Room and may interact with a digitally operated / AI-assisted Bigg Boss system.",
      {
        intro: "The Confession Room may contain:",
        items: [
          "Video camera / CCTV camera",
          "Microphone",
          "Speaker",
          "Digital recording equipment",
          "Computer/software-based audition system",
          "AI-assisted question and response processing technology",
        ],
      },
      "I understand and agree to participate under these conditions.",
    ],
  },
  {
    title: "2. AI-ASSISTED BIGG BOSS INTERACTION",
    paragraphs: [
      "I understand that questions presented to me during the Confession Room interaction may be delivered through a trained AI-assisted Bigg Boss system.",
      {
        intro: "The system may:",
        items: [
          "Ask audition-related questions",
          "Receive my spoken answers",
          "Convert or process my voice and responses digitally",
          "Analyse my answers",
          "Evaluate whether a response meets the configured criteria",
          "Ask follow-up questions",
          "Move to the next question based on my response",
          "Record the interaction for audition evaluation",
        ],
      },
      "I understand that some parts of this interaction may be automated and may not involve a person speaking to me live.",
    ],
  },
  {
    title: "3. AI RESPONSE ANALYSIS CONSENT",
    paragraphs: [
      "I understand that my answers may be processed or analysed using software and AI-assisted technologies.",
      {
        intro: "This processing may include analysis of:",
        items: [
          "My spoken response",
          "Words and content of my answer",
          "Relevance of my answer to the question",
          "Completion of the required response",
          "Audition-related evaluation criteria",
          "Follow-up question selection",
        ],
      },
      "I consent to my responses being digitally processed for the purpose of conducting and evaluating this audition.",
    ],
  },
  {
    title: "4. IMPORTANT – AI IS PART OF THE AUDITION PROCESS",
    paragraphs: [
      "I understand that the AI-assisted system is being used as part of the audition interaction and evaluation workflow.",
      {
        intro: "I understand that an automated system may occasionally:",
        items: [
          "Misunderstand a spoken answer",
          "Misinterpret pronunciation or background noise",
          "Require me to repeat an answer",
          "Generate a follow-up question based on the information I provide",
        ],
      },
      "Where required, authorised audition personnel may review the interaction or recorded material.",
    ],
  },
  {
    title: "5. VIDEO RECORDING CONSENT",
    paragraphs: [
      "I understand that the entire or part of my Confession Room interaction may be video recorded.",
      {
        intro: "I voluntarily consent to the recording of my:",
        items: [
          "Face",
          "Image and likeness",
          "Body movements",
          "Expressions",
          "Reactions",
          "Performance",
          "Confession Room interaction",
        ],
      },
      "I understand that cameras may continue recording throughout my participation in the Confession Room.",
    ],
  },
  {
    title: "6. AUDIO & VOICE RECORDING CONSENT",
    paragraphs: [
      "I understand that microphones installed in the Confession Room may record my voice and conversations during the audition.",
      {
        intro: "I voluntarily consent to the recording and processing of:",
        items: [
          "My voice",
          "Spoken answers",
          "Statements",
          "Reactions",
          "Audition responses",
          "Interaction with the AI-assisted Bigg Boss system",
        ],
      },
      "I understand that my voice recordings may be used for audition evaluation, review and authorised programme-related purposes.",
    ],
  },
  {
    title: "7. PARTICIPANT ANSWERS & PERSONAL INFORMATION",
    paragraphs: [
      "During the interaction, I may be asked questions regarding myself, my experiences, interests, opinions, personality or other audition-related topics.",
      "I understand that I should provide information voluntarily.",
      "I understand that I should not disclose unnecessary highly confidential information, including passwords, banking credentials, OTPs or other information unrelated to the audition.",
      "If I am uncomfortable answering a particular question, I may communicate this during the audition, subject to the applicable audition process.",
    ],
  },
  {
    title: "8. USE OF RECORDED AUDITION CONTENT",
    paragraphs: [
      "I authorise [Programme Owner / Broadcaster / Producer] and its authorised production, technology and activation partners to collect, store, review and process my Confession Room recordings for purposes connected with the Bigg Boss Tamil audition process.",
      {
        intro: "This may include:",
        items: [
          "Audition evaluation",
          "Participant assessment",
          "Shortlisting",
          "Internal review",
          "Programme production",
          "Quality review",
          "Documentation",
          "Technical validation",
          "Programme-related promotional purposes",
          "Television or digital content, where authorised under the final programme terms",
        ],
      },
      "Any public or promotional use will remain subject to the rights and terms approved by the Programme Owner / Producer.",
    ],
  },
  {
    title: "9. PERSONAL DATA PROCESSING",
    paragraphs: [
      {
        intro: "I understand that the Confession Room system may process information including:",
        items: [
          "Name",
          "Mobile number",
          "Participant ID",
          "Date and time",
          "Audition location",
          "Video recording",
          "Audio recording",
          "Voice",
          "Answers and statements",
          "Question-and-answer history",
          "Audition results",
          "AI/system evaluation results",
          "Progression status",
          "Technical and consent records",
        ],
      },
      "I consent to this information being processed for legitimate purposes connected with conducting, managing, reviewing and evaluating the audition.",
    ],
  },
  {
    title: "10. RECORDING & DATA SECURITY",
    paragraphs: [
      "I understand that reasonable security measures will be used to protect my audition recordings and personal information from unauthorised access, loss, misuse or disclosure.",
      {
        intro: "Access to the recordings should be limited to authorised:",
        items: [
          "Programme representatives",
          "Production personnel",
          "Audition team members",
          "Technology providers",
          "Evaluation personnel",
          "Other authorised service providers involved in the audition process",
        ],
      },
      "subject to applicable policies and law.",
    ],
  },
  {
    title: "11. NO GUARANTEE OF SELECTION",
    paragraphs: [
      "I understand that participation in the Confession Room is part of an audition/evaluation process.",
      {
        intro: "Entering or completing the Confession Room:",
        items: ["DOES NOT GUARANTEE MY SELECTION AS A BIGG BOSS TAMIL CONTESTANT."],
      },
      {
        intro: "I understand that:",
        items: [
          "Answering all questions does not guarantee selection.",
          "Receiving positive responses during the interaction does not guarantee selection.",
          "An AI/system validation of my answer does not represent final contestant selection.",
          "Completion of the Confession Room does not guarantee entry into the Bigg Boss house.",
        ],
      },
      "Final shortlisting and selection decisions will be taken only by the authorised programme / production team according to their applicable selection process.",
    ],
  },
  {
    title: "12. AI VALIDATION IS NOT FINAL SELECTION",
    paragraphs: [
      {
        intro:
          "I specifically understand that when the AI-assisted system indicates that an answer is:",
        items: ["Correct", "Accepted", "Completed", "Valid", "Successful"],
      },
      "such indication relates only to the relevant question or configured audition task.",
      "It does not mean that I have been selected for Bigg Boss Tamil.",
      "Final evaluation may involve additional review by authorised programme representatives.",
    ],
  },
  {
    title: "13. VOLUNTARY PARTICIPATION",
    paragraphs: [
      "I confirm that my participation is voluntary.",
      "I understand the nature of the Confession Room interaction before proceeding.",
      "If I do not agree to the recording, AI-assisted interaction or processing necessary for this stage, I understand that I may not be able to participate in the Confession Room audition process.",
    ],
  },
  {
    title: "14. DIGITAL CONSENT",
    paragraphs: [
      "I understand that this consent is being collected electronically.",
      {
        intro: 'By selecting "I Agree & Enter Confession Room", I confirm that:',
        items: [
          "I have read and understood this consent.",
          "I voluntarily agree to enter the Confession Room.",
          "I understand that I will interact with an AI-assisted system.",
          "I consent to the AI-assisted processing of my answers.",
          "I consent to video recording.",
          "I consent to audio and voice recording.",
          "I consent to the processing of my audition information.",
          "I understand that the interaction may be recorded and reviewed.",
          "I understand that AI validation does not guarantee selection.",
          "I understand that completing the Confession Room does not guarantee selection for Bigg Boss Tamil.",
        ],
      },
    ],
  },
];

export const CONSENT_CONFIRMATION_TEXT =
  "I have read and understood the above Confession Room Consent. I voluntarily agree to participate in the AI-assisted Bigg Boss interaction and consent to the recording and processing of my video, CCTV footage, voice, audio, answers and audition-related information for evaluation and programme-related purposes. I understand that AI validation or completion of the Confession Room does not guarantee my selection for Bigg Boss Tamil.";

export const CONSENT_DECLINE_TEXT =
  "I do not wish to proceed with the Confession Room audition. I understand that declining means I will not enter the Confession Room and my Bigg Boss Entry Coupon will not be issued.";
