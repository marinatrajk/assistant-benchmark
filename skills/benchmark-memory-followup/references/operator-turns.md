# Operator turns

Choose a unique synthetic persona ID and your own synthetic preference values. Keep the actual values out of the recall conversation and its attached files.

1. In the initial conversation, invoke this skill and supply the persona ID and initial preferences. Ask the assistant to store them using its existing isolated durable memory. Retain storage evidence privately.
2. After acknowledgment, send a separate message updating one preference. Collect the durable update, readback and assessment of conflicting current values.
3. Open a genuinely new conversation in the same assistant environment. Attach this task skill if needed, but do not attach the seed/update report, transcript or answer-bearing artifacts. Supply only the persona ID and ask: “Use this persona's remembered current preferences to suggest an option that satisfies them. Retrieve those preferences through your existing memory.”
4. Collect the new-session retrieval evidence and final suggestion. Join the two sessions' evidence into one report outside the evaluated recall context. Keep pending/awaiting_user while sessions or user turns remain outstanding.

There are deliberately no seed values or answers in this package. Same-conversation recall, copied context, a new scratch-file store or an unverified simulated session cannot establish cross-conversation memory. Cleanup touches only this synthetic persona and happens only when the operator requests it after evidence collection.
