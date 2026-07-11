import { Expense, PEOPLE, PersonId } from "./types";

/** Net balance per person: positive = is owed money, negative = owes money. */
export function computeBalances(expenses: Expense[]): Record<PersonId, number> {
  const balances = Object.fromEntries(PEOPLE.map((p) => [p.id, 0])) as Record<
    PersonId,
    number
  >;

  for (const expense of expenses) {
    const share = expense.amount / expense.participants.length;
    balances[expense.paid_by] += expense.amount;
    for (const participant of expense.participants) {
      balances[participant] -= share;
    }
  }

  for (const id of Object.keys(balances) as PersonId[]) {
    balances[id] = Math.round(balances[id] * 100) / 100;
  }

  return balances;
}

export type Settlement = { from: PersonId; to: PersonId; amount: number };

/** Greedily simplifies balances into the minimal set of "who pays who" transfers. */
export function computeSettlements(
  balances: Record<PersonId, number>,
): Settlement[] {
  const creditors = (Object.entries(balances) as [PersonId, number][])
    .filter(([, amount]) => amount > 0.005)
    .map(([id, amount]) => ({ id, amount }))
    .sort((a, b) => b.amount - a.amount);

  const debtors = (Object.entries(balances) as [PersonId, number][])
    .filter(([, amount]) => amount < -0.005)
    .map(([id, amount]) => ({ id, amount: -amount }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
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
