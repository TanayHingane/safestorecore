import { Client, Databases, Storage, ID } from "appwrite";

// Initialize Appwrite client
const client = new Client();

client
  .setEndpoint(
    import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  )
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || "");

// Initialize services
export const databases = new Databases(client);
export const storage = new Storage(client);

// Export configuration constants
export const appwriteConfig = {
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || "",
  filesCollectionId: import.meta.env.VITE_APPWRITE_FILES_COLLECTION_ID || "",
  foldersCollectionId:
    import.meta.env.VITE_APPWRITE_FOLDERS_COLLECTION_ID || "",
  storageBucketId: import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID || "",
};

// Export ID helper for generating unique IDs
export { ID };

export default client;
