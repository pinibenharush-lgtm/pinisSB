export type PersonId = "pini" | "sean" | "ori";

export const PEOPLE: { id: PersonId; name: string }[] = [
  { id: "pini", name: "Pini" },
  { id: "sean", name: "Sean" },
  { id: "ori", name: "Ori" },
];

export function personName(id: string | null | undefined): string {
  return PEOPLE.find((p) => p.id === id)?.name ?? id ?? "Unknown";
}

/** "three_way": split evenly between Pini, Sean and Ori.
 *  "couple": split between two pockets — Pini, and Sean+Ori combined. */
export type SplitMode = "three_way" | "couple";

export type Expense = {
  id: string;
  description: string;
  amount: number;
  currency: string;
  paid_by: PersonId;
  participants: PersonId[];
  split_mode: SplitMode;
  expense_date: string;
  created_at: string;
};

export type Place = {
  id: string;
  name: string;
  link: string | null;
  notes: string | null;
  visited: boolean;
  lat: number | null;
  lng: number | null;
  photo_url: string | null;
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

export type GameResult = {
  id: string;
  game_date: string;
  person_id: PersonId;
  seconds: number;
  created_at: string;
};

export type TutResult = {
  id: string;
  game_date: string;
  person_id: PersonId;
  seconds: number;
  created_at: string;
};

export type TripInfo = {
  id: string;
  icon: string;
  title: string;
  details: string;
  created_by: PersonId | null;
  created_at: string;
};

export type TripInfoFile = {
  id: string;
  trip_info_id: string;
  file_url: string;
  file_name: string;
  created_by: PersonId | null;
  created_at: string;
};
