# Changelog

All notable changes to AgentPay SDK are documented in this file.

## [0.3.0] - 2026-04-05

- added `agentpay sign-typed-data` for arbitrary EIP-712 typed-data signatures through daemon policy checks
- added `agentpay admin add-eip712-signing-policy` with `allow`, `manual-approval`, and `deny` modes scoped by network
- generic EIP-712 signing now defaults to manual approval and is evaluated separately from spend-limit accounting
- improved `agentpay mpp` session flows by selecting the correct challenge when a server returns multiple MPP challenges and by handling `payment-need-voucher` stream control events in text mode with automatic voucher/top-up follow-up
- added Tempo session demo tooling with `pnpm example:mpp:session-demo`, `pnpm example:mpp:session-server`, and expanded local server examples for persisted session open, reuse, and close flows
- improved source-install and admin-setup ergonomics: source installs now support macOS and Linux, Windows source installs fail fast with a JavaScript-only fallback hint, and runtime refresh still reuses the existing wallet through `agentpay admin setup --reuse-existing-wallet`
- added packaged Linux installer bundles plus Linux installer smoke/build coverage in the release workflow; packaged Linux installs now deliver the precompiled runtime + skill pack alongside the existing macOS bundles
- hardened Linux command behavior around the new installer/runtime split: macOS-only managed-wallet commands now fail fast on Linux, macOS-only helper binaries are no longer installed by source installs there, and daemon-socket recovery guidance now points Linux users to explicit source-managed sockets instead of `agentpay admin setup`
- fixed Tempo session open/top-up signing so the daemon signs the standard transaction payload hash instead of a Keychain-wrapped hash, restoring server-side channel verification
- fixed `agentpay admin token set-chain` so saved per-token limit changes refresh the live daemon policy attachment for existing wallets instead of leaving the daemon pinned to bootstrap-time limits

Detailed release notes: [releases/v0.3.0.md](releases/v0.3.0.md)

## [0.2.0] - 2026-03-27

- added `agentpay x402 <url>` for exact/EIP-3009 x402 HTTP payments
- added `agentpay mpp <url>` for MPP HTTP 402 payments; charge flow supports any EVM-compatible chain (standard ERC-20 on generic chains, TIP-20 with attribution memo on Tempo)
- expanded `agentpay mpp` with reusable HTTP request flags (`--method`, repeatable `--header`, `--data`, `--json-body`) and decoded `Payment-Receipt` JSON output
- added session support to `agentpay mpp` (Tempo-only), including daemon-backed open/voucher digest signing, optional `--deposit`, and automatic session close
- added persisted session reuse for `agentpay mpp` via `--session-state-file`, with explicit teardown through `--close-session`
- added automatic persisted-session topUp and `payment-need-voucher` stream handling for `agentpay mpp` session flows in text mode
- added Rust agent CLI support for EIP-3009 transfer and receive authorization signing requests
- added Tempo mainnet (chain ID 4217) as a built-in chain with default RPC
- the local signer path supports `transfer`, `transfer-native`, `approve`, `broadcast`, `x402`, and `mpp`

Detailed release notes: [releases/v0.2.0.md](releases/v0.2.0.md)

## [0.1.0] - 2026-03-17

Initial public local-first release of AgentPay SDK.

Highlights:

- macOS local runtime for self-custodial, policy-aware wallet operations
- one-click install via `curl -fsSL https://wlfi.sh | bash` and a full source install path
- wallet setup, wallet reuse, encrypted backup export, verification, and restore
- local daemon-managed signing with policy enforcement before signing
- support for EVM-compatible chains with USD1 as the default asset path
- plugin system for third-party integrations and contributions
- Bitrefill included as an example integration

Detailed release notes: [releases/v0.1.0.md](releases/v0.1.0.md)
