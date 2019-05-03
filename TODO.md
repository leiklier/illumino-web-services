# TODO

## New Features
* Implement `loginDevice` query which takes `mac` and `pin` as arguments and returns `DeviceAuthData`.
* `Device` should have attribute `lastSeenAt`, implement `txBeacon` mutation which changes this.
* Implement `active` query on `Device` which returns status `enum` : `CONNECTED` or `DISCONNECTED` based on `lastSeenAt`.
* Device should have a `firmwareVersion` attribute.
* `doAuth` or `authDevice` query for authenticating a `Device`.
* add `createdAt` and `updatedAt` entities to `User` and `Device`.
* Check out `graphql-tools`. Should we port codebase?
* `SensorData` `interface`.
* Remove the `me` query, and replace with `device` and `user` queries.

## Improvements
* Implement dataloaders in loaders.js.
* Rename `Device` to `ClockDevice`. Also make `Device` an `interface`.
* In `loaders.js`, add a `requestor={deviceId, userId, isAdmin}` parameter for figuring out recursion level /  `nestingLevel` (or maybe just pass down the whole `context`?).
* Refactor all `Error`s into `ApolloError`s.
* Rename `reAuth` to `refreshToken`.
* Rename `login` to `loginUser`.
* Make `AuthData` into an `interface`, and derive `UserAuthData` from it.
* All queries/mutations requesting `deviceId` should instead request `mac`, and all queries/mutations requesting `userId` should instead request `email`.

## Security fixes
* Verify `pin` on unclaimed `Device` if set when a `User` is trying to `claimDevice`.
* Add `DEPLOY_KEY` authorization when trying to `createDevice`. Should be set via header `Authorization: Mutual <DEPLOY_KEY>`. Correct `<DEPLOY_KEY>` sets `context.isDeploying` flag.

## Bug fixes


