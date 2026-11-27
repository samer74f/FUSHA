export const tripTypes = ["Individual", "Family", "Group"];

export const tripText = {
  explore: "Explore trips",
  create: "Create trip",
  details: "View details",
  back: "Back to trips",
  title: "Trip title",
  location: "Meeting point",
  starts: "Starts",
  ends: "Ends",
  localTime: "local time",
  type: "Trip type",
  chooseType: "Select a trip type",
  types: { Individual: "Individual", Family: "Family", Group: "Group" },
  typePending: "Trip types will be available once the team enables them.",
  unspecified: "Unspecified",
  tripStatuses: { draft: "Draft", open: "Open", full: "Full", cancelled: "Cancelled", completed: "Completed" },
  memberStatuses: { pending: "Pending", approved: "Approved", rejected: "Rejected", cancelled: "Cancelled" },
  description: "Description",
  noDescription: "No description provided.",
  optional: "optional",
  organizer: "Organizer",
  you: "You",
  participant: "Participant",
  participants: "Participants",
  maxParticipants: "Participant capacity",
  currentParticipants: "Approved participants",
  available: "Spots left",
  countUnavailable: "Count unavailable",
  edit: "Edit trip",
  save: "Save changes",
  cancel: "Cancel",
  delete: "Delete trip",
  confirmDelete: "Permanently delete this trip and its participant list?",
  confirmRemove: "Remove this participant from the trip?",
  requestJoin: "Request to join",
  withdraw: "Cancel request",
  approve: "Approve",
  reject: "Reject",
  leave: "Leave trip",
  full: "This trip is full.",
  closed: "Joining has closed for this trip.",
  manage: "Manage participants",
  hideParticipants: "Hide participants",
  noParticipants: "There are no requests or participants yet.",
  remove: "Remove",
  search: "Search trips",
  searchHint: "Search by title or location",
  allTypes: "All types",
  empty: "No trips available yet.",
  noMatches: "No trips match these filters.",
  loading: "Loading…",
  working: "Please wait…",
  retry: "Try again",
  notFound: "This trip could not be found.",
  signIn: "Sign in",
  signInToContinue: "Sign in to FUSHA to continue.",
  signInToJoin: "Sign in to request to join this trip.",
  ownerOnly: "Only the organizer can edit this trip.",
  invalidFields: "Check the title, meeting point and participant capacity.",
  invalidSchedule: "Enter a start time and a later end time.",
  invalidCapacity: "Capacity must be at least one and cover all approved participants.",
  created: "Trip created.",
  updated: "Trip updated.",
  deleted: "Trip deleted.",
  requested: "Request sent to the organizer.",
  approved: "Request approved.",
  rejected: "Request rejected.",
  withdrawn: "Request cancelled.",
  left: "You left the trip.",
  removed: "Participant removed.",
  budget: "Trip budget",
  transport: "Transportation",
  food: "Food",
  equipment: "Equipment",
  other: "Other expenses",
  total: "Total budget",
  perPerson: "Cost per person",
  budgetHint: "Uses approved participants plus the organizer for the split. Amounts stay on this page.",
  invalidBudget: "Enter non-negative amounts with at most two decimal places.",
  errors: {
    config: "Supabase connection settings are missing or invalid.",
    schema: "The trip tables or database functions are not available yet.",
    load: "Could not load trips. Try again.",
    trip: "Could not load trip details. Try again.",
    participants: "Could not load participants. Try again.",
    membership: "Could not check your participation. Try again.",
    save: "Could not save the trip. Try again.",
    action: "Could not complete this action. Try again.",
    access: "Your session or permissions do not allow this action.",
    alreadyRequested: "You already have a request for this trip.",
    participationChanged: "Participation changed. Check the current status before trying again.",
    profileRequired: "Set up your FUSHA profile to use this feature.",
  },
};

export function formatTripDate(date, language) {
  return new Intl.DateTimeFormat(language, { dateStyle: "medium", timeStyle: "short" })
    .format(new Date(date));
}

export function getTripErrorKey(error, fallback) {
  if (error.message === "trip_not_configured") return "config";
  if (["PGRST202", "PGRST204", "PGRST205", "42P01", "42703"].includes(error.code)) return "schema";
  if (["42501", "PGRST116", "PGRST301", "PGRST303"].includes(error.code)) return "access";
  return fallback;
}

export function getActionErrorMessage(error, text, fallback) {
  switch (error.message) {
    case "Trip capacity has been reached": return text.full;
    case "Capacity cannot be lower than the approved participant count": return text.invalidCapacity;
    case "Trip does not exist": return text.notFound;
    case "trip_sign_in_required": return text.errors.access;
    case "trip_participation_changed": return text.errors.participationChanged;
  }

  if (error.code === "23505" && error.message.includes("trip_participants_trip_id_profile_id_key")) {
    return text.errors.alreadyRequested;
  }
  if (error.code === "23503" && /organizer_id_fkey|profile_id_fkey/.test(error.message)) {
    return text.errors.profileRequired;
  }
  if (error.code === "23514" && error.message.includes("trips_capacity_check")) return text.invalidCapacity;
  if (error.code === "23514" && error.message.includes('"trips_check"')) return text.invalidSchedule;
  return text.errors[getTripErrorKey(error, fallback)];
}
