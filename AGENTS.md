<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Engineering Guidelines

## Very Important

- Do not run tsc validation on small changes or code implimentations, wait for me to do it

## Code Reuse & Modularity

- **Search first**: Check existing components, hooks, utilities, and types before writing new ones; extend rather than duplicate.
- **Single Responsibility**: Keep functions, hooks, and components small, focused, and single-purpose.
- **Composition over abstraction**: Prefer composition over duplication; avoid premature generalization, extra wrapper layers, or speculative abstractions.
- **Colocation**: Keep tightly coupled logic together; do not scatter cohesive logic across excessive files.
- **Layering**: Separate UI, domain logic, data access, and state management cleanly.

## Simplicity & Clean Code

- **KISS**: Deliver the simplest working implementation meeting the requirements.
- **Minimal interfaces**: Keep props, function parameters, and state minimal and tightly typed.
- **Flat control flow**: Avoid deeply nested conditionals and excessive branching; use early returns and guard clauses.
- **Clarity**: Use descriptive, consistent naming and idioms standard to the codebase.
- **Dead code**: Eliminate unused imports, variables, unreachable branches, and redundant state immediately.

## Performance & Optimization

- **Targeted optimization**: Optimize rendering, network calls, and expensive computations only when obvious or measured; avoid premature micro-optimizations.
- **State locality**: Keep state as close as possible to where it is consumed to avoid unnecessary re-renders.

## Refactoring & Scope Discipline

- **Preserve behavior**: Maintain existing contracts and behavior during refactoring unless explicitly instructed otherwise.
- **Strict scope**: Modify only files directly related to the task; never make drive-by modifications to untouched code.
