export type PersonId = "pini" | "sean" | "ori";

export const PEOPLE: { id: PersonId; name: string }[] = [
  { id: "pini", name: "Pini" },
  { id: "sean", name: "Sean" },
  { id: "ori", name: "Ori" },
];

export function personName(id: string | null | undefined): string {
  return PEOPLE.find((p) => p.id === id)?.name ?? id ?? "Unknown";
}

export type Expense = {
  id: string;
  description: string;
  amount: number;
  currency: string;
  paid_by: PersonId;
  participants: PersonId[];
  expense_date: string;
  created_at: string;
};

export type Place = {
  id: string;
  name: string;
  link: string | null;
  notes: string | null;
  visited: boolean;
  created_by: PersonId | null;
  created_at: string;
};

export type PlaceRating = {
  id: string;
  place_id: string;
  person_id: PersonId;
  rating: number;
};

export type PlaceComment = {
  id: string;
  place_id: string;
  person_id: PersonId;
  comment: string;
  created_at: string;
};

export type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
  done_by: PersonId | null;
  created_by: PersonId | null;
  created_at: string;
};
