
# We need this to generate the snapshot screenshots for linux, see more here: https://playwright.dev/docs/test-snapshots
# The snapshot name example-test-1-chromium-darwin.png consists of a few parts:
#    example-test-1.png - an auto-generated name of the snapshot. Alternatively you can specify snapshot name as the first argument of the toHaveScreenshot() method:
#    chromium-darwin - the browser name and the platform. Screenshots differ between browsers and platforms due to different rendering, fonts and more, so you will need different snapshots for them. If you use multiple projects in your configuration file, project name will be used instead of chromium.
# If you are not on the same operating system as your CI system, you can use Docker to generate/update the screenshots:
docker run --rm --network host -v $(pwd):/work/ -w /work/ -it mcr.microsoft.com/playwright:v1.35.1-jammy /bin/bash -c "npm install && npx playwright test --update-snapshots"