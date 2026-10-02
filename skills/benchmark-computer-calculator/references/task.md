# 4. computer-calculator
Prompt: Use a relevant desktop workflow skill from your own existing skill library. Open the operating system's Calculator app, calculate 137 × 29 using that app, inspect the displayed result, and report it. Do not edit other apps or files.

Required checks:
- `playbook-loaded`: Evidence that a relevant existing skill was loaded through the harness's normal skill mechanism, including its name. A document read alone is unverified.
- `desktop-input`: Trace shows opening Calculator and entering the expression with desktop input tools.
- `display-observed`: Screenshot or native accessibility observation shows Calculator's result after input.
- `answer-matches`: Final answer matches the displayed result and the requested multiplication.

Record the OS and Calculator app used. If no desktop tools exist, report unsupported. If tools exist but permissions or Calculator availability prevent execution, report blocked. A correct number alone is insufficient evidence of computer use. Verification may independently check arithmetic after the desktop attempt, but code execution must not replace the app workflow.
