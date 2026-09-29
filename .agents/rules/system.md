---
trigger: always_on
description: System-wide first-principles and native capability rules
---

# First-Principles Problem Solving & Simplicity

- **Question code existence before optimizing**: When facing an inefficient transformation, abstraction, or adapter, NEVER start by optimizing the transformation. First ask: _Why does this transformation exist at all? Can the producer or consumer natively handle the data without any intermediate layer?_
- **Check framework/library native capabilities first**: Verify if the underlying library already has native features specifically designed for the problem before writing custom sorting, hashing, or memoization logic.
- **Delete over patch**: Prefer ripping out entire layers of boilerplate/glue code over optimizing micro-algorithms inside unnecessary wrappers.
