// Create a color map for all categories
var categoriesColorMap = toHashObject(categories.value, "name", "color");

// Resolve category name by id
function getCategoryNameById(categoryId) {
  const category = findByField(categories.value, "id", categoryId);
  return category ? category.name : "";
}