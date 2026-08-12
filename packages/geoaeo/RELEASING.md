# Releasing geoaeo

geoaeo ships one package with three faces — library, `geoaeo` CLI, and `geoaeo-mcp` server.
One version and one build feed all three. Two npm channels carry that build:

| Channel | npm dist-tag | Trigger | Install |
| --- | --- | --- | --- |
| Staging | `next` | every merge to `main` | `npm i geoaeo@next` |
| Production | `latest` | a pushed `vX.Y.Z` tag | `npm i geoaeo` |

Both channels run the identical `npm run verify` (typecheck + test + build) before they
publish. Only the version suffix and the dist-tag differ. That is the parity guarantee.

## Staging release (automatic)

Merge a PR to `main`. CI publishes a prerelease `X.Y.Z-next.<run>` under `@next`. Test it:

```bash
npm i geoaeo@next
npx geoaeo audit https://example.com
```

## Production release

1. Bump the version and update the changelog:

   ```bash
   npm version patch   # or minor / major — writes package.json + a git tag
   ```

2. Push the tag:

   ```bash
   git push origin main --follow-tags
   ```

3. CI runs `verify`, then publishes `@latest` with provenance.

## One-time setup

- Add an `NPM_TOKEN` secret (an npm automation token) to the repo.
- The `latest` job needs the git tag version to match `package.json`. `npm version` keeps
  them in sync — do not hand-edit one without the other.
