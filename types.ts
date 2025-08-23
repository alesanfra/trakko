export interface Translations {
  [key: string]: string;
}

export interface Participant {
  timestamp: string;
  name?: string;
  provenance?: string;
  category: string;
  ticketNumber: number;
}
