import test from 'node:test';
import assert from 'node:assert/strict';

const modulePath = new URL('../src/lib/admin-daemon-socket.ts', import.meta.url);

function loadModule(caseId) {
  return import(modulePath.href + `?case=${caseId}`);
}

test('resolveAdminDaemonSocketSelection prioritizes explicit, env, config, then managed default', async () => {
  const adminDaemonSocket = await loadModule(`${Date.now()}-selection-order`);

  assert.deepEqual(
    adminDaemonSocket.resolveAdminDaemonSocketSelection(
      '/explicit.sock',
      { daemonSocket: '/config.sock' },
      { AGENTPAY_DAEMON_SOCKET: '/env.sock' },
    ),
    { value: '/explicit.sock', source: 'explicit' },
  );
  assert.deepEqual(
    adminDaemonSocket.resolveAdminDaemonSocketSelection(
      undefined,
      { daemonSocket: '/config.sock' },
      { AGENTPAY_DAEMON_SOCKET: '/env.sock' },
    ),
    { value: '/env.sock', source: 'env-daemon-socket' },
  );
  assert.deepEqual(
    adminDaemonSocket.resolveAdminDaemonSocketSelection(undefined, { daemonSocket: '/config.sock' }, {}),
    { value: '/config.sock', source: 'config-daemon-socket' },
  );
  assert.deepEqual(adminDaemonSocket.resolveAdminDaemonSocketSelection(undefined, {}, {}), {
    value: '/Library/AgentPay/run/daemon.sock',
    source: 'default',
  });
});

test('resolveValidatedAdminDaemonSocket rejects empty explicit daemon socket paths', async () => {
  const adminDaemonSocket = await loadModule(`${Date.now()}-empty-explicit`);

  assert.throws(
    () =>
      adminDaemonSocket.resolveValidatedAdminDaemonSocket('   ', {}, {
        env: {},
        assertTrustedAdminDaemonSocketPath: (targetPath) => targetPath,
      }),
    /--daemon-socket requires a path/,
  );
});

test('resolveValidatedAdminDaemonSocket adds recovery commands for stale config overrides', async () => {
  const adminDaemonSocket = await loadModule(`${Date.now()}-config-recovery`);

  assert.throws(
    () =>
      adminDaemonSocket.resolveValidatedAdminDaemonSocket(undefined, {
        daemonSocket: '/Users/example/agentpay-home/daemon.sock',
      }, {
        env: {},
        assertTrustedAdminDaemonSocketPath: () => {
          throw new Error("Daemon socket directory '/Users/example/agentpay-home' must be owned by root");
        },
      }),
    /agentpay config unset daemonSocket/,
  );
  assert.throws(
    () =>
      adminDaemonSocket.resolveValidatedAdminDaemonSocket(undefined, {
        daemonSocket: '/Users/example/agentpay-home/daemon.sock',
      }, {
        env: {},
        assertTrustedAdminDaemonSocketPath: () => {
          throw new Error("Daemon socket directory '/Users/example/agentpay-home' must be owned by root");
        },
      }),
    /agentpay status --strict/,
  );
});

test('resolveValidatedAdminDaemonSocket adds AGENTPAY_HOME recovery guidance for managed defaults', async () => {
  const adminDaemonSocket = await loadModule(`${Date.now()}-default-recovery`);

  assert.throws(
    () =>
      adminDaemonSocket.resolveValidatedAdminDaemonSocket(undefined, {}, {
        env: { AGENTPAY_HOME: '/Users/example/agentpay-home' },
        assertTrustedAdminDaemonSocketPath: () => {
          throw new Error("Daemon socket '/Library/AgentPay/run/daemon.sock' does not exist");
        },
      }),
    /unset `AGENTPAY_HOME`/,
  );
  assert.throws(
    () =>
      adminDaemonSocket.resolveValidatedAdminDaemonSocket(undefined, {}, {
        env: { AGENTPAY_HOME: '/Users/example/agentpay-home' },
        assertTrustedAdminDaemonSocketPath: () => {
          throw new Error("Daemon socket '/Library/AgentPay/run/daemon.sock' does not exist");
        },
      }),
    /agentpay admin setup --reuse-existing-wallet/,
  );
});

test('resolveValidatedAdminDaemonSocket fails fast on Linux when no explicit daemon socket is configured', async () => {
  const adminDaemonSocket = await loadModule(`${Date.now()}-linux-default-blocked`);

  assert.throws(
    () =>
      adminDaemonSocket.resolveValidatedAdminDaemonSocket(undefined, {}, {
        env: {},
        platform: 'linux',
        assertTrustedAdminDaemonSocketPath: () => {
          throw new Error('should not reach trust validation');
        },
      }),
    /No managed default daemon socket is available on this platform/u,
  );
});

test('wrapAdminDaemonSocketTrustError gives Linux-specific recovery guidance', async () => {
  const adminDaemonSocket = await loadModule(`${Date.now()}-linux-trust-guidance`);

  const error = adminDaemonSocket.wrapAdminDaemonSocketTrustError(
    "Daemon socket '/tmp/agentpay.sock' must be owned by root",
    'explicit',
    {},
    'linux',
  );

  assert.match(error.message, /point the command at your existing daemon socket/u);
  assert.doesNotMatch(error.message, /agentpay admin setup --reuse-existing-wallet/u);
  assert.match(error.message, /managed `agentpay admin setup` daemon flow is currently macOS-only/u);
});
