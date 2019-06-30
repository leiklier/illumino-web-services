# TODO

## New Features

- Implement `active` query on `Device` which returns status `enum` : `CONNECTED` or `DISCONNECTED` based on `lastSeenAt`.
- Device should have a `firmwareVersion` attribute.
- add `createdAt` and `updatedAt` entities to `User` and `Device`.
- Check out `graphql-tools`. Should we port codebase?
- `SensorData` `interface`.

## Improvements

- Rename `Device` to `ClockDevice`. Also make `Device` an `interface`. In `mongoose`, this can be done by use of `discriminator`s.
- Refactor all `Error`s into `ApolloError`s.
- Implement naming scheme for all `Error`s to make them consistent.
- Rename `pin` to `pincode`.
- Add virtual getter `hasOwner` to `Device` mongoose model
- replace `bcrypt` manual encryption with `mongoose-bcrypt`.
- Two-way relation binding on `User`<->`Device` is unneccessary. Remove fields on `User`, and create index on `Device` (or is it? What about managers? they cannot be indexed. Can however be move to another collection).
- Rename `AuthData` to `AuthPayload` to follow conventions laid out by Github.
- Implementations of `AuthData` should return the `Device` / `User` instead of only its `id`, i.e. `deviceId` and `userId`.

## Security fixes

- Verify `pin` on unclaimed `Device` if set when a `User` is trying to `claimDevice`.

## Bug fixes

- When mutating using `createDevice`, it fails to return the created `Device`.
- DataLoader cache should be cleared on GraphQL mutation
- DataLoader cache should be cleared when data has changed in database (bind to `Model.watch().on(...)`)

---
