# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `user` context which provides information about the authorized `User`.
- `device` context which provides information about the authorized `Device`.´
- `refreshToken` GraphQL query which generates a new token if previous still is valid.
- `isAuth` GraphQL query which returns `Boolean` based on whether user is logged in or not.
- `grantAdmin` GraphQL mutation which allows one `admin` to grant another user `admin` privileges.
- `Device` mongoose model with `owner` and `managers`.
- `createDevice` GraphQL mutation which lets a `Device` self register.
- `claimDevice` GraphQL mutation which lets a `User` own an existing `Device` which currently has no `owner`.
- `setDevicePin` GraphQL mutation which lets the `owner` of a `Device` or an `admin`set its `pin` (or anyone if the `Device` has not been claimed).
- `setDeviceName` GraphQL mutation which lets the `owner` of a `Device` or an `admin` set its `name`.
- `loginDevice` GraphQL query for logging in a `Device` using `mac` and `pin`.
- `txBeacon` GraphQL mutation which is used by `Device` for showing its presence online.
- `authDevice` GraphQL query for authorizing a `Device` using `mac` and `authKey`. Used by the `Device` itself.
- `user` GraphQL query lets you gather information about a `User` with a certain `email`. If `email` is not provided but a `User` is logged in, this query will provide information about the `User` himself.
- `user` GraphQL subscription for subscribing to changes to / creation of a certain `User`.
- `device` GraphQL query lets you gather information about a `Device` with a certain `mac` address. If `mac` is not provided but a `Device` is logged in, this query will provide information about the `Device` itself.

### Changed

- `User` mongoose model requires `firstName` and `lastName`.
- `createUser` GraphQL mutation checks if email is valid.
- `login` GraphQL query has been renamed to `loginUser`.

## [v0.1.0] - 2019-05-01

### Added

- `User` mongoose model with email and password.
- `createUser` GraphQL mutation.
- `login` GraphQL query for logging in a `User`.

[unreleased]: https://github.com/leiklier/ambientalarm-api/compare/v0.1.0...HEAD
[v0.1.0]: https://github.com/leiklier/ambientalarm-api/releases/tag/v0.1.0
