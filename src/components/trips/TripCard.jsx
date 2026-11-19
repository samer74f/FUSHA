import "./TripCard.css";

function TripCard({ trip, onViewDetails }) {
  return (
    <article className="trip-card">
      <h2>{trip.title}</h2>

      <p>Location: {trip.location}</p>
      <p>Date: {trip.date}</p>
      <p>Trip Type: {trip.tripType}</p>
      <p>Participants: {trip.participants}</p>

      <button onClick={() => onViewDetails(trip)}>
        View Details
      </button>
    </article>
  );
}

export default TripCard;