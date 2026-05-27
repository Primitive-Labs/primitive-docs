# Primitive Docs

Documentation site for the Primitive platform, built with VitePress.

## Project Structure

- `docs/` — User-facing documentation (VitePress markdown)
- `guides/latest/` — Agent-facing guides (consumed by `primitive guides get`)
- `library_repos/` — Git submodules for source-of-truth library code

## Guide Sync Rule

All changes to user-facing docs (`docs/`) must also be reflected in the corresponding agent-facing guide (`guides/latest/`), and vice versa. The tone and level of detail will differ — user docs are tutorial-style, agent guides are reference-dense — but the content must stay in sync. When updating either side, always check and update the other.
