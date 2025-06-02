## Publishing Package

Since it is inside a monorepo, `lerna` will manage it, And you just need to go to the root level `pricing-api` and run the [publishing command](https://gitlab.com/e-pilot/product/checkout-and-pricing/pricing-api/-/tree/main#publishing-packages).

## Updating the Docs Portal

To regenerate the docs and update our portal, do:

```bash
pnpm run gen-docs
```

Now browse to our docs repo and do:

```bash
cd docs/pricing
rm -rf pricing-library
cp -r <your-pricing-repo>/docs pricing-library
```

Now you can commit and push the changes to the docs repo.
