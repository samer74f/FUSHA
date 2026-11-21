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
  const [requestNumber, setRequestNumber] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;

    getTrip(tripId, userId).then(
      (trip) => { if (active) setResult({ trip, userId }); },
      (error) => { if (active) setResult({ error, userId }); },
    );

    return () => { active = false; };
  }, [requestNumber, tripId, userId]);

  function retry() {
    setResult(null);
    setRequestNumber(requestNumber + 1);
  }

  async function handleEditTrip(values) {
    if (!user || user.id !== result?.trip?.organizer_id) throw new Error("trip_sign_in_required");
    await updateTrip(tripId, values);
    navigate(detailsPath, { replace: true, state: { notice: "updated" } });
  }

  const ready = result && result.userId === userId;

  return (
    <section className="create-trip-page trip-panel">
      <h1>{text.edit}</h1>
      {user === null && <TripSignIn text={text} loginPath={loginPath} backTo={detailsPath} />}
      {(user === undefined || (user && !ready)) && <p role="status">{text.loading}</p>}
      {user && ready && (
        result.error ? <TripLoadError error={result.error} text={text} fallback="trip" onRetry={retry} />
          : result.trip?.organizer_id === userId
            ? <TripForm key={userId} trip={result.trip} text={text} typeSupported={result.trip.typeSupported}
                onSave={handleEditTrip} cancelTo={detailsPath} />
            : <>
                <p role="alert">{result.trip ? text.ownerOnly : text.notFound}</p>
                <Link className="trip-button trip-secondary" to={result.trip ? detailsPath : "/trips"}>{text.cancel}</Link>
              </>
      )}
    </section>
  );
}

export default EditTrip;
