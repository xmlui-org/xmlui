// Category record of the item
var category = findByField(categories.value, "id", $props.item.categoryId);
 
// Create a color map for all categories
var categoriesColorMap = toHashObject(categories.value, "name", "color");
