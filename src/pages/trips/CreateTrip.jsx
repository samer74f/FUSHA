import "./CreateTrip.css";

function CreateTrip({ onCreateTrip, onCancel }) {
  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    const newTrip = {
      id: Date.now(),
      title: formData.get("title"),
      location: formData.get("location"),
      date: formData.get("date"),
      tripType: formData.get("tripType"),
      participants: formData.get("participants"),
      description: formData.get("description"),
    };

    onCreateTrip(newTrip);
  }

  return (
    <main className="create-trip-page">
      <header className="create-trip-header">
        <h1>Create New Trip</h1>
        <p>Plan your next adventure with FUSHA.</p>
      </header>

      <form className="trip-form" onSubmit={handleSubmit}>
        <label htmlFor="title">Trip Title</label>
        <input
          type="text"
          id="title"
          name="title"
          placeholder="Enter trip title"
          required
        />

        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          name="location"
          placeholder="Enter trip location"
          required
        />

        <label htmlFor="date">Trip Date</label>
        <input type="date" id="date" name="date" required />

        <label htmlFor="tripType">Trip Type</label>
        <select id="tripType" name="tripType" required>
          <option value="">Select trip type</option>
          <option value="Individual">Individual</option>
          <option value="Family">Family</option>
          <option value="Group">Group</option>
        </select>

        <label htmlFor="participants">Participants</label>
        <input
          type="number"
          id="participants"
          name="participants"
          min="1"
          placeholder="Number of participants"
          required
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          placeholder="Describe your trip..."
          rows="4"
        />

        <section className="form-buttons">
          <button type="submit">Create Trip</button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </section>
      </form>
    </main>
  );
}

export default CreateTrip;