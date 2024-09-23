# Build Checklist

Before merging back a new commit, execute these steps to check if your current work is likely to pass the GitHub merge workflow:

1. Build the `xmlui` project (run from within the `xmlui` folder):

```
npm run build
```

2. Run the `xmlui` tests (run from within the `xmlui` folder):

```
npm run test
```

3. Run the `xmlui` document generation (run from within the `xmlui` folder):

```
npm run generate-docs
```

4. Check if end-to-end tests work (run from within the `tests` folder):

```
npm run test
```

5. Ensure the docs site build works (run from within the `docs` folder):

```
npm run build
```

If these steps pass, you can merge your commit.