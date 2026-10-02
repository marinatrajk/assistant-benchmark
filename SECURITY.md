# Security and privacy

The harness is a single-user local tool. It binds to loopback and is not an OS sandbox. Desktop actions affect the real display. Browser observations, prompts, memories and screenshots can be sent to the configured model provider and saved locally.

Do not commit `.env`, `.data`, databases, browser profiles, API keys or raw private run evidence. This repository includes only selected public evidence and synthetic expense artifacts. The examples contain empty key values and synthetic identities.

For a vulnerability or accidental sensitive-data exposure, use GitHub's private vulnerability reporting for this repository when available. Do not post the sensitive values in a public issue. If private reporting is unavailable, open an issue containing only a request for a private contact channel.

This is experimental evaluation software, not a security-audited boundary for executing untrusted tools. Keep the public static website separate from the local harness.
