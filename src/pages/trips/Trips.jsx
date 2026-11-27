import { useEffect, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useInRouterContext, useLocation } from "react-router-dom";
import TripCard from "../../components/trips/TripCard";
import TripFilters from "../../components/trips/TripFilters";
import { TripLoadError } from "../../components/trips/TripMessages";
import { tripText } from "../../components/trips/tripText";
import { applyLanguage, getSavedLanguage } from "../../services/languagePreferences";
import { getTrips } from "../../services/tripService";
import { tripSupabase } from "../../services/tripSupabaseClient";
import CreateTrip from "./CreateTrip";
import EditTrip from "./EditTrip";
import TripDetails from "./TripDetails";
import "./Trips.css";

function TripList({ text, language, user }) {
  const location = useLocation();
  const userId = user?.id;
  const sessionLoading = user === undefined;
  const [tripsResult, setTripsResult] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    if (sessionLoading) return;
    let active = true;
    getTrips(userId).then(
      (trips) => { if (active) setTripsResult({ trips, userId }); },
      (error) => { if (active) setTripsResult({ error, userId }); },
    );
    return () => { active = false; };
  }, [retryCount, sessionLoading, userId]);

  function retry() {
    setTripsResult(null);
    setRetryCount(retryCount + 1);
  }

  const searchTerm = search.trim().toLocaleLowerCase(language);
  const currentTripsResult = tripsResult?.userId === userId ? tripsResult : null;
  const trips = currentTripsResult?.trips ?? [];
  const visibleTrips = trips.filter((trip) => (
    (!type || trip.trip_type === type)
    && [trip.title, trip.location ?? ""].some((value) => value.toLocaleLowerCase(language).includes(searchTerm))
  ));

  return (
    <>
      <header className="trips-header">
        <h1>{text.explore}</h1>
        <Link className="trip-button" to="/trips/new">{text.create}</Link>
      </header>

      {location.state?.notice && <p className="trip-message trip-success" role="status">{text[location.state.notice]}</p>}
      <TripFilters text={text} search={search} type={type} onSearch={setSearch} onType={setType}
        showType={trips.some((trip) => trip.typeSupported)} />

      {!currentTripsResult && <p className="trip-panel" role="status">{text.loading}</p>}
      {currentTripsResult?.error && <TripLoadError error={currentTripsResult.error} text={text} fallback="load" onRetry={retry} />}
      {currentTripsResult?.trips && visibleTrips.length === 0 && <p className="trip-panel">{trips.length ? text.noMatches : text.empty}</p>}
      <div className="trips-list">
        {visibleTrips.map((trip) => <TripCard key={trip.id} trip={trip} text={text} language={language} />)}
      </div>
    </>
  );
}

function TripsSection({ language, loginPath, onLanguageChange }) {
  const location = useLocation();
  const [user, setUser] = useState(tripSupabase ? undefined : null);

  useEffect(() => {
    if (!tripSupabase) return;
    const { data } = tripSupabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const text = tripText[language];
  const nextLanguage = language === "ar" ? "en" : "ar";
  const pageProps = { text, language, user, loginPath };

  return (
    <section className="trips-page" lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="trips-content">
        <div className="trip-toolbar">
          <Link className="trip-brand" to="/trips">{language === "ar" ? "فُسحة" : "FUSHA"}</Link>
          {onLanguageChange && (
            <button className="trip-button trip-secondary" type="button" lang={nextLanguage}
              onClick={() => onLanguageChange(nextLanguage)}>{text.switchLanguage}</button>
          )}
        </div>
        <Routes key={location.pathname}>
          <Route index element={<TripList {...pageProps} />} />
          <Route path="new" element={<CreateTrip {...pageProps} />} />
          <Route path=":tripId" element={<TripDetails {...pageProps} />} />
          <Route path=":tripId/edit" element={<EditTrip {...pageProps} />} />
          <Route path="*" element={<Navigate to="/trips" replace />} />
        </Routes>
      </div>
    </section>
  );
}

function Trips({ loginPath, language: siteLanguage }) {
  const hasRouter = useInRouterContext();
  const [language, setLanguage] = useState(getSavedLanguage);

  useEffect(() => {
    if (!siteLanguage) applyLanguage(language);
  }, [language, siteLanguage]);

  const section = (
    <TripsSection
      loginPath={loginPath}
      language={siteLanguage ?? language}
      onLanguageChange={siteLanguage ? undefined : setLanguage}
    />
  );

  if (hasRouter) return section;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/trips/*" element={section} />
        <Route path="*" element={<Navigate to="/trips" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Trips;
