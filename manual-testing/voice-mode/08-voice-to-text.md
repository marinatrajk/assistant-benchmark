# V08 — Voice-to-text continuity

**Purpose:** Does the same conversation retain a corrected voice request when the user switches to text?

## Steps

1. In voice mode, say: **“Make a shopping list with milk, coffee and apples. Just keep the list in this conversation.”**
2. After acknowledgment, say: **“Replace apples with pears.”** Wait for acknowledgment.
3. End voice mode. In the **same conversation**, type: **“Show me the final shopping list.”** Do not repeat its contents.

## Pass criteria

- The text answer contains exactly **milk, coffee and pears** as the shopping items; order and capitalization do not matter.
- Apples is not retained as a current item. A clearly labeled historical explanation is acceptable.
- No reseeding or copying of the earlier list is needed, and no external shopping-list app is modified.

**Partial:** It recovers the correct list only after asking you to repeat an item or the correction. Record the intervention verbatim.

**Failed:** The final list remains wrong, loses the correction, adds extra items, or performs an unrequested external action. If the product cannot switch between voice and text within one conversation, record unsupported.

**Evidence:** Voice turns/acknowledgments, same-conversation identity and final text answer. This measures continuity within one conversation, not durable memory across new conversations.
