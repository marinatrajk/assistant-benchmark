---
name: remember-preferences
description: Recall user preferences and update durable memory without retaining contradictory facts.
---
1. Search memory for the preference the user mentions.
2. If a matching preference exists, use its memory ID to update it with memory_save.
3. Otherwise, save a concise new entry. Store only information the user asked you to remember.
4. Search again to verify the new value. Remove duplicate obsolete entries if they contradict the requested update.
5. Briefly tell the user what changed.
