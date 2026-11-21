import { tripSupabase } from "./tripSupabaseClient";

const tripColumns = "id,title,description,starts_at,ends_at,meeting_point,organizer_id,capacity,status";
const participantColumns = "id,profile_id,status,created_at";
const pageSize = 100;
let tripTypeSupport;
let approvedCountsRpcMissing = false;

function getClient() {
  if (!tripSupabase) throw new Error("trip_not_configured");
  return tripSupabase;
}

async function readData(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function readPages(makeQuery) {
  const rows = [];

  for (let start = 0; ; start += pageSize) {
    const page = await readData(makeQuery().range(start, start + pageSize - 1));
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

export async function getTripTypeSupport() {
  if (tripTypeSupport !== undefined) return tripTypeSupport;

  try {
    await readData(getClient().from("trips").select("trip_type").limit(0));
    tripTypeSupport = true;
  } catch (error) {
    if (error.code !== "42703" && error.code !== "PGRST204") throw error;
    tripTypeSupport = false;
  }

  return tripTypeSupport;
}

async function getApprovedCounts(trips) {
  const counts = new Map();
  if (approvedCountsRpcMissing) return counts;

  for (let start = 0; start < trips.length; start += pageSize) {
    const tripIds = trips.slice(start, start + pageSize).map((trip) => trip.id);
    const { data, error } = await getClient().rpc("get_trip_approved_counts", { p_trip_ids: tripIds });
    if (error?.code === "PGRST202" || error?.code === "42883") {
      approvedCountsRpcMissing = true;
      break;
    }
    if (error?.code === "42501") break;
    if (error) throw error;

    for (const row of data ?? []) {
      const count = Number(row.approved_count);
      if (row.approved_count != null && Number.isSafeInteger(count) && count >= 0) {
        counts.set(row.trip_id, count);
      }
    }
  }

  return counts;
}

async function getOrganizerApprovedCount(tripId) {
  const { count, error } = await getClient().from("trip_participants")
    .select("id", { count: "exact", head: true })
    .eq("trip_id", tripId).eq("status", "approved");
  if (error) throw error;
  return count ?? null;
}

async function toTripViews(trips, userId, typeSupported) {
  const counts = await getApprovedCounts(trips);

  return Promise.all(trips.map(async (trip) => {
    let currentParticipants = counts.get(trip.id) ?? null;
    if (currentParticipants === null && userId && trip.organizer_id === userId) {
      currentParticipants = await getOrganizerApprovedCount(trip.id);
    }

    return {
      id: trip.id,
      title: trip.title,
      description: trip.description,
      starts_at: trip.starts_at,
      ends_at: trip.ends_at,
      location: trip.meeting_point ?? null,
      organizer_id: trip.organizer_id,
      max_participants: trip.capacity,
      trip_type: typeSupported ? trip.trip_type ?? null : null,
      typeSupported,
      status: trip.status,
      current_participants: currentParticipants,
    };
  }));
}

export async function getTrips(userId) {
  const typeSupported = await getTripTypeSupport();
  const columns = typeSupported ? `${tripColumns},trip_type` : tripColumns;
  const trips = await readPages(() => getClient().from("trips").select(columns).order("starts_at").order("id"));
  return toTripViews(trips, userId, typeSupported);
}

export async function getTrip(tripId, userId) {
  const uuidPattern = /^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i;
  if (!uuidPattern.test(tripId)) return null;

  const typeSupported = await getTripTypeSupport();
  const columns = typeSupported ? `${tripColumns},trip_type` : tripColumns;
  const trip = await readData(getClient().from("trips").select(columns).eq("id", tripId).maybeSingle());
  if (!trip) return null;

  const [view] = await toTripViews([trip], userId, typeSupported);
  return view;
}

async function toTripValues(values) {
  const fields = {
    title: values.title,
    description: values.description,
    starts_at: values.starts_at,
    ends_at: values.ends_at,
    meeting_point: values.location,
    capacity: values.max_participants,
  };
  if (values.trip_type !== undefined && await getTripTypeSupport()) fields.trip_type = values.trip_type;
  return fields;
}

export async function createTrip(values, userId) {
  const fields = await toTripValues(values);
  return readData(getClient().from("trips").insert({ ...fields, organizer_id: userId, status: "open" })
    .select("id").single());
}

export async function updateTrip(tripId, values) {
  const fields = await toTripValues(values);
  return readData(getClient().from("trips").update(fields).eq("id", tripId).select("id").single());
}

export async function deleteTrip(tripId) {
  return readData(getClient().from("trips").delete().eq("id", tripId).select("id").single());
}

export async function getMyParticipation(tripId, userId) {
  return readData(getClient().from("trip_participants").select(participantColumns)
    .eq("trip_id", tripId).eq("profile_id", userId).maybeSingle());
}

export async function getParticipants(tripId) {
  return readPages(() => getClient().from("trip_participants").select(participantColumns)
    .eq("trip_id", tripId).order("created_at").order("id"));
}

export async function requestTrip(tripId, userId) {
  return readData(getClient().from("trip_participants")
    .insert({ trip_id: tripId, profile_id: userId, status: "pending" }).select(participantColumns).single());
}

export async function updateParticipantStatus(tripId, participantId, status) {
  if (status !== "approved" && status !== "rejected") throw new Error("trip_invalid_participant_status");

  return readData(getClient().from("trip_participants").update({ status })
    .eq("trip_id", tripId).eq("id", participantId).eq("status", "pending").select(participantColumns).single());
}

export async function removeParticipant(tripId, participantId) {
  return readData(getClient().from("trip_participants").delete()
    .eq("trip_id", tripId).eq("id", participantId).select("id").single());
}
