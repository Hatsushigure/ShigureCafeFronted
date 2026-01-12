# Shigure Cafe Frontend Application

A modernized, high-performance user management interface for ShigureCafe, designed with a focus on aesthetics, security, and a premium user experience.

## Core Features

*   **Premium UI/UX Design:**
    *   **Glassmorphism:** Elegant use of backdrop blurs, gradients, and refined shadows.
    *   **Tailwind CSS 4.0:** Leveraging the latest CSS-in-JS and utility-first styling capabilities.
    *   **Animations:** Smooth transitions and interactive elements using modern CSS and Vue transitions.
*   **Security Features:**
    *   **2FA Management:** Dedicated security view for enabling/disabling Email 2FA and TOTP (Authenticator App).
    *   **Secure Routing:** Advanced route guards for `GuestOnly`, `RequiresAuth`, and `RequiresAdmin` levels.
    *   **Session Persistence:** Secure JWT handling via Pinia stores and localStorage.
*   **Interactive Notice Board:**
    *   **Markdown Rendering:** Full support for Markdown formatting in announcements.
    *   **Mathematical Support:** Integrated **KaTeX** for high-quality mathematical expression rendering.
    *   **Emoji Reactions:** Interactive reaction system with an elegant emoji picker for user engagement.
    *   **Management Suite:** Administrative tools for creating, editing, pinning, and deleting notices.
*   **Administrative Dashboard:**
    *   **User Management:** Real-time search, role editing, and account status control.
    *   **Audit Center:** Interface for tracking registration requests and managing user approval workflows.
    *   **Notice Management:** Dedicated editor for system-wide announcements with pinning capabilities.
*   **User Tools:**
    *   **Minecraft Integration:** Dedicated interface for binding Minecraft accounts via Microsoft OAuth2.
    *   Personalized Dashboard with quick-action cards.
    *   Profile customization (Nicknames, Security settings).
    *   Responsive Toast notification system.

## Technical Stack

*   **Framework:** Vue 3.5.24 (Composition API)
*   **Build Tool:** Vite 7.2.4
*   **Language:** TypeScript 5.9.3
*   **Styling:** Tailwind CSS 4.1.18
*   **State Management:** Pinia 3.0.4
*   **Routing:** Vue Router 4.6.4
*   **Content Processing:**
    *   **Marked:** Fast Markdown parser.
    *   **Marked-KaTeX:** Extension for TeX/LaTeX math rendering.
*   **Icons:** Lucide Vue Next
*   **QR Codes:** qrcode.vue (for 2FA setup)

## Project Structure

```text
src/
├── api/                # Axios instance and API service definitions
├── assets/             # Static assets (images, global styles)
├── components/         # Reusable UI components (Buttons, Inputs, Modals)
├── router/             # Vue Router configuration and guards
├── stores/             # Pinia state management (Auth, Toast, Notices)
├── types/              # TypeScript interfaces and declarations
├── utils/              # Helper functions and formatters
└── views/              # Page components (Dashboard, Login, Admin panels)
```

## Getting Started

### Prerequisites

*   **Node.js** (v20+ recommended)
*   **npm** or **pnpm**

### Installation

```bash
npm install
```

### Development

```bash
# Starts development server on port 3000
npm run dev
```

### Build

```bash
# Type-check and build for production
npm run build
```
