# Changelog

## [0.2.0](https://www.github.com/mylims/base-processor/compare/v0.1.1...v0.2.0) (2021-11-12)


### ⚠ BREAKING CHANGES

* topic and collection name are at the processor level, not at env variables, and a processor receives a class instance instead of some metadata

### Code Refactoring

* processor can specify topic, if sample is upsert and allows to not save ([#6](https://www.github.com/mylims/base-processor/issues/6)) ([2284aa1](https://www.github.com/mylims/base-processor/commit/2284aa1427dc55ca3745085d0c63ff602cf96b3e)), closes [#3](https://www.github.com/mylims/base-processor/issues/3) [#5](https://www.github.com/mylims/base-processor/issues/5)

### [0.1.1](https://www.github.com/mylims/base-processor/compare/v0.1.0...v0.1.1) (2021-10-14)


### Bug Fixes

* add production types as dependencies ([db8cf3a](https://www.github.com/mylims/base-processor/commit/db8cf3acd16a9a6c53707b495e6db1ff1edf71bc))

## 0.1.0 (2021-10-14)


### Features

* initial implementation ([cc98879](https://www.github.com/mylims/base-processor/commit/cc98879d65f7cbe9bc9943573732c5d2b8bf85f0))
