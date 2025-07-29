
# Marpu NGO - Community Engagement Platform
## Video Demonstration of the Project
- https://youtu.be/vdtHkYny6l8

Marpu NGO is a Next.js application designed to foster community engagement, manage events, facilitate donations, and coordinate volunteer efforts. It features a user-friendly interface for public users and a comprehensive admin dashboard for managing the platform's content and operations.

## Features

- **Public-Facing Site:**
  - Home, About Us, Events, Donate, and Volunteer pages.
  - Dynamic theme switcher (day, night, system).
  - User registration and login.
- **Admin Dashboard (`/admin`):**
  - Secure access for admin users.
  - Management panels for:
    - Events (CRUD operations, archiving)
    - Volunteer Opportunities (CRUD operations)
    - Contact Submissions (view, manage status)
    - Donation Projects (CRUD, Stripe integration for payment links)
    - Volunteer Applications (view, manage status)
    - User Management (view, edit roles, delete users)
  - Statistics and recent activity overview.
- **Database:** MongoDB with Mongoose ODM.
- **Authentication:** NextAuth.js for credential-based authentication.
- **Styling:** Tailwind CSS with ShadCN UI components.
- **Payments:** Stripe integration for donation projects.

## Prerequisites

- Node.js (v18.x or later recommended)
- npm or yarn
- MongoDB (local instance or cloud-hosted like MongoDB Atlas)
- Stripe Account (for donation functionality)

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <your-repository-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of your project by copying the `.env.example` file (if one exists) or by creating a new one. Add the following environment variables:

```env
# MongoDB
MONGODB_URI="your_mongodb_connection_string"
MONGODB_DB_NAME="your_database_name" # e.g., marpungo_db

# NextAuth
AUTH_SECRET="your_random_strong_secret_for_nextauth" # Generate a strong secret
# NEXTAUTH_URL="http://localhost:3000" # Required for production, helpful for dev

# Stripe (Optional, for donations)
STRIPE_SECRET_KEY="sk_your_stripe_secret_key"
NEXT_PUBLIC_STRIPE_GENERAL_DONATION_LINK="plink_your_stripe_payment_link_for_general_donations" # Optional general donation link

# Application URL (Important for various links, including Stripe success redirect)
NEXT_PUBLIC_APP_URL="http://localhost:3000"



**Notes:**

- Replace placeholder values with your actual credentials and settings.
- `AUTH_SECRET` can be generated using `openssl rand -hex 32` in your terminal.
- For `NEXTAUTH_URL`, use `http://localhost:3000` for local development. For production, use your deployed application's URL.
- The `NEXT_PUBLIC_STRIPE_GENERAL_DONATION_LINK` is an optional Stripe Payment Link you can create in your Stripe dashboard for general donations not tied to specific projects.
- `NEXT_PUBLIC_APP_URL` is crucial for generating correct redirect URLs, especially for Stripe.

### 4. Seed the Database (Optional)

If you want to populate your database with initial sample data:

```bash
npm run seed
```

This script will clear existing data in specified collections and insert sample documents. Review `src/scripts/seed.ts` for details.

### 5. Run the Development Server

```bash
npm run dev
```

The application should now be running on `http://localhost:3000`.

## Available Scripts

- `npm run dev`: Starts the Next.js development server (usually on port 3000).
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the Next.js production server (after building).
- `npm run lint`: Lints the codebase using Next.js's built-in ESLint configuration.
- `npm run typecheck`: Runs TypeScript type checking.
- `npm run seed`: Seeds the database with sample data (see `src/scripts/seed.ts`).
- `npm run test:db`: Tests the database connection (see `src/test-db.ts`).

## Admin Panel

- Access the admin panel at `/admin`.
- The first user registered will automatically be an **admin**. Subsequent users will be regular **users**.
- Admin users can manage events, volunteer opportunities, contact messages, donation projects, volunteer applications, and users.

## Docker Setup

A `Dockerfile` and `.dockerignore` are provided to build and run the application in a Docker container.

### Build the Docker Image

From the project root:

```bash
docker build -t marpu-ngo-app --build-arg NEXT_PUBLIC_APP_URL="http://localhost:3000" .
```

- Replace `marpu-ngo-app` with your desired image name if needed.
- The `--build-arg NEXT_PUBLIC_APP_URL` is important if your application relies on this variable during the build phase. For production, use your production URL.

### Run the Docker Container

```bash
docker run -p 3000:3000 \
  -e MONGODB_URI="your_mongodb_connection_string" \
  -e MONGODB_DB_NAME="your_database_name" \
  -e AUTH_SECRET="your_nextauth_secret" \
  -e STRIPE_SECRET_KEY="your_stripe_secret_key" \
  -e NEXT_PUBLIC_STRIPE_GENERAL_DONATION_LINK="plink_your_stripe_payment_link_for_general_donations" \
  -e NEXT_PUBLIC_APP_URL="http://localhost:3000" \
  marpu-ngo-app
```

- Replace placeholder values with your actual environment variables.
- The `-p 3000:3000` maps port 3000 on your host to port 3000 inside the container (where the Next.js app runs in production mode by default).
- For production, ensure `NEXT_PUBLIC_APP_URL` is set to your public domain.

## Technologies Used

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **UI:** React, ShadCN UI, Tailwind CSS
- **Database:** MongoDB with Mongoose
- **Authentication:** NextAuth.js
- **Payments:** Stripe (for donations)
- **Containerization:** Docker

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

End Of Purpose Will Be Terminated after its pusporsed is fulfilled.
