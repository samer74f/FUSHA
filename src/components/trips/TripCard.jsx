import { Link } from "react-router-dom";
import { formatTripDate } from "./tripText";
import "./TripCard.css";

function TripCard({ trip, text, language }) {
  const number = new Intl.NumberFormat(language);

  return (
    <article className="trip-card">
      <span className="trip-type">{text.tripStatuses[trip.status]}</span>
      <h2 dir="auto">{trip.title}</h2>
      {trip.trip_type && <p>{text.type} · {text.types[trip.trip_type]}</p>}
      <p>{text.location} · <bdi>{trip.location ?? text.unspecified}</bdi></p>
      <p><time dateTime={trip.starts_at}>{formatTripDate(trip.starts_at, language)}</time></p>
      {trip.current_participants === null
        ? <p>{text.maxParticipants} · {number.format(trip.max_participants)}</p>
        : <p>{text.currentParticipants} · <bdi>{number.format(trip.current_participants)} / {number.format(trip.max_participants)}</bdi></p>}
      <Link className="trip-button trip-secondary" to={"/trips/" + trip.id}>{text.details}</Link>
    </article>
  );
}

export default TripCard;
