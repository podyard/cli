# Cargo.toml — placeholder

This repository is a **TypeScript / Node.js** CLI. The `Cargo.toml` at the
repository root is a **placeholder only**: it gives Rust tooling (IDEs,
crates.io, `cargo metadata`, dependabot, etc.) a valid crate manifest so the
workspace does not error out, and it documents the name of the project.

It is **not** a real Rust crate:

- `publish = "false"` — it is never published to crates.io.
- The manifest declares no `src/`-style Rust sources and an empty workspace;
  running `cargo build` here is not a supported action.
- There is no Rust code in this repository.

Do not add Rust code or dependencies to this manifest. If a Rust component is
ever introduced, create a dedicated member (e.g. `crates/podyard-native`) and
wire it into the workspace instead of extending this root placeholder.

The supported toolchain for this project is **pnpm** — see `package.json` and
the `Makefile` for all tasks (`make check` runs typecheck + lint + tests).
