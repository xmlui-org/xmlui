function getSection(contact) {
  if (contact.reviewCompleted) return "Completed";
  if (!contact.reviewDueDate) return "No Due Date";
  if (isToday(contact.reviewDueDate)) return "Today";
  return getDate(contact.reviewDueDate) < getDate() ? "Overdue" : "Upcoming";
}

var allContacts = contacts.value.filter((t) => true);
var overdueContacts = contacts.value.filter((t) => getSection(t) === "Overdue");
var todayContacts = contacts.value.filter((t) => getSection(t) === "Today");
var upcomingContacts = contacts.value.filter(
  (t) => getSection(t) === "Upcoming"
);
var completedContacts = contacts.value.filter(
  (t) => getSection(t) === "Completed"
);

function countLabel(cat) {
  return contactCounts.inProgress ? "loading..." : contactCounts.value[cat];
}
