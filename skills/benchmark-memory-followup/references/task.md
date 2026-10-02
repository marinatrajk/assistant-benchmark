# memory-followup — remember preferences across conversations
The operator supplies synthetic preferences in an initial conversation, then changes one preference in a separate turn. After acknowledgment, the operator starts a new conversation in the same agent environment and supplies only the synthetic persona identifier and a request to apply remembered preferences. The fresh conversation must not contain the old transcript or answer key.

Checks:
- stored: native isolated durable memory records the supplied synthetic preferences.
- updated: the revised preference replaces the old current value, with readback and no conflicting current value.
- new-session-recall: native retrieval in the fresh conversation recovers the latest preferences without reseeding or copying the transcript.
- applied: the final suggestion satisfies every current preference and uses the updated constraint.

Record seed, update, entry identifiers/scope where shareable, fresh-session identity evidence, retrieval, and answer. The operator joins the two conversations' evidence. If no isolated durable namespace exists, blocked; if no durable memory capability exists, unsupported. Same-chat recall does not establish cross-conversation memory. A ranked top-one search alone is not an exhaustive no-conflict audit; record that limitation if current entries cannot all be inspected. Remove only this synthetic persona after the reviewer has the evidence and the operator requests cleanup.
