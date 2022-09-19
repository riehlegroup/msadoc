# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Development Setup

We provide a `settings.json` for **VS Code** that you can use for a seamless development workflow with Prettier.
To use it just `cp .vscode/recommended-settings.json .vscode/settings.json`

### Build the client library

Before performing any task on the frontend, make sure to compile the client library first. To do that, simply run the following command:  
`npm run compile-client-library`

When building the client library, the old library output is always deleted first. This might lead to some "hiccups" in your IDE (i.e. your IDE might insist that the library does not exist, even after the build has finished). If you experience this problem, simply restart your IDE after building the client library. If you are using VSCode, you can alternatively use the "Restart TS server" and "Restart ESLint Server" commands.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

### `npm run lint`

This will run ESLint in order to lint the app.
