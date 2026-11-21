import { useState } from "react";

const budgetFields = ["transport", "food", "equipment", "other"];
const validAmount = /^\d+(?:\.\d{0,2})?$|^\.\d{1,2}$/;

function TripBudget({ participants, text, language }) {
  const [expenses, setExpenses] = useState({ transport: "", food: "", equipment: "", other: "" });
  let totalCents = 0;
  let invalid = false;

  for (const field of budgetFields) {
    const amount = expenses[field];
    if (amount && !validAmount.test(amount)) invalid = true;
    totalCents += Math.round(Number(amount) * 100);
  }

  const formatter = new Intl.NumberFormat(language, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const showTotals = !invalid && Number.isSafeInteger(totalCents);

  return (
    <section className="trip-panel trip-budget">
      <h2>{text.budget}</h2>
      <p>{text.budgetHint}</p>
      <div className="trip-budget-fields">
        {budgetFields.map((field) => (
          <label key={field}>
            {text[field]}
            <input type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00"
              aria-invalid={Boolean(expenses[field]) && !validAmount.test(expenses[field])}
              value={expenses[field]} onChange={(event) => setExpenses({ ...expenses, [field]: event.target.value })} />
          </label>
        ))}
      </div>
      {showTotals ? (
        <dl className="trip-facts trip-budget-totals" aria-live="polite">
          <div><dt>{text.total}</dt><dd>{formatter.format(totalCents / 100)}</dd></div>
          <div><dt>{text.perPerson}</dt><dd>{participants === null
            ? text.countUnavailable : formatter.format(totalCents / (100 * (participants + 1)))}</dd></div>
        </dl>
      ) : <p role="alert" className="trip-message trip-error">{text.invalidBudget}</p>}
    </section>
  );
}

export default TripBudget;
