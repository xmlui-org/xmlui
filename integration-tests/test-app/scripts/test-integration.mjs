import { spawn } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: root, stdio: "inherit", shell: true });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`"${cmd} ${args.join(" ")}" exited with code ${code}`));
    });
    child.on("error", reject);
  });
}

async function main() {
  // 1. Build dependencies
  await run("turbo", ["run", "//#test:integration"]);

  // 2. Run integration tests — capture exit code
  let testExitCode = 0;
  try {
    await run("npx", [
      "playwright",
      "test",
      "--config",
      "integration-tests/tests/playwright.config.ts",
    ]);
  } catch (e) {
    testExitCode = 1;
  }

  // 3. Cleanup — always runs
  try {
    await run("npm", ["run", "--workspace=xmlui", "postpublish"]);
  } catch (e) {
    testExitCode = 1;
  }

  process.exit(testExitCode);
}

main();
