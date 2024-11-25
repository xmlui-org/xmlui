function getSection(contact) {
  if (contact.reviewCompleted) return "Completed";
  if (!contact.reviewDueDate) return "No Due Date";
  if (isToday(contact.reviewDueDate)) return "Today";
  return getDate(contact.reviewDueDate) < getDate() ? "Overdue" : "Upcoming";
}

function extendWithSection(contact) {
  return { ...contact, section: getSection(contact) };
}

function loading(contacts, message) {
  return contacts.inProgress ? "loading..." : message;
}
