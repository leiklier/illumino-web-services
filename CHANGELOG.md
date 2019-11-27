# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security

- Authentication is now enhanced by migrating to a refresh- and access token scheme. A long lived refresh token is set as cookie upon authenticating. This cookie is used in the `authToken` query to retrieve a token which is used as previously for authorization.

### Added

- `Firmware` mongoose model for storing firmware belonging to `Device`s.
- `publishFirmware` GraphQL mutation for releasing new firmware upgrades. The mutation stores `binary`s in GridFS.
- `installedFirmware` attribute for `Devices` - points to the `Firmware` currently installed and running on a certain `Device`.
- `newFirmwares` GraphQL subscription for subscribing to new `Firmware` releases.
- `/latest-firmware-binary` REST endpoint lets authorized `Device` download latest `Firmware` binary.
- `ledStrip` mongoose schema for storing settings for `ledStrips` belonging to `Device`s.
- `ledStrips` attribute for `Device`s - contains the settings for the `ledStrip`s belonging to a certain `Device`.
- `ledStrip` GraphQL query for querying a specific ledStrip based on `mac` and `ledStripId`.
- `ledStrips` GraphQL query for querying all ledStrips belonging to a `Device` with a certain `mac`.
- `setBrightnessOnLedStrip` GraphQL mutation changes `brightness` for a certain ledStrip.
- `setColorOnLedStrip` GraphQL mutation changes `color` for a certain ledStrip.
- `setAnimationTypeOnLedStrip` GraphQL mutation changes `animationType` for a certain ledStrip.
- `setAnimationTypeOnLedStrip` GraphQL mutation changes `animationType` for a certain ledStrip.
- `devices` GraphQL query lets a user query `Device`s on an array of `secret`s.
- `secretIsValid` GraphQL query lets a user check if a secret belongs to a `Device`.
- `device` GraphQL subscription lets a user listen for changes to a certain `Device`.

### Changed

- `loginDevice` GraphQL query no longer requires `mac`.
- `refreshToken` is renamed `accessToken` and returns an `accessToken` when the actor has a valid `refreshToken`.
- `device` GraphQL query now also takes `secret` as parameter.
- `Device`s can be queried on `hasPin`attribute.

## [v0.2.0] - 2019-06-29

### Added

- `user` context which provides information about the authorized `User`.
- `device` context which provides information about the authorized `Device`.´
- `refreshToken` GraphQL query which generates a new token if previous still is valid.
- `isAuth` GraphQL query which returns `Boolean` based on whether user is logged in or not.
- `grantAdmin` GraphQL mutation which allows one `admin` to grant another user `admin` privileges.
- `Device` mongoose model with `owner` and `managers`.
- `Measurement` mongoose model for storing `Measurement`s belonging to a `Device`.
- `createDevice` GraphQL mutation which lets a `Device` self register.
- `claimDevice` GraphQL mutation which lets a `User` own an existing `Device` which currently has no `owner`.
- `setDevicePin` GraphQL mutation which lets the `owner` of a `Device` or an `admin`set its `pin` (or anyone if the `Device` has not been claimed).
- `setDeviceName` GraphQL mutation which lets the `owner` of a `Device` or an `admin` set its `name`.
- `loginDevice` GraphQL query for logging in a `Device` using `mac` and `pin`.
- `txBeacon` GraphQL mutation which is used by `Device` for showing its presence online.
- `txMeasurement` GraphQL mutation which lets a `Device` store a new `Measurement`.
- `authDevice` GraphQL query for authorizing a `Device` using `mac` and `authKey`. Used by the `Device` itself.
- `user` GraphQL query lets you gather information about a `User` with a certain `email`. If `email` is not provided but a `User` is logged in, this query will provide information about the `User` himself.
- `user` GraphQL subscription for subscribing to changes to / creation of a certain `User`.
- `newMeasurements` GraphQL subscription for subscribing to new `Measurement`s for a certain `Device`.
- `device` GraphQL query lets you gather information about a `Device` with a certain `mac` address. If `mac` is not provided but a `Device` is logged in, this query will provide information about the `Device` itself.
- Consistent error codes.

### Changed

- `User` mongoose model requires `firstName` and `lastName`.
- `createUser` GraphQL mutation checks if email is valid.
- `login` GraphQL query has been renamed to `loginUser`.

## [v0.1.0] - 2019-05-01

### Added

- `User` mongoose model with email and password.
- `createUser` GraphQL mutation.
- `login` GraphQL query for logging in a `User`.

[unreleased]: https://github.com/leiklier/ambientalarm-api/compare/v0.2.0...HEAD
[v0.2.0]: https://github.com/leiklier/ambientalarm-api/compare/v0.1.0...v0.2.0
[v0.1.0]: https://github.com/leiklier/ambientalarm-api/releases/tag/v0.1.0
