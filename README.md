# Trakko 👥

Trakko is a modern, fast, and privacy-focused web application for tracking event attendees. Built with the Fresh framework, it runs on Deno and leverages Deno KV for persistent, zero-configuration data storage. It's designed to be deployed effortlessly on Deno Deploy.

The user interface is designed to be simple, playful, and mobile-first, featuring a neo-brutalist inspired look with both light and dark modes.

## ✨ Features

- **Simple Event Creation**: Create a new event in seconds with a name and custom participant categories.
- **Unique Sharable Links**: A unique, easy-to-share link is generated for each event using Crockford's Base32 encoding.
- **Real-time Attendee Tracking**: Quickly register attendees by selecting a category and optionally adding their name and provenance. The ticket number increments automatically.
- **CSV Export**: Export the full list of attendees, including timestamps, names, and categories, to a CSV file at any time.
- **Multi-language Support**: Fully localized in English and Italian.
- **Light & Dark Mode**: Switch between light and dark themes, with your preference saved locally.
- **Mobile-First Design**: A responsive and touch-friendly interface ensures a great experience on any device.

## 🚀 Tech Stack

- **Framework**: [Fresh](https://fresh.deno.dev/)
- **Runtime**: [Deno](https://deno.land/)
- **Database**: [Deno KV](https://deno.land/api@v1.42.4?s=Deno.Kv)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI**: [Preact](https://preactjs.com/)

## 🏁 Getting Started

### Prerequisites

Make sure you have [Deno](https://deno.land/#installation) installed on your system.

### Running Locally

1.  Clone the repository:
    ```sh
    git clone https://github.com/alesanfra/trakko.git
    cd trakko
    ```

2.  Start the development server:
    ```sh
    deno task start
    ```

The application will be available at `http://localhost:8000`.

## 🤝 Contributing

Contributions are welcome! If you'd like to help improve Trakko, please feel free to fork the repository and submit a pull request.

When contributing, please follow these simple rules:

### Commit Messages

All commit messages **must** adhere to the [**Conventional Commits**](https://www.conventionalcommits.org/en/v1.0.0/) specification. This is crucial for maintaining a clear and understandable commit history.

- Use types like `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`, etc.
- Example: `feat: add light and dark mode switcher`
- Example: `fix: correct CSV export format`
