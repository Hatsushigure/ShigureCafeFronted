# Shigure Cafe Frontend Application

A modernized, high-performance user management interface for "ShigureCafe, designed with a focus on aesthetics and user experience.

## Core Features

*   **Modern UI/UX Design:**
    *   **Glassmorphism Aesthetic:** Utilizes backdrop blurs, gradients, and a unified color palette for a premium feel.
    *   **Fluid Animations:** Staggered entry animations, hover scale effects, and smooth page transitions.
    *   **Typography:** Standardized on Google Noto Sans/SC for global readability and Google Sans Code for monospace content.
*   **Interactive Dashboard:**
    *   Personalized greetings using user nicknames.
    *   Quick Action cards for Profile, Security, and Admin tools.
    *   Dynamic system announcements.
*   **Comprehensive Management Suite:**
    *   **User Management:** Interactive table with custom-animated role selectors and multi-stage deletion confirmation.
    *   **Audit Center:** Dedicated interface for administrators to track and approve pending registrations.
*   **Security & UX Enhancements:**
    *   Optimistic UI patterns for verification codes with automated countdowns.
    *   Strict validation for sensitive forms (e.g., password confirmation).
    *   Robust Z-index hierarchy for consistent UI layering (Toasts > Modals > Nav).

## Technical Stack

*   **Framework:** Vue 3.5.24 (Composition API)
*   **Build Tool:** Vite 7.2.4
*   **Language:** TypeScript 5.9.3
*   **Styling:** Tailwind CSS 4.1.18
*   **State Management:** Pinia 3.0.4
*   **Routing:** Vue Router 4.6.4
*   **HTTP Client:** Axios 1.13.2
*   **Icons:** Lucide Vue Next 0.562.0

## Getting Started

### Prerequisites

*   **Node.js** (LTS recommended)
*   **npm** or **yarn**

### Installation

1.  Clone the repository.
2.  Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Build

Compile and minify for production:

```bash
npm run build
```