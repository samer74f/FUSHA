import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import JoinTrip from "../../components/trips/JoinTrip";
import TripBudget from "../../components/trips/TripBudget";
import { TripLoadError } from "../../components/trips/TripMessages";
import TripParticipants from "../../components/trips/TripParticipants";
import { formatTripDate, getActionError } from "../../components/trips/tripText";
import {
  deleteTrip, getMyParticipation, getTrip, removeParticipant, requestTrip, updateParticipantStatus,
} from "../../services/tripService";

function TripDetails({ user, text, language, loginPath }) {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = user?.id;
  const sessionLoading = user === undefined;
  const [tripResult, setTripResult] = useState(null);
  const [membership, setMembership] = useState(null);
  const [requestNumber, setRequestNumber] = useState(0);
  const [manageParticipants, setManageParticipants] = useState(false);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [notice, setNotice] = useState(location.state?.notice);

  useEffect(() => {
    if (sessionLoading) return;
    let active = true;
    getTrip(tripId, userId).then(
      (trip) => { if (active) setTripResult({ trip, requestNumber, userId }); },
      (error) => { if (active) setTripResult({ error, requestNumber, userId }); },
    );
    return () => { active = false; };
  }, [requestNumber, sessionLoading, tripId, userId]);

  const activeTripResult = tripResult?.userId === userId ? tripResult : null;
  const trip = activeTripResult?.trip;
  const isOwner = Boolean(userId && trip?.organizer_id === userId);
  const checkMembership = Boolean(trip && userId && !isOwner);

  useEffect(() => {
    if (!checkMembership) return;
    let active = true;
    getMyParticipation(tripId, userId).then(
      (participation) => { if (active) setMembership({ participation, userId, requestNumber }); },
      (error) => { if (active) setMembership({ error, userId, requestNumber }); },
    );
    return () => { active = false; };
  }, [checkMembership, requestNumber, tripId, userId]);

  const membershipReady = membership?.userId === userId && membership?.requestNumber === requestNumber;
  const busy = pending || activeTripResult?.requestNumber !== requestNumber;

  function reloadDetails() {
    setRequestNumber((previous) => previous + 1);
  }

  async function handleMembershipChange(change, participantId) {
    if (busy || !userId) return;
    if (["approved", "rejected", "removed"].includes(change) && !isOwner) return;
    if (change === "removed" && !window.confirm(text.confirmRemove)) return;

    setPending(true);
    setActionError(null);
    setNotice(null);
    try {
      if (change === "requested") await requestTrip(tripId, userId);
      else if (change === "approved" || change === "rejected") {
        await updateParticipantStatus(tripId, participantId, change);
      } else {
        await removeParticipant(tripId, participantId);
      }
      setNotice(change);
    } catch (error) {
      setActionError(error);
    } finally {
      reloadDetails();
      setPending(false);
    }
  }

  async function handleDeleteTrip() {
    if (!isOwner || busy || !window.confirm(text.confirmDelete)) return;

    setPending(true);
    setActionError(null);
    setNotice(null);
    try {
      await deleteTrip(tripId);
      navigate("/trips", { replace: true, state: { notice: "deleted" } });
    } catch (error) {
      setActionError(error);
    } finally {
      setPending(false);
    }
  }

  const number = new Intl.NumberFormat(language);
  const backLink = <Link className="trip-back" to="/trips">{text.back}</Link>;

  if (!trip) {
    return (
      <section className="trip-panel">
        {backLink}
        {busy && <p role="status">{text.loading}</p>}
        {!busy && activeTripResult?.error && (
          <TripLoadError error={activeTripResult.error} text={text} fallback="trip" onRetry={reloadDetails} />
        )}
        {!busy && !activeTripResult?.error && <p role="alert">{text.notFound}</p>}
      </section>
    );
  }

  const hasCount = trip.current_participants !== null;
  const organizer = isOwner ? text.you : text.organizer + " · " + trip.organizer_id.slice(0, 8);

  return (
    <div className="trip-details-page">
      {backLink}
      <section className="trip-panel">
        <span className="trip-type">{text.tripStatuses[trip.status]}</span>
        <h1 dir="auto">{trip.title}</h1>
        <dl className="trip-facts">
          <div><dt>{text.location}</dt><dd><bdi>{trip.location ?? text.unspecified}</bdi></dd></div>
          <div><dt>{text.starts}</dt><dd><time dateTime={trip.starts_at}>{formatTripDate(trip.starts_at, language)}</time></dd></div>
          <div><dt>{text.ends}</dt><dd><time dateTime={trip.ends_at}>{formatTripDate(trip.ends_at, language)}</time></dd></div>
          <div><dt>{text.type}</dt><dd>{text.types[trip.trip_type] ?? text.unspecified}</dd></div>
          <div><dt>{text.organizer}</dt><dd><bdi>{organizer}</bdi></dd></div>
          <div><dt>{text.maxParticipants}</dt><dd>{number.format(trip.max_participants)}</dd></div>
          <div><dt>{text.currentParticipants}</dt><dd>{hasCount ? number.format(trip.current_participants) : text.countUnavailable}</dd></div>
          <div><dt>{text.available}</dt><dd>{hasCount ? number.format(trip.max_participants - trip.current_participants) : text.countUnavailable}</dd></div>
        </dl>
        <h2>{text.description}</h2>
        <p className="trip-description" dir="auto">{trip.description || text.noDescription}</p>

        {notice && <p className="trip-message trip-success" role="status">{text[notice]}</p>}
        {actionError && <p className="trip-message trip-error" role="alert">{getActionError(actionError, text, "action")}</p>}
        {(busy || (checkMembership && !membershipReady)) && <p role="status">{text.working}</p>}
        {checkMembership && membershipReady && membership.error && (
          <TripLoadError error={membership.error} text={text} fallback="membership" onRetry={reloadDetails} />
        )}

        <div className="trip-actions">
          {isOwner && (
            <>
              {!busy && <Link className="trip-button" to={"/trips/" + tripId + "/edit"}>{text.edit}</Link>}
              <button className="trip-button trip-secondary" type="button" aria-expanded={manageParticipants}
                onClick={() => setManageParticipants(!manageParticipants)} disabled={busy}>
                {manageParticipants ? text.hideParticipants : text.manage}
              </button>
              <button className="trip-button trip-danger" type="button" onClick={handleDeleteTrip} disabled={busy}>{text.delete}</button>
            </>
          )}
          {user !== undefined && !isOwner && (!checkMembership || (membershipReady && !membership.error)) && (
            <JoinTrip trip={trip} user={user} participation={checkMembership ? membership.participation : null} text={text}
              loginPath={loginPath} disabled={busy} onRequest={() => handleMembershipChange("requested")}
              onRemove={handleMembershipChange} />
          )}
        </div>
      </section>

      {isOwner && manageParticipants && (
        <TripParticipants trip={trip} text={text} language={language} requestNumber={requestNumber}
          disabled={busy} onChange={handleMembershipChange} />
      )}
      <TripBudget participants={trip.current_participants} text={text} language={language} />
    </div>
  );
}

export default TripDetails;
