# malong-i18n-tsserver

Jump to translation definition and show it on hover.

## **Installation**

You can install the plugin globally or per project.

### **📌 Project Installation**

To install the plugin in your project, simply run:

```sh
npm install --save-dev xstate-tsserver
```

### **📌 Global Installation**

You can also install the plugin globally by running:

```sh
npm install -g xstate-tsserver
```

You will also need to add your global node_modules path to tsserver's plugin paths.

For example, in VSCode, you can edit your **`settings.json`** to add the plugin path:

```json
{
  "typescript.tsserver.pluginPaths": ["path/to/global/node_modules"]
}
```

💡 **Tip:** You can find your global node_modules path by running:

```sh
npm root -g
```

### Plugin activation

Modify your **`tsconfig.json`** to include the plugin:

```json
{
  "compilerOptions": {
    "plugins": [{ "name": "xstate-tsserver" }]
  }
}
```

Restart the TypeScript server (in VSCode by running **"TypeScript: Restart TS Server"** from the command palette)
