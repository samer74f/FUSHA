import { useEffect, useState } from "react";
import { getParticipants } from "../../services/tripService";
import { TripLoadError } from "./TripMessages";
import { formatTripDate } from "./tripText";

function TripParticipants({ trip, text, language, requestNumber, disabled, onChange }) {
  const [result, setResult] = useState(null);
  const [retryNumber, setRetryNumber] = useState(0);

  useEffect(() => {
    let active = true;
    getParticipants(trip.id).then(
      (participants) => { if (active) setResult({ participants, requestNumber }); },
      (error) => { if (active) setResult({ error, requestNumber }); },
    );
    return () => { active = false; };
  }, [trip.id, requestNumber, retryNumber]);

  function retry() {
    setResult(null);
    setRetryNumber(retryNumber + 1);
  }

  const count = new Intl.NumberFormat(language).format(trip.current_participants);
  const controlsDisabled = disabled || result?.requestNumber !== requestNumber;
  const approvalOpen = trip.status === "open" && (!trip.trip_type || trip.trip_type === "Group");
  const atCapacity = trip.current_participants !== null && trip.current_participants >= trip.max_participants;

  return (
    <section className="trip-panel" id="trip-participants">
      <h2>{text.participants}</h2>
      {trip.current_participants !== null && <p>{text.currentParticipants} · <bdi>{count}</bdi></p>}
      {!result && <p role="status">{text.loading}</p>}
      {result?.error && <TripLoadError error={result.error} text={text} fallback="participants" onRetry={retry} />}
      {result?.participants?.length === 0 && <p>{text.noParticipants}</p>}
      {result?.participants?.length > 0 && (
        <ul className="trip-participants-list">
          {result.participants.map((participant) => (
            <li key={participant.id}>
              <div>
                <strong><bdi>{text.participant + " · " + participant.profile_id.slice(0, 8)}</bdi></strong>
                <p>{text.memberStatuses[participant.status]}</p>
                <time dateTime={participant.created_at}>{formatTripDate(participant.created_at, language)}</time>
              </div>
              <div className="trip-actions">
                {participant.status === "pending" && (
                  <>
                    <button className="trip-button" type="button" disabled={controlsDisabled || !approvalOpen || atCapacity}
                      onClick={() => onChange("approved", participant.id)}>{text.approve}</button>
                    <button className="trip-button trip-secondary" type="button" disabled={controlsDisabled}
                      onClick={() => onChange("rejected", participant.id)}>{text.reject}</button>
                  </>
                )}
                {participant.status !== "pending" && (
                  <button className="trip-button trip-secondary" type="button" disabled={controlsDisabled}
                    onClick={() => onChange("removed", participant.id)}>{text.remove}</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default TripParticipants;
