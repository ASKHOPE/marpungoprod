
import dotenv from 'dotenv';
// Load environment variables from .env.local FIRST
dotenv.config({ path: '.env.local' });

// Updated to use Mongoose connectDB and closeConnection
import { connectDB, closeConnection } from './lib/mongodb'; 
import mongoose from 'mongoose';

async function testDbConnection() {
  console.log('Starting Mongoose database connection test...');
  try {
    const mongooseInstance = await connectDB(); // connectDB now returns the mongoose instance
    
    if (mongooseInstance.connection.readyState === 1) {
      console.log(`Successfully connected to MongoDB using Mongoose! Database: ${mongooseInstance.connection.db.databaseName}`);
      
      // Listing collections with Mongoose
      const collections = await mongooseInstance.connection.db.listCollections().toArray();
      if (collections.length > 0) {
        console.log('Available collections:', collections.map(c => c.name));
      } else {
        console.log('No collections found in the database (this might be expected if new).');
      }

      // Example: Check if User model is registered and can be queried (optional test)
      try {
        const User = mongoose.model('User'); // Accessing the already registered User model
        const userCount = await User.countDocuments();
        console.log(`Found ${userCount} documents in 'users' collection (via Mongoose User model).`);
      } catch (modelError: any) {
        if (modelError.name === 'MissingSchemaError') {
          console.warn("User model not registered yet or accessed incorrectly. This might be okay if models are registered on-demand by their specific files.");
        } else {
          console.warn("Could not query 'users' collection via Mongoose User model:", modelError.message);
        }
      }

    } else {
      console.error('Mongoose connection readyState is not 1. Current state:', mongooseInstance.connection.readyState);
      throw new Error('Mongoose connection failed.');
    }

  } catch (error) {
    console.error('Database connection test FAILED:', error);
    process.exit(1); // Exit with error code if connection fails
  } finally {
    await closeConnection(); // Uses Mongoose's disconnect
    console.log('Database connection test finished and Mongoose connection closed.');
  }
}

testDbConnection();
