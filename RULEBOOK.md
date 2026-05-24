# FreightFlow SaaS — Development & Implementation Rulebook

## 1. General Principles

1. **Refer to the Project Blueprint Before Every Change**

   * Always check the latest project documentation (`/docs`) , all folders and  md files and wireframes in `/design` before implementing.
   * Confirm feature requirements, interactions, and UI/UX specifications.

2. **Check Existing Features**

   * Before adding or modifying functionality, search the codebase for existing implementations to avoid duplication.
   * Reuse components, functions, and modules wherever possible.

3. **Dynamic Page Creation**

   * Favor dynamic and reusable page templates over hardcoding.
   * Use parameters, props, and configurations for different roles (Shipper, Transporter, Admin).

4. **Prevent Infinite Loops**

   * Always include proper exit conditions in loops.
   * Test data-driven loops and recursive functions with edge cases.

5. **Coding Standards**

   * Consistent naming conventions for files, folders, variables, and functions.
   * Prefer clear, descriptive names.
   * Use TypeScript types/interfaces where applicable.

---

## 2. Git & Version Control Rules

1. **Commit Discipline**

   * Commit after each completed implementation, bug fix, or UI change.
   * Use descriptive commit messages.

2. **Branching Strategy**

   * `main` — production-ready
   * `develop` — integrated features for testing
   * Feature branches: `feature/<feature-name>`
   * Bugfix branches: `bugfix/<issue>`

3. **File Naming in Commits**

   * Always mention the modified or added file(s) in commit messages.

4. **Code Review**

   * Every feature or significant change must be peer-reviewed before merging.

---

## 3. Implementation Workflow

1. **Pre-Implementation Checklist**

   * Review blueprint, wireframes, and Figma prompt.
   * Identify components to reuse.
   * Verify feature dependencies.

2. **Development Steps**

   1. Create/update component or page.
   2. Write unit tests.
   3. Ensure responsive design and accessibility.
   4. Check interactions against UX rules.
   5. Commit changes with descriptive message.

3. **Post-Implementation Checklist**

   * Run build and test locally.
   * Verify no code duplication or dead code.
   * Validate dynamic page behavior.
   * Confirm links, routes, and APIs work.

---

## 4. Code Reusability Rules

1. **Componentization**

   * Split UI into reusable, single-purpose components.

2. **Avoid Hardcoding**

   * Data-driven rendering from props or API responses.
   * Use constants and configuration files for repeated values.

3. **DRY Principle**

   * Consolidate similar logic into shared utilities or hooks.

---

## 5. Git Command Reference for Workflow

```bash
# Stage changes
git add <file-path>       # stage individual file

# Commit with descriptive message
git commit -m "feat(shipper-dashboard): add load status update modal"

# Push feature branch
git push origin feature/<feature-name>

# Create pull request for review
# Merge only after approvals
```

---

## 6. Continuous Reference Checklist

| Step | Check |
|------|-------|
| Before coding | Read relevant docs/ and design/ files |
| Before adding | Search codebase for existing implementation |
| During coding | TypeScript types, DRY, no hardcoding |
| After coding | Build passes, routes work, no dead code |
| Before commit | Descriptive message, correct branch |
| Before merge | PR review, tests pass |

---

## 7. Role-Specific Considerations

| Role        | Key Checks                                                                 |
| ----------- | -------------------------------------------------------------------------- |
| Shipper     | Post loads, track shipments, confirm deliveries                            |
| Transporter | Accept/reject loads, update status, route visualization                    |
| Admin       | Multi-tenant management, analytics, system alerts, subscription management |

---

**This rulebook ensures every team member follows the same professional standards and that all implementations are traceable, reusable, and fully aligned with the FreightFlow SaaS blueprint.**
