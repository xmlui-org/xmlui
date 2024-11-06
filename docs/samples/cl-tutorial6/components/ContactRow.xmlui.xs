// Category record of the item
var category = $props.categories.find(t => t.id === $props.item.categoryId);
 
// Create a color map for all categories
var categoriesColorMap = toHashObject($props.categories, "name", "color");