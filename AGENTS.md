# Agent Onboarding Guide

Welcome to the **car-erp** workspace. Before you make changes, please follow the checklist below to stay aligned with the project conventions documented throughout the repository.

## 1. Understand the architecture
- Backend: Laravel 12 application with Spatie Permission, Inertia, Artisan commands, and domain-specific services.
- Frontend: React 19 + TypeScript single-page app bootstrapped through Inertia, built with Vite and Tailwind CSS v4, and using Radix-based UI primitives.
- Shared docs: `IMPLEMENTATION_STANDARDS.md` and the collection of module playbooks (for example `TEST_DRIVE_IMPLEMENTATION_SUMMARY.md`) describe cross-cutting patterns such as branch isolation, audit logging, and UI norms. Review the relevant markdown guide before touching a feature area.

## 2. Scoping instructions
- This `AGENTS.md` applies to the entire repository unless a more specific `AGENTS.md` exists deeper in the tree.
- Honor existing architectural patterns: branch scoping traits, soft deletes, activity logging, and Inertia shared props must be preserved when editing backend code.
- Keep React contributions consistent with `resources/js/components/ui` primitives and hooks such as `use-appearance`.

## 3. Coding practices
- Backend PHP code follows Laravel conventions; avoid introducing custom service containers or helpers when a framework primitive exists.
- React components should stay type-safe: ensure props are typed, hooks are imported from their shared modules, and Tailwind classes reuse design tokens already present in the codebase.
- Never wrap imports in `try/catch` and prefer repository utilities (e.g., form helpers, request validators) over ad-hoc logic.

## 4. Testing & quality
- Use the Composer/NPM scripts defined in `composer.json` and `package.json` (`composer test`, `npm run lint`, etc.) to validate your changes.
- Include the commands you ran and their outcomes in your final response, prefixed with the required emoji indicators.

## 5. PR messaging
- Follow the system instructions for PR creation: after committing changes, run the `make_pr` tool with a descriptive title and summary of the modifications.

Keep this guide handy while working— it complements the existing implementation summaries and should help you ramp up quickly. Good luck!
