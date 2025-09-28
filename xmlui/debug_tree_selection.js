// Debug script to check tree data transformation
const { flatToNative } = require('./dist/components-core/utils/treeUtils');

const flatTreeData = [
  { id: 1, name: "Root Item 1", parentId: null },
  { id: 2, name: "Child Item 1.1", parentId: 1 },
  { id: 3, name: "Child Item 1.2", parentId: 1 },
  { id: 4, name: "Grandchild Item 1.1.1", parentId: 2 },
];

const fieldConfig = {
  idField: "id",
  labelField: "name",
  parentField: "parentId"
};

const result = flatToNative(flatTreeData, fieldConfig);
console.log("Tree items by ID:");
Object.entries(result.treeItemsById).forEach(([uid, node]) => {
  console.log(`UID: ${uid}, Key: ${node.key} (type: ${typeof node.key}), Name: ${node.displayName}`);
});

console.log("\nLooking for node with key '2':");
const nodeByKey2 = Object.values(result.treeItemsById).find(n => n.key === "2");
console.log(nodeByKey2 ? `Found: ${nodeByKey2.displayName}` : "Not found");

console.log("\nLooking for node with key 2 (number):");
const nodeByKeyNum2 = Object.values(result.treeItemsById).find(n => n.key === 2);
console.log(nodeByKeyNum2 ? `Found: ${nodeByKeyNum2.displayName}` : "Not found");
