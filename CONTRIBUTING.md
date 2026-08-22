# Contributing to FLOW

Use Issues to propose work and submit focused pull requests for owner-controlled integration.

Phase/round implementation work must follow `docs/07-delivery/development-phases/README.md` and `docs/07-delivery/development-phases/FLOW_MERGE_POLICY.md`.

Current `main` is the authority source for policy and executable round specifications. Each new round creates a new short round branch from the latest round implementation branch, not from `main`, unless no prior round branch exists in the active chain.

The development agent creates/updates round branches and PRs only. It must not merge implementation PRs or enable automatic merge. Direct pushes to `main` remain prohibited.