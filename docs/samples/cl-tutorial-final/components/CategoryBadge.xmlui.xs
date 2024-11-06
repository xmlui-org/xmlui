var category = categories.value.find((t) => t.id === $props.categoryId);

var categoriesColorMap = toHashObject(categories.value, "name", "color");
