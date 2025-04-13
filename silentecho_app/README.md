# SilentEcho Web Application

This application is built with Next.js and handles the frontend user interface, user authentication, email verification, and the backend logic for the anonymous messaging feature.

## 🛠️ Technologies

- [Next.js](https://nextjs.org/) - React framework for building web applications.
- [NextAuth.js](https://next-auth.js.org/) - Authentication library for Next.js.
- [MongoDB](https://www.mongodb.com/) - NoSQL database for storing application data.
- [Nodemailer](https://nodemailer.com/about/) - Library for sending emails (used for email verification).
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework for styling.
- [shadcn/ui](https://ui.shadcn.com/) - Reusable UI components built using Radix UI and Tailwind CSS.

## ⚙️ Prerequisites

Before running the application, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version >= 18 recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) package manager
- [MongoDB](https://www.mongodb.com/try/download/community) - Ensure you have a MongoDB instance running.

## ⬇️ Cloning the Repository

To clone the SilentEcho repository to your local machine, use the following command:

```bash
git clone https://github.com/rohits-web03/SilentEcho
```

## Installation

1. Navigate to the `silentecho_app` directory:
   ```bash
   cd silentecho_app
   ```

2. Install the dependencies using npm or yarn:
   ```bash
   npm install
   # or
   yarn install
   ```

## Running the Application

To start the Next.js development server, run the following command:

```bash
npm run dev
# or
yarn dev
```

Open your browser and navigate to `http://localhost:3000` to view the application.