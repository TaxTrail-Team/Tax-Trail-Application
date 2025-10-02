import { Client, Account, Databases } from 'appwrite';
console.log("[APPWRITE]", process.env.APPWRITE_ENDPOINT, process.env.APPWRITE_PROJECT_ID);

export const appwrite = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1') // your endpoint
  .setProject('68dcab440025ead1fabe');              // your project id

export const account = new Account(appwrite);
export const databases = new Databases(appwrite);

export const APPWRITE_DB_ID = 'taxdb';
export const TAXES_COL = 'taxes';
