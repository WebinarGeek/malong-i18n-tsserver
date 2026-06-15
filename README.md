# @webinar-geek/malong-i18n-tsserver

Jump to translation definition and show it on hover.

## **Installation**

This is a private package published under the [`@webinar-geek`](https://www.npmjs.com/org/webinar-geek) npm org. You need access to the org and to be authenticated with npm (`npm login`).

To install the plugin in your project, run:

```sh
pnpm add --save-dev @webinar-geek/malong-i18n-tsserver
```

> **Note:** the package ships its prebuilt output, so no install-time build is
> required. It does depend on `tree-sitter` (a native module). If your project
> blocks dependency build scripts under pnpm, allow the native deps to build by
> adding the following to your `pnpm-workspace.yaml`:
>
> ```yaml
> onlyBuiltDependencies:
>   - tree-sitter
>   - tree-sitter-typescript
> ```

### Plugin activation

Modify your **`tsconfig.json`** to include the plugin. Each translation
namespace maps to a JSON file, resolved relative to `baseUrl` (or, when
`baseUrl` is unset, the directory of the `tsconfig.json`):

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "@webinar-geek/malong-i18n-tsserver",
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

## Publishing

Maintainers publish to the private `@webinar-geek` org:

```sh
npm login                 # must be a member of the @webinar-geek org
pnpm version patch        # bump the version
pnpm publish              # runs prepublishOnly (tsc) and publishes the built out/
```

`publishConfig.access` is set to `restricted`, so the package is published
privately by default.
