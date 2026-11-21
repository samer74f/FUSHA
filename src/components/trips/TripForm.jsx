import { useState } from "react";
import { Link } from "react-router-dom";
import { getActionErrorMessage, tripTypes } from "./tripText";
import "../../pages/trips/CreateTrip.css";

function formatDateTimeForInput(timestamp) {
  if (!timestamp) return undefined;
  const date = new Date(timestamp);
  const offsetInMilliseconds = date.getTimezoneOffset() * 60 * 1000;
  const localTime = new Date(date.getTime() - offsetInMilliseconds);
  return localTime.toISOString().slice(0, 16);
}

function TripForm({ trip, text, typeSupported, onSave, cancelTo }) {
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [saveError, setSaveError] = useState(null);
  const minimumCapacity = Math.max(1, trip?.current_participants ?? 0);
  const initialStartInput = formatDateTimeForInput(trip?.starts_at);
  const initialEndInput = formatDateTimeForInput(trip?.ends_at);

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSaving) return;

    setValidationError("");
    setSaveError(null);
    const formData = new FormData(event.currentTarget);
    const startInput = formData.get("starts_at");
    const endInput = formData.get("ends_at");
    // Keep the original timestamps when the organizer leaves those fields unchanged.
    const keepStartTime = trip && startInput === initialStartInput;
    const keepEndTime = trip && endInput === initialEndInput;
    const startDate = new Date(keepStartTime ? trip.starts_at : startInput);
    const endDate = new Date(keepEndTime ? trip.ends_at : endInput);
    const tripType = formData.get("trip_type");
    const values = {
      title: formData.get("title").trim(),
      location: formData.get("location").trim() || null,
      max_participants: Number(formData.get("max_participants")),
      description: formData.get("description").trim(),
    };

    if (!values.title || (!trip && !values.location) || (typeSupported && tripType && !tripTypes.includes(tripType))
      || !Number.isInteger(values.max_participants) || values.max_participants > 2147483647) {
      setValidationError("invalidFields");
      return;
    }
    if (!startInput || !endInput || !Number.isFinite(startDate.getTime()) || !(endDate > startDate)) {
      setValidationError("invalidSchedule");
      return;
    }
    if (values.max_participants < minimumCapacity) {
      setValidationError("invalidCapacity");
      return;
    }

    values.starts_at = keepStartTime ? trip.starts_at : startDate.toISOString();
    values.ends_at = keepEndTime ? trip.ends_at : endDate.toISOString();
    if (typeSupported && tripType) values.trip_type = tripType;

    setIsSaving(true);
    try {
      await onSave(values);
    } catch (error) {
      setSaveError(error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="trip-form" onSubmit={handleSubmit}>
      <fieldset disabled={isSaving}>
        <label>
          {text.title}
          <input name="title" dir="auto" defaultValue={trip?.title} maxLength={120} required />
        </label>
        <label>
          {text.location}
          <input name="location" dir="auto" defaultValue={trip?.location ?? ""} maxLength={160} required={!trip} />
        </label>
        <label>
          {text.starts} ({text.localTime})
          <input name="starts_at" type="datetime-local" defaultValue={initialStartInput} required />
        </label>
        <label>
          {text.ends} ({text.localTime})
          <input name="ends_at" type="datetime-local" defaultValue={initialEndInput} required />
        </label>
        {typeSupported ? (
          <label>
            {text.type}
            <select name="trip_type" defaultValue={trip?.trip_type ?? ""} required={!trip || Boolean(trip.trip_type)}>
              <option value="" disabled={!trip || Boolean(trip.trip_type)}>{text.chooseType}</option>
              {tripTypes.map((type) => <option key={type} value={type}>{text.types[type]}</option>)}
            </select>
          </label>
        ) : <p className="trip-form-wide">{text.typePending}</p>}
        <label>
          {text.maxParticipants}
          <input name="max_participants" type="number" min={minimumCapacity} max="2147483647"
            step="1" defaultValue={trip?.max_participants ?? 1} required />
        </label>
        <label className="trip-form-wide">
          {text.description} <small>({text.optional})</small>
          <textarea name="description" dir="auto" defaultValue={trip?.description} maxLength={2000} rows={4} />
        </label>
      </fieldset>

      {validationError && <p className="trip-message trip-error" role="alert">{text[validationError]}</p>}
      {saveError && <p className="trip-message trip-error" role="alert">{getActionErrorMessage(saveError, text, "save")}</p>}
      <div className="trip-actions">
        <button className="trip-button" type="submit" disabled={isSaving}>
          {isSaving ? text.working : trip ? text.save : text.create}
        </button>
        {!isSaving && <Link className="trip-button trip-secondary" to={cancelTo}>{text.cancel}</Link>}
      </div>
    </form>
  );
}

export default TripForm;
