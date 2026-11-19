import { useState } from "react";
import TripCard from "../../components/trips/TripCard";
import CreateTrip from "./CreateTrip";
import TripDetails from "./TripDetails";
import "./Trips.css";
import EditTrip from "./EditTrip";
function Trips() {
  const [trips, setTrips] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  function handleCreateTrip(newTrip) {
    setTrips([...trips, newTrip]);
    setShowCreateForm(false);
  }

  function handleViewDetails(trip) {
    setSelectedTrip(trip);
  }

  function handleBack() {
    setSelectedTrip(null);
  }

  function handleCancelCreate() {
    setShowCreateForm(false);
  }

  return (
    <main className="trips-page">
      {selectedTrip ? (
        <TripDetails trip={selectedTrip} onBack={handleBack} />
      ) : showCreateForm ? (
        <CreateTrip
          onCreateTrip={handleCreateTrip}
          onCancel={handleCancelCreate}
        />
      ) : (
        <>
          <header className="trips-header">
            <section>
              <h1>Explore Trips</h1>
              <p>Discover new adventures and plan your next journey.</p>
            </section>

            <button onClick={() => setShowCreateForm(true)}>
              Create Trip
            </button>
          </header>

          <section className="trips-list">
            {trips.length === 0 ? (
              <section className="empty-message">
                <h2>No Trips Available</h2>
                <p>Be the first to create an adventure!</p>
              </section>
            ) : (
              trips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onViewDetails={handleViewDetails}
                />
              ))
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default Trips;