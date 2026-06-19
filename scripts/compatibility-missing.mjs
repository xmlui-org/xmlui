const [, , debtId = "UNKNOWN", command = "unknown"] = process.argv;

console.error(`Compatibility command '${command}' is not implemented yet.`);
console.error(`Tracked in .ai/compatibility-debt.md as ${debtId}.`);
console.error("This placeholder exists so old command names fail intentionally instead of disappearing.");

process.exit(1);
