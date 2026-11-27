import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import TripForm from "../../components/trips/TripForm";
import { TripLoadError, TripSignIn } from "../../components/trips/TripMessages";
import { getTrip, updateTrip } from "../../services/tripService";

function EditTrip({ user, text, loginPath }) {
  const { tripId } = useParams();
  const detailsPath = "/trips/" + tripId;
  const userId = user?.id;
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);
  const [tripResult, setTripResult] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;

    getTrip(tripId, userId).then(
      (trip) => { if (active) setTripResult({ trip, userId }); },
      (error) => { if (active) setTripResult({ error, userId }); },
    );

    return () => { active = false; };
  }, [retryCount, tripId, userId]);

  function retry() {
    setTripResult(null);
    setRetryCount(retryCount + 1);
  }

  async function handleEditTrip(values) {
    if (!user || user.id !== tripResult?.trip?.organizer_id) throw new Error("trip_sign_in_required");
    await updateTrip(tripId, values);
    navigate(detailsPath, { replace: true, state: { notice: "updated" } });
  }

  const hasTripResult = tripResult && tripResult.userId === userId;

  return (
    <section className="create-trip-page trip-panel">
      <h1>{text.edit}</h1>
      {user === null && <TripSignIn text={text} loginPath={loginPath} backTo={detailsPath} />}
      {(user === undefined || (user && !hasTripResult)) && <p role="status">{text.loading}</p>}
      {user && hasTripResult && (
        tripResult.error ? <TripLoadError error={tripResult.error} text={text} fallback="trip" onRetry={retry} />
          : tripResult.trip?.organizer_id === userId
            ? <TripForm key={userId} trip={tripResult.trip} text={text} typeSupported={tripResult.trip.typeSupported}
                onSave={handleEditTrip} cancelTo={detailsPath} />
            : <>
                <p role="alert">{tripResult.trip ? text.ownerOnly : text.notFound}</p>
                <Link className="trip-button trip-secondary" to={tripResult.trip ? detailsPath : "/trips"}>{text.cancel}</Link>
              </>
      )}
    </section>
  );
}

export default EditTrip;
