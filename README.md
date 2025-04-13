# SilentEcho - Secure Anonymous Messaging and Encrypted Notes Platform

SilentEcho is a secure web application offering two core privacy-focused features: anonymous messaging and password-encrypted notes. The platform prioritizes user privacy with client-side encryption for notes and anonymous communication channels, complemented by secure authentication and a user-friendly interface.

## 🚀 Features

- **Encrypted Notes**: Create, share, and manage password-encrypted notes with end-to-end client-side encryption using AES-GCM and PBKDF2. Ensuring that only someone with the correct password can decrypt and read it. No plaintext note content is ever stored on the server, preserving full confidentiality. Notes can optionally have expiration times and are shared via unique URLs.
- **Anonymous Messages**: Receive and manage anonymous messages without revealing your identity to the sender. Share a public link through which anyone can send you messages, fostering open communication while maintaining privacy. These messages are stored securely and managed privately by the recipient.
- **Authentication & Authorization**: Secure user authentication and authorization powered by NextAuth.js.
- **Email Verification**: Implemented secure email verification workflows using Nodemailer to enhance account security.
- **Responsive Design**: User-friendly and responsive dashboard built with shadcn/ui components and styled with TailwindCSS.
- **Database**: MongoDB for reliable and scalable data storage for user data and messages.

## ⚙️ Architecture

SilentEcho is built using a modern web architecture with the following key components:

- **Frontend**: Developed with Next.js using the App Router for a dynamic and efficient user interface. Styled with TailwindCSS and utilizing shadcn/ui components for a consistent and accessible design.
- **Backend (Anonymous Messages)**: The anonymous messaging feature is primarily handled through API routes within the Next.js application. These routes manage the secure storage and retrieval of anonymous messages in MongoDB.
- **Backend (Encrypted Notes)**: The encrypted notes feature utilizes a separate backend server built with Golang and the Gin web framework. This backend is responsible for securely storing and retrieving the encrypted note data from MongoDB. The actual encryption and decryption of notes are performed entirely client-side in the user's browser using the Web Crypto API (AES-GCM and PBKDF2).
- **Authentication**: NextAuth.js is integrated for secure authentication and session management.
- **Email Verification**: Secure email verification workflows implemented using Nodemailer for sending verification emails.
- **Database**: MongoDB serves as the primary database for storing user accounts, anonymous messages, and encrypted note metadata.

## 🌐 Live Demo

Explore the live app: [SilentEcho](https://silentecho.vercel.app/)

---

Built with ❤️ by [Rohit](https://github.com/rohits-web03).