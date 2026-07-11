import { Expense, PersonId } from "./types";

/** Net balance per person: positive = is owed money, negative = owes money. */
export function computeBalances(expenses: Expense[]): Record<PersonId, number> {
  const balances: Record<PersonId, number> = { pini: 0, sean: 0, ori: 0 };

  for (const expense of expenses) {
    const amount = expense.amount;

    if (expense.split_mode === "couple") {
      // Two pockets: Pini, and Sean+Ori combined. Whichever of Sean/Ori
      // actually paid, the credit is shared evenly across the couple's
      // pocket so no debt is implied between Sean and Ori themselves.
      if (expense.paid_by === "pini") {
        balances.pini += amount;
      } else {
        balances.sean += amount / 2;
        balances.ori += amount / 2;
      }
      balances.pini -= amount / 2;
      balances.sean -= amount / 4;
      balances.ori -= amount / 4;
    } else {
      const share = amount / 3;
      balances[expense.paid_by] += amount;
      balances.pini -= share;
      balances.sean -= share;
      balances.ori -= share;
    }
  }

  for (const id of Object.keys(balances) as PersonId[]) {
    balances[id] = Math.round(balances[id] * 100) / 100;
  }

  return balances;
}

export type PocketId = "pini" | "couple";

export const POCKETS: { id: PocketId; name: string }[] = [
  { id: "pini", name: "Pini" },
  { id: "couple", name: "Sean & Ori" },
];

/** Collapses Sean and Ori into a single "couple" pocket, since they don't
 * need to track debt between themselves. */
export function computePocketBalances(
  expenses: Expense[],
): Record<PocketId, number> {
  const personBalances = computeBalances(expenses);
  return {
    pini: personBalances.pini,
    couple: Math.round((personBalances.sean + personBalances.ori) * 100) / 100,
  };
}

export type Settlement<T extends string = PocketId> = {
  from: T;
  to: T;
  amount: number;
};

/** Greedily simplifies balances into the minimal set of "who pays who" transfers. */
export function computeSettlements<T extends string>(
  balances: Record<T, number>,
): Settlement<T>[] {
  const creditors = (Object.entries(balances) as [T, number][])
    .filter(([, amount]) => amount > 0.005)
    .map(([id, amount]) => ({ id, amount }))
    .sort((a, b) => b.amount - a.amount);

  const debtors = (Object.entries(balances) as [T, number][])
    .filter(([, amount]) => amount < -0.005)
    .map(([id, amount]) => ({ id, amount: -amount }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: Settlement<T>[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.round(Math.min(debtor.amount, creditor.amount) * 100) / 100;

    if (amount > 0.005) {
      settlements.push({ from: debtor.id, to: creditor.id, amount });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount <= 0.005) i++;
    if (creditor.amount <= 0.005) j++;
  }

  return settlements;
}
