function EditTrip({ trip, onSave, onCancel }) {
  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    const updatedTrip = {
      ...trip,
      title: formData.get("title"),
      location: formData.get("location"),
      date: formData.get("date"),
      tripType: formData.get("tripType"),
      participants: formData.get("participants"),
      description: formData.get("description"),
    };

    onSave(updatedTrip);
  }

  return (
    <main className="create-trip-page">
      <header className="create-trip-header">
        <h1>Edit Trip</h1>
        <p>Update your trip information.</p>
      </header>

      <form className="trip-form" onSubmit={handleSubmit}>
        <label htmlFor="title">Trip Title</label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={trip.title}
          required
        />

        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          name="location"
          defaultValue={trip.location}
          required
        />

        <label htmlFor="date">Trip Date</label>
        <input
          type="date"
          id="date"
          name="date"
          defaultValue={trip.date}
          required
        />

        <label htmlFor="tripType">Trip Type</label>
        <select
          id="tripType"
          name="tripType"
          defaultValue={trip.tripType}
          required
        >
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
          defaultValue={trip.participants}
          required
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          defaultValue={trip.description}
          rows="4"
        />

        <section className="form-buttons">
          <button type="submit">Save Changes</button>

          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </section>
      </form>
    </main>
  );
}

export default EditTrip;