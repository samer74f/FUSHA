import { Link, useLocation } from "react-router-dom";
import { getTripErrorKey } from "./tripText";

export function TripLoadError({ error, text, fallback, onRetry }) {
  return (
    <div className="trip-message trip-error">
      <p role="alert">{text.errors[getTripErrorKey(error, fallback)]}</p>
      <button className="trip-button trip-secondary" type="button" onClick={onRetry}>{text.retry}</button>
    </div>
  );
}

export function TripSignIn({ text, loginPath, backTo, joining }) {
  const location = useLocation();

  return (
    <section className="trip-message">
      <p>{joining ? text.signInToJoin : text.signInToContinue}</p>
      <div className="trip-actions">
        {loginPath && <Link className="trip-button" to={loginPath} state={{ from: location }}>{text.signIn}</Link>}
        {backTo && <Link className="trip-button trip-secondary" to={backTo}>{text.cancel}</Link>}
      </div>
    </section>
  );
}
