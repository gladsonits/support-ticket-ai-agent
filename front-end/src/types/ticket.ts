export interface PIIEntity {
  entity_type: string;
  start: number;
  end: number;
  score: number;
  analysis_explanation: string | null;
  recognition_metadata: {
    recognizer_name: string;
    recognizer_identifier: string;
  };
}

export interface PromptInjectionResult {
  is_safe: boolean;
  label: string;
  reason: string;
}

export interface SentimentScores {
  NEG: number;
  POS: number;
  NEU: number;
}

export interface SentimentResult {
  label: string;
  scores: SentimentScores;
}

export interface ToxicityResult {
  toxicity: number;
  severe_toxicity: number;
  obscene: number;
  threat: number;
  insult: number;
  identity_attack: number;
}

export interface CategoryResult {
  category: string;
  urgency: "Low" | "Medium" | "High" | "Critical";
  summary: string;
  confidence_score: number;
}

export interface SupportTicketData {
  createddate: string;
  rawdescription: string;
  sanitizeddescription: string;
  anonymizeddescription: string;
  pii: PIIEntity[];
  promptinjection: PromptInjectionResult;
  sentiment: SentimentResult;
  toxicity: ToxicityResult;
  category: CategoryResult;
}

export interface APIResponse {
  status: string;
  message: string;
  data: SupportTicketData;
}
