# TODO

## New Features

- Implement `active` query on `Device` which returns status `enum` : `CONNECTED` or `DISCONNECTED` based on `lastSeenAt`.
- Device should have a `firmwareVersion` attribute.
- `doAuth` or `authDevice` query for authenticating a `Device` by `authKey`.
- add `createdAt` and `updatedAt` entities to `User` and `Device`.
- Check out `graphql-tools`. Should we port codebase?
- `SensorData` `interface`.
- Remove the `me` query, and replace with `device` and `user` queries.

## Improvements

- Rename `Device` to `ClockDevice`. Also make `Device` an `interface`.
- In `loaders.js`, add a `requestor={deviceId, userId, isAdmin}` parameter for figuring out recursion level / `nestingLevel` (or maybe just pass down the whole `context`?).
- Refactor all `Error`s into `ApolloError`s.
- Rename `pin` to `pincode`.
- Add virtual getter `hasOwner` to `Device` mongoose model

## Security fixes

- Verify `pin` on unclaimed `Device` if set when a `User` is trying to `claimDevice`.

## Bug fixes

- When mutating using `createDevice`, it fails to return the created `Device`.

---
