# malong-i18n-tsserver

Jump to translation definition and show it on hover.

## **Installation**

Install directly from GitHub:

```sh
npm install --save-dev malong-i18n-tsserver@github:WebinarGeek/malong-i18n-tsserver
```

> **Install-script approvals.** This package builds itself at install time
> (`prepare` → `tsc`) and depends on `tree-sitter` (a native module). If your
> project uses npm's `strict-allow-scripts=true`, add these entries to
> `allowScripts` in your project's `package.json`:
>
> ```json
> "allowScripts": {
>   "github:WebinarGeek/malong-i18n-tsserver#<resolved-commit>": true,
>   "tree-sitter": true,
>   "tree-sitter-javascript": true,
>   "tree-sitter-typescript": true
> }
> ```
>
> Replace `<resolved-commit>` with the commit recorded in `package-lock.json`.

## Development

The root `.npmrc` configures install-script approvals and a seven-day release cooldown.

```sh
npm ci
npm run build
npm test
```

Use `npm install` when adding or updating dependencies and commit the updated
`package-lock.json`. Use `npm ci` for repeatable installs locally and in CI.

### Plugin activation

Modify your **`tsconfig.json`** to include the plugin. Each translation
namespace maps to a JSON file, resolved relative to `baseUrl` (or, when
`baseUrl` is unset, the directory of the `tsconfig.json`):

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "malong-i18n-tsserver",
        "jsonFilePaths": [
          { "namespace": "eu", "path": "src/i18n/eu/en.json" },
          { "namespace": "admin", "path": "src/i18n/admin/en.json" }
        ]
      }
    ]
  }
}
```

Restart the TypeScript server (in VSCode by running **"TypeScript: Restart TS Server"** from the command palette).

💡 **Tip:** Make sure you are using the workspace version of typescript! In
VSCode you can do this by running **"TypeScript: Select TypeScript Version"**

## Publishing (future / optional)

> We currently install from GitHub. Publishing to the private
> [`@webinar-geek`](https://www.npmjs.com/org/webinar-geek) npm org is an
> alternative that removes the plugin's per-consumer build approval, at the cost of
> setting up an npm token in CI. See the tracking issue before going this route.

If/when we publish, the package is set up for it (`publishConfig.access`
is `restricted`, and `prepublishOnly` + the `files` allowlist ship a prebuilt
`out/`). To publish you would need to scope the name to
`@webinar-geek/malong-i18n-tsserver` and:

```sh
npm login                 # must be a member of the @webinar-geek org
npm version patch         # bump the version
npm publish               # builds out/ and publishes privately
```
