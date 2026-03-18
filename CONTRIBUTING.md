# Contributing to HireME

Welcome to the HireME project! We're excited to have you here. This guide will help you get started with contributing to the repository.

## 🚀 Getting Started

1.  **Fork the repository** (if you're an external contributor).
2.  **Clone your fork**:
    ```bash
    git clone https://github.com/darknecrocities/HireME.git
    cd HireME
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Set up environment variables**:
    Create a `.env` file in the root directory and add your Firebase and Gemini API keys as shown in the `.env.example` (or as provided by the lead developer).

## 🌳 Branching Strategy

We use a simple branching strategy:
-   `main`: The production-ready branch. Only stable code should be here.
-   `develop`: The main development branch. All feature branches should merge into here.
-   `feature/*`: For new features or enhancements.
-   `bugfix/*`: For fixing reported bugs.

To create a new feature branch:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

## 📂 Project Structure

Please follow the existing project structure:

-   `src/assets`: Images, icons, and static assets.
-   `src/components`: Reusable UI components (buttons, cards, etc.).
-   `src/hooks`: Custom React hooks for logic reuse.
-   `src/pages`: Main application pages/routes.
-   `src/services`: External service integrations (Firebase, Gemini API).
-   `src/types`: TypeScript interfaces and type definitions.
-   `src/utils`: Helper functions and shared utilities.

## 💎 Design Consistency

We prioritize a **premium, high-tech aesthetic**:
-   Use **Glassmorphism** where appropriate (blur, semi-transparent backgrounds).
-   Stick to the dark-blue color palette.
-   Use **Framer Motion** for smooth, professional animations.

## 🛠️ Development Workflow

1.  Keep your components focused and reusable.
2.  Use functional components and React hooks.
3.  Ensure your code is well-commented and follows TypeScript best practices.
4.  Before submitting a PR, ensure the project builds successfully:
    ```bash
    npm run build
    ```

## 📬 Submitting Changes

1.  Commit your changes with clear, descriptive messages.
2.  Push your branch to your fork or origin.
3.  Submit a Pull Request (PR) to the `develop` branch.
4.  Participate in the code review process.

Thank you for helping us make HireME even better! 🚀
