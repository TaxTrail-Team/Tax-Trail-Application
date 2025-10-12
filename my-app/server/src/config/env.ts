import dotenv from "dotenv";
import path from "path";

// Load .env from the root of the project directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });


export const ENV = {
  PORT: process.env.PORT || "3001",

  GROQ_API_KEY: process.env.GROQ_API_KEY || "",

  APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT || "",
  APPWRITE_PROJECT_ID: process.env.APPWRITE_PROJECT_ID || "",
  APPWRITE_PROJECT_NAME: process.env.APPWRITE_PROJECT_NAME || "",
  APPWRITE_API_KEY: process.env.APPWRITE_API_KEY || "",
  APPWRITE_DB_ID: process.env.APPWRITE_DB_ID || "",
  APPWRITE_TAXES_COLLECTION_ID: process.env.APPWRITE_TAXES_COLLECTION_ID || "",

  SERPAPI_API_KEY: process.env.SERPAPI_API_KEY || "",
};