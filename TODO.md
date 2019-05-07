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
- Replace authentication done in all `resolver`s with an `@auth` `directive` which restricts access to certain queries/mutations. See [Apollo Docs](https://www.apollographql.com/docs/apollo-server/features/authentication#directives-auth) for inspiration. In this context we need an `enum Role` to keep track of what role the authenticated `User`/`Device` has. Example: `@auth(requires: Role!)`
- Rename `pin` to `pincode`.
- Add virtual getter `hasOwner` to `Device` mongoose model

## Security fixes

- Verify `pin` on unclaimed `Device` if set when a `User` is trying to `claimDevice`.

## Bug fixes

- When mutating using `createDevice`, it fails to return the created `Device`.

---

## Sketches

```
    enum Role {
        ANONYMOUS
        DEVICE
        DEPLOY
        USER
        ADMIN
        ROOT
    }
```
