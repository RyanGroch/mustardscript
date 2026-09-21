'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const manifest = require('../../package.json');
const lockfile = require('../../package-lock.json');

test('release lockfile retains entries for unpublished optional bindings', () => {
  assert.equal(lockfile.version, manifest.version);
  assert.equal(lockfile.packages[''].version, manifest.version);
  assert.deepEqual(
    lockfile.packages[''].optionalDependencies,
    manifest.optionalDependencies,
  );

  for (const [name, version] of Object.entries(manifest.optionalDependencies)) {
    assert.equal(version, manifest.version, `${name} must match the release`);
    const entry = lockfile.packages[`node_modules/${name}`];
    assert.ok(entry, `${name} needs a lockfile entry even before publication`);
    assert.equal(entry.optional, true, `${name} must remain optional`);
    // npm records only { optional: true } before the version is published.
    // Once resolved, the entry must not silently retain an older release.
    if (entry.version !== undefined) {
      assert.equal(entry.version, version, `${name} has a stale locked version`);
    }
  }
});
