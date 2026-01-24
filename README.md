# Shigure Cafe Frontend

A modern user management interface built with Vue 3 and Tailwind CSS 4.

## 🚀 Tech Stack

- **Framework**: [Vue 3.5](https://vuejs.org/) (Composition API)
- **Build**: [Vite 7.2](https://vitejs.dev/) & [TypeScript 5.9](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4.1](https://tailwindcss.com/)
- **State**: [Pinia 3.0](https://pinia.vuejs.org/)
- **Routing**: [Vue Router 4.6](https://router.vuejs.org/)
- **i18n**: [Vue I18n 11.2](https://vue-i18n.intlify.dev/)
- **Misc**: [Lucide Icons](https://lucide.dev/), [KaTeX](https://katex.org/)

## ✨ Core Features

- **Game Sync**: Bidirectional real-time chat sync with Minecraft servers.
- **Security**: TOTP/Email 2FA, Microsoft OAuth2, and **Cloudflare Turnstile CAPTCHA**.
- **Notices**: Markdown & KaTeX support with reactions and read tracking.
- **Admin**: User management, registration audits, and system monitoring.
- **Multi-language**: Built-in support for English and Chinese.

## 🛠️ Getting Started

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and adjust for your environment:

```env
VITE_API_PROXY_TARGET=http://localhost:8080
VITE_WS_PROXY_TARGET=ws://localhost:8080
VITE_ALLOWED_HOSTS=localhost
VITE_TURNSTILE_SITE_KEY=your_site_key_here
```

### Development

```bash
# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📂 Project Structure

- `src/api`: API service definitions
- `src/components`: Reusable UI components
- `src/stores`: Pinia state management
- `src/views`: Page components
- `src/utils`: Helpers and cache logic