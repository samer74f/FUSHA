import { useEffect, useState } from "react";
import { getParticipants } from "../../services/tripService";
import { TripLoadError } from "./TripMessages";
import { formatTripDate } from "./tripText";

function TripParticipants({ trip, text, language, reloadCount, disabled, onParticipantAction }) {
  const [participantsResult, setParticipantsResult] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    getParticipants(trip.id).then(
      (participants) => { if (active) setParticipantsResult({ participants, reloadCount }); },
      (error) => { if (active) setParticipantsResult({ error, reloadCount }); },
    );
    return () => { active = false; };
  }, [trip.id, reloadCount, retryCount]);

  function retry() {
    setParticipantsResult(null);
    setRetryCount(retryCount + 1);
  }

  const count = new Intl.NumberFormat(language).format(trip.current_participants);
  const disableActions = disabled || participantsResult?.reloadCount !== reloadCount;
  const canApproveRequests = trip.status === "open" && (!trip.trip_type || trip.trip_type === "Group");
  const isFull = trip.current_participants !== null && trip.current_participants >= trip.max_participants;

  return (
    <section className="trip-panel" id="trip-participants">
      <h2>{text.participants}</h2>
      {trip.current_participants !== null && <p>{text.currentParticipants} · <bdi>{count}</bdi></p>}
      {!participantsResult && <p role="status">{text.loading}</p>}
      {participantsResult?.error && <TripLoadError error={participantsResult.error} text={text} fallback="participants" onRetry={retry} />}
      {participantsResult?.participants?.length === 0 && <p>{text.noParticipants}</p>}
      {participantsResult?.participants?.length > 0 && (
        <ul className="trip-participants-list">
          {participantsResult.participants.map((participant) => (
            <li key={participant.id}>
              <div>
                <strong><bdi>{text.participant + " · " + participant.profile_id.slice(0, 8)}</bdi></strong>
                <p>{text.memberStatuses[participant.status]}</p>
                <time dateTime={participant.created_at}>{formatTripDate(participant.created_at, language)}</time>
              </div>
              <div className="trip-actions">
                {participant.status === "pending" && (
                  <>
                    <button className="trip-button" type="button" disabled={disableActions || !canApproveRequests || isFull}
                      onClick={() => onParticipantAction("approved", participant.id)}>{text.approve}</button>
                    <button className="trip-button trip-secondary" type="button" disabled={disableActions}
                      onClick={() => onParticipantAction("rejected", participant.id)}>{text.reject}</button>
                  </>
                )}
                {participant.status !== "pending" && (
                  <button className="trip-button trip-secondary" type="button" disabled={disableActions}
                    onClick={() => onParticipantAction("removed", participant.id)}>{text.remove}</button>
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
