import { TripSignIn } from "./TripMessages";

function JoinTrip({ trip, user, participation, text, loginPath, disabled, onRequest, onRemove }) {
  if (participation) {
    const { status, id } = participation;
    return (
      <>
        <p role="status">{text.memberStatuses[status]}</p>
        {status === "pending" && (
          <button className="trip-button trip-secondary" type="button" onClick={() => onRemove("withdrawn", id)}
            disabled={disabled}>{text.withdraw}</button>
        )}
        {status === "approved" && (
          <button className="trip-button trip-secondary" type="button" onClick={() => onRemove("left", id)}
            disabled={disabled}>{text.leave}</button>
        )}
      </>
    );
  }
  if (trip.trip_type && trip.trip_type !== "Group") return null;
  if (trip.status === "full" || (trip.current_participants !== null && trip.current_participants >= trip.max_participants)) {
    return <p>{text.full}</p>;
  }
  if (trip.status !== "open") return <p>{text.closed}</p>;
  if (!user) return <TripSignIn text={text} loginPath={loginPath} joining />;

  return <button className="trip-button" type="button" onClick={onRequest} disabled={disabled}>{text.requestJoin}</button>;
}

export default JoinTrip;
