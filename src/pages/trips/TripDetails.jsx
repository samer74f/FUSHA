import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import JoinTrip from "../../components/trips/JoinTrip";
import TripBudget from "../../components/trips/TripBudget";
import { TripLoadError } from "../../components/trips/TripMessages";
import TripParticipants from "../../components/trips/TripParticipants";
import { formatTripDate, getActionErrorMessage } from "../../components/trips/tripText";
import {
  deleteTrip, getMyParticipation, getTrip, removeParticipant, requestToJoinTrip, updateParticipantStatus,
} from "../../services/tripService";

function TripDetails({ user, text, language, loginPath }) {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = user?.id;
  const sessionLoading = user === undefined;
  const [tripResult, setTripResult] = useState(null);
  const [membershipResult, setMembershipResult] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [notice, setNotice] = useState(location.state?.notice);

  useEffect(() => {
    if (sessionLoading) return;
    let active = true;
    getTrip(tripId, userId).then(
      (trip) => { if (active) setTripResult({ trip, reloadCount, userId }); },
      (error) => { if (active) setTripResult({ error, reloadCount, userId }); },
    );
    return () => { active = false; };
  }, [reloadCount, sessionLoading, tripId, userId]);

  // Hide private trip data from a previous session when the active user changes.
  const currentTripResult = tripResult?.userId === userId ? tripResult : null;
  const trip = currentTripResult?.trip;
  const isOwner = Boolean(userId && trip?.organizer_id === userId);
  const shouldLoadMembership = Boolean(trip && userId && !isOwner);

  useEffect(() => {
    if (!shouldLoadMembership) return;
    let active = true;
    getMyParticipation(tripId, userId).then(
      (participation) => { if (active) setMembershipResult({ participation, userId, reloadCount }); },
      (error) => { if (active) setMembershipResult({ error, userId, reloadCount }); },
    );
    return () => { active = false; };
  }, [shouldLoadMembership, reloadCount, tripId, userId]);

  const hasCurrentMembershipResult = membershipResult?.userId === userId && membershipResult?.reloadCount === reloadCount;
  const isLoadingOrSaving = isSaving || currentTripResult?.reloadCount !== reloadCount;

  function reloadDetails() {
    // The new count reloads the details and the participants panel together.
    setReloadCount((previous) => previous + 1);
  }

  async function handleParticipantAction(action, participantId) {
    if (isLoadingOrSaving || !userId) return;
    if (["approved", "rejected", "removed"].includes(action) && !isOwner) return;
    if (action === "removed" && !window.confirm(text.confirmRemove)) return;

    setIsSaving(true);
    setActionError(null);
    setNotice(null);
    try {
      if (action === "requested") await requestToJoinTrip(tripId, userId);
      else if (action === "approved" || action === "rejected") {
        await updateParticipantStatus(tripId, participantId, action);
      } else {
        const expectedStatus = { withdrawn: "pending", left: "approved" }[action];
        await removeParticipant(tripId, participantId, expectedStatus);
      }
      setNotice(action);
    } catch (error) {
      setActionError(error);
    } finally {
      reloadDetails();
      setIsSaving(false);
    }
  }

  async function handleDeleteTrip() {
    if (!isOwner || isLoadingOrSaving || !window.confirm(text.confirmDelete)) return;

    setIsSaving(true);
    setActionError(null);
    setNotice(null);
    try {
      await deleteTrip(tripId);
      navigate("/trips", { replace: true, state: { notice: "deleted" } });
    } catch (error) {
      setActionError(error);
    } finally {
      setIsSaving(false);
    }
  }

  const numberFormatter = new Intl.NumberFormat(language);
  const backLink = <Link className="trip-back" to="/trips">{text.back}</Link>;

  if (!trip) {
    return (
      <section className="trip-panel">
        {backLink}
        {isLoadingOrSaving && <p role="status">{text.loading}</p>}
        {!isLoadingOrSaving && currentTripResult?.error && (
          <TripLoadError error={currentTripResult.error} text={text} fallback="trip" onRetry={reloadDetails} />
        )}
        {!isLoadingOrSaving && !currentTripResult?.error && <p role="alert">{text.notFound}</p>}
      </section>
    );
  }

  const hasApprovedCount = trip.current_participants !== null;
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
          <div><dt>{text.maxParticipants}</dt><dd>{numberFormatter.format(trip.max_participants)}</dd></div>
          <div><dt>{text.currentParticipants}</dt><dd>{hasApprovedCount ? numberFormatter.format(trip.current_participants) : text.countUnavailable}</dd></div>
          <div><dt>{text.available}</dt><dd>{hasApprovedCount ? numberFormatter.format(trip.max_participants - trip.current_participants) : text.countUnavailable}</dd></div>
        </dl>
        <h2>{text.description}</h2>
        <p className="trip-description" dir="auto">{trip.description || text.noDescription}</p>

        {notice && <p className="trip-message trip-success" role="status">{text[notice]}</p>}
        {actionError && <p className="trip-message trip-error" role="alert">{getActionErrorMessage(actionError, text, "action")}</p>}
        {(isLoadingOrSaving || (shouldLoadMembership && !hasCurrentMembershipResult)) && <p role="status">{text.working}</p>}
        {shouldLoadMembership && hasCurrentMembershipResult && membershipResult.error && (
          <TripLoadError error={membershipResult.error} text={text} fallback="membership" onRetry={reloadDetails} />
        )}

        <div className="trip-actions">
          {isOwner && (
            <>
              {!isLoadingOrSaving && <Link className="trip-button" to={"/trips/" + tripId + "/edit"}>{text.edit}</Link>}
              <button className="trip-button trip-secondary" type="button" aria-expanded={showParticipants}
                onClick={() => setShowParticipants(!showParticipants)} disabled={isLoadingOrSaving}>
                {showParticipants ? text.hideParticipants : text.manage}
              </button>
              <button className="trip-button trip-danger" type="button" onClick={handleDeleteTrip} disabled={isLoadingOrSaving}>{text.delete}</button>
            </>
          )}
          {user !== undefined && !isOwner && (!shouldLoadMembership || (hasCurrentMembershipResult && !membershipResult.error)) && (
            <JoinTrip trip={trip} user={user} participation={shouldLoadMembership ? membershipResult.participation : null} text={text}
              loginPath={loginPath} disabled={isLoadingOrSaving} onRequest={() => handleParticipantAction("requested")}
              onRemove={handleParticipantAction} />
          )}
        </div>
      </section>

      {isOwner && showParticipants && (
        <TripParticipants trip={trip} text={text} language={language} reloadCount={reloadCount}
          disabled={isLoadingOrSaving} onParticipantAction={handleParticipantAction} />
      )}
      <TripBudget approvedParticipantCount={trip.current_participants} text={text} language={language} />
    </div>
  );
}

export default TripDetails;
