# Maturity page visibility

The public Maturity page is off for now. Its five levels, Atlas, source data,
components and styles remain in the repository.

`lib/site-visibility.ts` is the single on/off control:

```ts
export const maturityPageEnabled = false;
```

With the switch off, `/maturity` (including bookmarked query URLs) returns 404.
Desktop and mobile navigation, the footer, sitemap and contextual Maturity
links omit the page. Journey Studio feature references lead to their existing
Journey mapping instead. Maturity diagnosis service copy remains available.

To restore the page, change the value to `true`, build and publish the site.
The page and all its links return together. No content recreation is needed.

Validate a running local preview with:

```sh
node scripts/smoke.mjs http://localhost:3002
```

When the switch is on, add `--maturity-enabled` to that command.
