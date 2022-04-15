# NestJS starter

A starter repository for a NestJS application, but not using it's CLI. Instead, the transpilation and the dev server are handled only by the typescript compiler `tsc` and `ts-node-dev`.

Running the application only goes down to the two essential steps:

1. Transpiling the ts code of the app into js code
2. Run the js code.

The rest can be done however you like.

- You can replace `tsc` with another transpiler, like `swc`
- You can use any watcher that you want, like nodemon

## Build

- **build**: `yarn build`
- **dev**: `yarn dev`
- **start**: `yarn build && yarn start`
