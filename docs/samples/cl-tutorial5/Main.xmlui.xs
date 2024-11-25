function countLabel(cat) {
  return contactCounts.inProgress ? "loading..." : contactCounts.value[cat];
}
