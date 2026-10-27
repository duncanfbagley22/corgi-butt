---
name: codebase-audit
description: Audits the existing codebase for dead code, unused dependencies, and outdated packages before upgrading.
---

## Execution Steps

1. **Dependency Check:** Scan `package.json` for unused, bloated, or deprecated packages.
2. **Dead Code Detection:** Identify unused components, orphan utility functions, and unreferenced assets.
3. **Upgrade Path:** Map out required breaking-change migrations before altering any configuration files.
4. **Verification:** Ensure type integrity and build consistency after removing dead code.