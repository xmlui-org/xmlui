function getSection(contact) {
  if (contact.reviewCompleted) return "Completed";
  if (!contact.reviewDueDate) return "No Due Date";
  if (isToday(contact.reviewDueDate)) return "Today";
  return getDate(contact.reviewDueDate) < getDate() ? "Overdue" : "Upcoming";
}

function loading(contacts, count) {
  return contacts.inProgress ? "loading..." : count;
}
