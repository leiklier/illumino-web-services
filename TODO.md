# TODO

## New Features

- Implement `active` query on `Device` which returns status `enum` : `CONNECTED` or `DISCONNECTED` based on `lastSeenAt`.
- Device should have a `firmwareVersion` attribute.
- `doAuth` or `authDevice` query for authenticating a `Device` by `authKey`.
- add `createdAt` and `updatedAt` entities to `User` and `Device`.
- Check out `graphql-tools`. Should we port codebase?
- `SensorData` `interface`.

## Improvements

- Rename `Device` to `ClockDevice`. Also make `Device` an `interface`.
- Refactor all `Error`s into `ApolloError`s.
- Implement naming scheme for all `Error`s to make them consistent.
- Rename `pin` to `pincode`.
- Add virtual getter `hasOwner` to `Device` mongoose model
- replace `bcrypt` manual encryption with `mongoose-bcrypt`.

## Security fixes

- Verify `pin` on unclaimed `Device` if set when a `User` is trying to `claimDevice`.

## Bug fixes

- When mutating using `createDevice`, it fails to return the created `Device`.
- DataLoader cache should be cleared on GraphQL mutation
- DataLoader cache should be cleared when data has changed in database (bind to `Model.watch().on(...)`)

---
