In the following, you can find documentation of the most important frontend-related tasks/features, and a few development tips.

> All of the npm commands mentioned here should be run from the root of the project, not from the `frontend/` folder. When opening the project in VSCode, make sure to open the root of the project, not the `frontend/` folder.

## Development server

To start a development server in order to preview the application, run

```
npm start -w=frontend
```

Open [http://localhost:3001](http://localhost:3001) to view the application in the browser. When you make edits, the corresponding parts of the application will automatically reload.

Please note:

- We are using [Vite](https://vitejs.dev) as our build tool. The Vite development server starts very quickly (it should only take a few seconds). However, when you load the application in your browser for the very first time, it is possible that it takes even up to one minute until your browser shows the page. Future page loads will be much faster.
- The development server does perform type checking and thus not warn you if you have any type-related errors in your code.

## Production build

To build the frontend for production, run

```
npm run build -w=frontend
```

Typically, we run this command in a CI/CD pipeline. However, it is also useful locally: Once you have finished implementing a particular (larger) feature, it might be helpful to see whether it works properly in production mode. Once you have built the frontend for production, you can run the following command to preview the production build in your browser:

```
npm run preview -w=frontend
```

## Environment variables

The following environment variables are available.

- `VITE_BACKEND_URL` (string): The URL to the backend of our application.
- `VITE_DEMO_MODE` (boolean): Should the application be started in Demo Mode? (Tip: When developing a new feature for the frontend, Demo Mode is pretty useful, because you don't need to start any backend in this case.)
- `VITE_ROUTER_BASE` (string): When deploying on a subfolder (e.g. `https://riehlegroup.github.io/msadoc/` instead of `https://riehlegroup.github.io`), make sure to set this variable to the name of the folder (in the example: `msadoc`).

> If you want to override some of the environment variables for local development, create a `.env.local` file and add the overrides to this file. See https://vitejs.dev/guide/env-and-mode.html

## Controller Pattern

The React components used in our frontend are all structured according to the [Controller Pattern](https://medium.com/@MBuchalik/the-controller-pattern-separate-business-logic-from-presentation-in-react-331f72fcb32a). Please make sure to follow this pattern when creating new components.

The repository already contains a VSCode code snippet that allows you to easily create the boilerplate code for a component that uses the Controller Pattern. In a fresh `.tsx` file, simply type `reactcomponent`. You should get a suggestion that, once accepted, creates the necessary boilerplate code for you.

## Notes

In the following, a few unordered notes.

- `npm run build:demo -w=frontend` will build the frontend for GitHub pages.
- We are using a monorepo. One of the benefits of this is that we can create reusable libraries and import/use them in our projects (see e.g. `client-generated`), just like if we installed these libraries from npm. For some reason, Vite handles these local libraries in a different way compared to ones from npm. See https://vitejs.dev/guide/dep-pre-bundling.html#monorepos-and-linked-dependencies Most importantly, the local libraries need to be ESM modules, i.e. they need `"type": "module"` in their `package.json`, and `"module": "es2022"` in their `tsconfig.json`.
