
// IMPORTANT: This file now uses Mongoose for MongoDB connection,
// replacing the previous native MongoDB driver setup.
// Existing data fetching logic in the app that used getDb() or specific
// collection getters from the old mongodb.ts will need to be refactored
// to use Mongoose or a new Mongoose-based helper.

import mongoose from "mongoose";

const { MONGODB_URI, MONGODB_DB_NAME } = process.env;

if (!MONGODB_URI) {
  throw new Error(
    'Invalid/Missing environment variable: "MONGODB_URI". Please check your .env.local file.'
  );
}

if (!MONGODB_DB_NAME) {
  throw new Error(
    'Invalid/Missing environment variable: "MONGODB_DB_NAME". Please specify your database name in .env.local (e.g., ngonpo1).'
  );
}

// Cache an existing connection or promise to it (this is for serverless functions)
let cachedClient: typeof mongoose | null = null;

export const connectDB = async () => {
  if (cachedClient && cachedClient.connection.readyState === 1 && cachedClient.connection.name === MONGODB_DB_NAME) {
    // console.log("Using cached Mongoose connection to DB:", cachedClient.connection.name);
    return cachedClient;
  }

  // If there's a cached client but it's for a different DB (e.g., env var changed), disconnect and reconnect
  if (cachedClient && cachedClient.connection.readyState === 1 && cachedClient.connection.name !== MONGODB_DB_NAME) {
    console.warn(`Cached Mongoose connection was for DB '${cachedClient.connection.name}', but now targeting '${MONGODB_DB_NAME}'. Reconnecting.`);
    await mongoose.disconnect().catch(err => console.error("Error disconnecting old Mongoose connection:", err));
    cachedClient = null;
  }


  try {
    // console.log(`Attempting new Mongoose connection to DB: ${MONGODB_DB_NAME} via URI: ${MONGODB_URI.substring(0, MONGODB_URI.indexOf('@') > 0 ? MONGODB_URI.indexOf('@') : MONGODB_URI.length)}...`);
    console.log(`Attempting new Mongoose connection to DB: ${MONGODB_DB_NAME}...`);
    const client = await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB_NAME, // Explicitly set the database name
    });
    
    if (client.connection.readyState === 1) {
      console.log("Mongoose connected successfully to DB:", client.connection.name);
      cachedClient = client;
      return client;
    } else {
      console.error("Mongoose connection readyState is not 1. State:", client.connection.readyState);
      throw new Error("Mongoose connection failed, readyState not 1");
    }
  } catch (error) {
    console.error("Mongoose connection error:", error);
    // More detailed error logging
    if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        if (error.stack) {
            console.error("Error stack:", error.stack);
        }
    }
    throw error; // Rethrow or handle as needed
  }
};


// Example of how you might close the connection (less common in serverless)
export const closeConnection = async () => {
  if (cachedClient) {
    try {
      await cachedClient.disconnect();
      console.log("Mongoose connection closed successfully.");
    } catch (e) {
      console.error("Error closing Mongoose connection:", e);
    } finally {
      cachedClient = null;
    }
  }
};
