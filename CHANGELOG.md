# Changelog

## [v1.1.1] - 2026-01-24

### Features
- Integrate Cloudflare Turnstile for CAPTCHA verification (cba48b1)
- Unified notice entry in the dashboard and added role-based descriptions (81a1865)

### UI/UX
- Optimize notice card and detail view for both mobile and desktop (207beb6)

### Bug Fixes
- Prevent UI flicker when binding Minecraft account and ensure force-refresh after profile updates (7b9d423)

## [v1.1.0] - 2026-01-22

### Features
- Enhance chat UI with avatars and improve avatar caching mechanism (ed062ba)
- Display and cache Minecraft avatar in profile page (fc0fd53)

### UI/UX
- Remove white border from UserAvatar (b530fb8)

### Bug Fixes
- Fix i18n compilation errors by escaping '@' in email placeholders (60e5145)

### Miscellaneous
- Add CHANGELOG.md (87685ce)

## [v1.0.1] - 2026-01-21

### UI/UX
- Remove online user count from chat interface (ab31f57)

### Refactoring
- Extract styles and layout components (d4571a4)
- Centralize and refine scrollbar styles (af45485)

### Bug Fixes
- Refine Modal component styling and rounded corners (7722c26)
- Use history back navigation when available instead of hard redirect in NoticeDetail (ec194b9)

## [v1.0.0] - 2026-01-20

### Features
- Initial project setup with Vue 3, Vite, and TypeScript
- Implementation of modern UI with glassmorphism and custom animation system (c8b2e49, ed321a4)
- Comprehensive Auth system: Registration, 2FA (TOTP), and Security management (4fd1866, 4e7bc51, 5e187ef)
- Admin Dashboard: User management (Ban/Pardon/Delete) and Audit logs (987acb7, e22b98b, 46599f9)
- Notice Board: Pinned notices with Markdown and KaTeX support (17b6ad3, 5450d3a)
- Responsive Navigation with hamburger menu and localized content (b716b78, bca52e7)
- Reusable component library (Modals, Inputs, Buttons, etc.) (d742ea9)

### Miscellaneous
- Add initial project documentation (95d3654, 2b3de55)
- First commit (ec9ebf1)
