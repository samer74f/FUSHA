import { useState } from "react";

const budgetFields = ["transport", "food", "equipment", "other"];
const amountPattern = /^\d+(?:\.\d{0,2})?$|^\.\d{1,2}$/;

function TripBudget({ approvedParticipantCount, text, language }) {
  const [expenses, setExpenses] = useState({ transport: "", food: "", equipment: "", other: "" });
  let totalCents = 0;
  let hasInvalidAmount = false;

  for (const field of budgetFields) {
    const amount = expenses[field];
    if (amount && !amountPattern.test(amount)) hasInvalidAmount = true;
    totalCents += Math.round(Number(amount) * 100);
  }

  const amountFormatter = new Intl.NumberFormat(language, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const showTotals = !hasInvalidAmount && Number.isSafeInteger(totalCents);
  const travelerCount = approvedParticipantCount === null ? null : approvedParticipantCount + 1;
  const totalBudget = totalCents / 100;

  return (
    <section className="trip-panel trip-budget">
      <h2>{text.budget}</h2>
      <p>{text.budgetHint}</p>
      <div className="trip-budget-fields">
        {budgetFields.map((field) => (
          <label key={field}>
            {text[field]}
            <input type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00"
              aria-invalid={Boolean(expenses[field]) && !amountPattern.test(expenses[field])}
              value={expenses[field]} onChange={(event) => setExpenses({ ...expenses, [field]: event.target.value })} />
          </label>
        ))}
      </div>
      {showTotals ? (
        <dl className="trip-facts trip-budget-totals" aria-live="polite">
          <div><dt>{text.total}</dt><dd>{amountFormatter.format(totalBudget)}</dd></div>
          <div><dt>{text.perPerson}</dt><dd>{travelerCount === null
            ? text.countUnavailable : amountFormatter.format(totalCents / (100 * travelerCount))}</dd></div>
        </dl>
      ) : <p role="alert" className="trip-message trip-error">{text.invalidBudget}</p>}
    </section>
  );
}

export default TripBudget;
