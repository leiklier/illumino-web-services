# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
* `user` context which provides information about the authorized `User`.
* `me` GraphQL query which lets the user query information about himself, up to three levels down.
* `grantAdmin` GraphQL mutation which allows one `admin` to grant another user `admin` privileges.
* `Device` mongoose model with `owners` and `managers`.
* `createDevice` GraphQL mutation which lets a `User` with `admin` privileges create a new `Device`.
* `activateDevice` GraphQL mutation which lets a `User` own an existing `Device`.

### Changed
* `User` mongoose model requires `firstName` and `lastName`.
* `createUser` GraphQL mutation checks if email is valid.

## [v0.1.0] - 2019-05-01

### Added

* `User` mongoose model with email and password.
* `createUser` GraphQL mutation.
* `login` GraphQL query.

[Unreleased]: https://github.com/leiklier/ambientalarm-api/compare/v0.1.0...HEAD
[v0.1.0]: https://github.com/leiklier/ambientalarm-api/releases/tag/v0.1.0