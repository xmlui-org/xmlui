let data = "";
process.stdin.on("data", (chunk) => {
  data += chunk;
});
process.stdin.on("end", () => {
  let changesetData;
  try {
    changesetData = JSON.parse(data);
  } catch (e) {
    process.exit(0);
  }

  // Find the xmlui-vscode release info
  const vsCodeRelease = changesetData?.releases?.find((r) => r.name === "xmlui-vscode");

  // If no release is planned, exit with empty outputs
  if (!vsCodeRelease || vsCodeRelease.changesets?.length === 0) {
    process.exit(0);
  }

  // Get all changesets for xmlui-vscode
  const relevantChangesets = changesetData.changesets.filter((cs) =>
    cs.releases.some((r) => r.name === "xmlui-vscode"),
  );

  // Format release notes
  let releaseNotes =
    `### ${vsCodeRelease.type.charAt(0).toUpperCase() + vsCodeRelease.type.slice(1)} Changes\n\n` +
    relevantChangesets.map((cs) => `- ${cs.summary}`).join("\n");

  const delimiter = generateUniqueDelimiter(releaseNotes);

  // Output the version and release notes
  console.log(`version=${vsCodeRelease.newVersion}`);
  console.log(`releaseNotes<<${delimiter}`);
  console.log(releaseNotes);
  console.log(delimiter);
});

function generateUniqueDelimiter(textContent) {
  let delimiter = "RELEASE_NOTES_DELIMITER";
  let counter = 0;

  while (textContent.includes(delimiter)) {
    counter++;
    delimiter = `RELEASE_NOTES_DELIMITER${counter}`;
  }

  return delimiter;
}
