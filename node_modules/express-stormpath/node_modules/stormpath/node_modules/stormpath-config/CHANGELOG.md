# Changelog

### 0.0.15

Patch for 0.0.14 - fixing a null reference.

### 0.0.14

Adding a temporary patch to `ExtendConfigStrategy` to ensure that prototype
methods are not lost on `config.cacheOptions.client`.  The patch manually
replaces this property, in the future we intend to fix the extension algorithm
to support this case.

### 0.0.13

Modified `EnrichClientFromRemoteConfigStrategy` to implement the proper
application resolution strategiey: load application by name or href, fallback
to ony application if that is the case.