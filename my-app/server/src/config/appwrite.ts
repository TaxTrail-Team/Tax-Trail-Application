import { Client, Databases } from "node-appwrite";
import { ENV } from "../config/env";

export const aw = new Client()
  .setEndpoint(ENV.APPWRITE_ENDPOINT)
  .setProject(ENV.APPWRITE_PROJECT_ID)
  .setKey(ENV.APPWRITE_API_KEY);

export const db = new Databases(aw);
export const DB_ID = ENV.APPWRITE_DB_ID;
export const TAXES = ENV.APPWRITE_TAXES_COLLECTION_ID;
