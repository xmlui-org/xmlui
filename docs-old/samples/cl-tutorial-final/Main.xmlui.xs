function getSection(contact) {
  if (contact.reviewCompleted) return "Completed";
  if (!contact.reviewDueDate) return "No Due Date";
  if (isToday(contact.reviewDueDate)) return "Today";
  return getDate(contact.reviewDueDate) < getDate() ? "Overdue" : "Upcoming";
}

function filterBySection(contacts, section) {
  return contacts.filter((contact) => getSection(contact) === section);
}

var allContacts = contactsDs.value;
var overdueContacts = filterBySection(allContacts, "Overdue");
var todayContacts = filterBySection(allContacts, "Today");
var upcomingContacts = filterBySection(allContacts, "Upcoming");
var completedContacts = filterBySection(allContacts, "Completed");

function countLabel(cat) { 
  return contactCounts.inProgress ? "loading..." : contactCounts.value[cat];
}