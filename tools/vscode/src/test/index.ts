import * as path from 'path';
import * as Mocha from 'mocha';

export function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		color: true
	});
	mocha.timeout(100000);

	const testsRoot = __dirname;
  const files = ["completion.test.ts", "diagnostics.test.ts"];
  //
  // Add files to the test suite
	files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

	try {
		// Run the mocha test
		return new Promise<void>((resolve, reject) => {
			mocha.run(failures => {
				if (failures > 0) {
					reject(`${failures} tests failed.`);
				} else {
					resolve();
				}
			});
		});
	} catch (err) {
		console.error(err);
		throw err;
	}
}
