# SilentNotes Go Server

This is a lightweight Go microservice that powers encrypted note creation and sharing for the **SilentEcho** project.

Authenticated users can create encrypted notes by providing a **password or encryption key** during creation. The note is encrypted client-side using this password, and **only the encrypted content (ciphertext)** is stored in the MongoDB database — **the password/key is never stored**. A shareable link is generated for each encrypted note.

These encrypted notes can then be shared via the generated link. The recipient (who doesn't need to be authenticated) can decrypt and view the note **only if they know the correct password**.

The service integrates seamlessly with the main SilentEcho Next.js application and uses the Gin web framework and MongoDB for persistence.

---

## Features

- Logged-in users can create encrypted notes by providing a password
- Only encrypted content is stored; passwords/keys are never saved
- Each note has a shareable link for secure access
- Notes can be shared with anyone — as long as they have the link and the correct password, they can decrypt and read it
- Optional expiration support for notes
- Clean REST API powered by Gin
- MongoDB integration for persistence

---

## Setup Instructions

### Prerequisites

- Go 1.18 or higher installed
- MongoDB instance (local or cloud, e.g., MongoDB Atlas)
- Git (to clone the repo)

---

### Steps to Run Locally

1. **Clone the repo and navigate to the server folder:**

   ```bash
   git clone https://github.com/rohits-web03/SilentEcho.git
   cd SilentEcho/notes_server
   ```

2. **Initialize Go modules (if not already):**

   ```bash
   go mod tidy
   ```

3. **Create a `.env` file with the MongoDB URI:**

   ```
   MONGO_URI=mongodb://localhost:27017
   DB_NAME=silentechoDB (optional)
   ```

4. **Run the server:**

   ```bash
   go run main.go
   ```

   Or use [Air](https://github.com/air-verse/air) for hot reload during development:

   ```bash
   air
   ```

