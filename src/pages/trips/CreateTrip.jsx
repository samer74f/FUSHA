import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TripForm from "../../components/trips/TripForm";
import { TripLoadError, TripSignIn } from "../../components/trips/TripMessages";
import { createTrip, getTripTypeSupport } from "../../services/tripService";

function CreateTrip({ user, text, loginPath }) {
  const navigate = useNavigate();
  const userId = user?.id;
  const [schema, setSchema] = useState(null);
  const [requestNumber, setRequestNumber] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    getTripTypeSupport().then(
      (typeSupported) => { if (active) setSchema({ typeSupported }); },
      (error) => { if (active) setSchema({ error }); },
    );
    return () => { active = false; };
  }, [requestNumber, userId]);

  async function handleCreateTrip(values) {
    if (!user) throw new Error("trip_sign_in_required");
    await createTrip(values, user.id);
    navigate("/trips", { replace: true, state: { notice: "created" } });
  }

  function retry() {
    setSchema(null);
    setRequestNumber(requestNumber + 1);
  }

  return (
    <section className="create-trip-page trip-panel">
      <h1>{text.create}</h1>
      {(user === undefined || (user && !schema)) && <p role="status">{text.loading}</p>}
      {user === null && <TripSignIn text={text} loginPath={loginPath} backTo="/trips" />}
      {user && schema?.error && <TripLoadError error={schema.error} text={text} fallback="load" onRetry={retry} />}
      {user && schema && !schema.error && (
        <TripForm text={text} typeSupported={schema.typeSupported} onSave={handleCreateTrip} cancelTo="/trips" />
      )}
    </section>
  );
}

export default CreateTrip;
