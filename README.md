# malong-i18n-tsserver

Jump to translation definition and show it on hover.

## **Installation**

To install the plugin in your project, simply run:

```sh
npm install --save-dev malong-i18n-tsserver@WebinarGeek/malong-i18n-tsserver
```

### Plugin activation

Modify your **`tsconfig.json`** to include the plugin:

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "malong-i18n-tsserver",
        "jsonFilePath": "src/i18n/en.json"
      }
    ]
  }
}
```

Restart the TypeScript server (in VSCode by running **"TypeScript: Restart TS Server"** from the command palette)

💡 **Tip:** Make sure you are using the workspace version of typescript! In
VSCode you can do this by running **"TypeScript: Select TypeScript Version"**
