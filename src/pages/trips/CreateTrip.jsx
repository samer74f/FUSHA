import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TripForm from "../../components/trips/TripForm";
import { TripLoadError, TripSignIn } from "../../components/trips/TripMessages";
import { createTrip, getTripTypeSupport } from "../../services/tripService";

function CreateTrip({ user, text, loginPath }) {
  const navigate = useNavigate();
  const userId = user?.id;
  const [tripTypeCheck, setTripTypeCheck] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    getTripTypeSupport().then(
      (typeSupported) => { if (active) setTripTypeCheck({ typeSupported }); },
      (error) => { if (active) setTripTypeCheck({ error }); },
    );
    return () => { active = false; };
  }, [retryCount, userId]);

  async function handleCreateTrip(values) {
    if (!user) throw new Error("trip_sign_in_required");
    await createTrip(values, user.id);
    navigate("/trips", { replace: true, state: { notice: "created" } });
  }

  function retry() {
    setTripTypeCheck(null);
    setRetryCount(retryCount + 1);
  }

  return (
    <section className="create-trip-page trip-panel">
      <h1>{text.create}</h1>
      {(user === undefined || (user && !tripTypeCheck)) && <p role="status">{text.loading}</p>}
      {user === null && <TripSignIn text={text} loginPath={loginPath} backTo="/trips" />}
      {user && tripTypeCheck?.error && <TripLoadError error={tripTypeCheck.error} text={text} fallback="load" onRetry={retry} />}
      {user && tripTypeCheck && !tripTypeCheck.error && (
        <TripForm text={text} typeSupported={tripTypeCheck.typeSupported} onSave={handleCreateTrip} cancelTo="/trips" />
      )}
    </section>
  );
}

export default CreateTrip;
