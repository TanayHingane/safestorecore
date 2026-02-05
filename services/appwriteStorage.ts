import { databases, storage, appwriteConfig, ID } from "../config/appwrite";
import { Query } from "appwrite";
import { generateId, getFileType } from "../utils";
import { FileMeta, FolderMeta } from "../types";

// Helper to get current user ID (should be passed from context)
let currentUserId: string | null = null;

export const setCurrentUserId = (userId: string | null) => {
  currentUserId = userId;
};

// Save file to Appwrite Storage and create metadata document
export const saveFile = async (
  file: File,
  folderId: string | null,
): Promise<FileMeta> => {
  if (!currentUserId) throw new Error("User not authenticated");

  try {
    // 1. Upload file to Appwrite Storage
    const fileId = ID.unique();
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageBucketId,
      fileId,
      file,
    );

    // 2. Read text content if applicable
    const textContent =
      file.type.startsWith("text/") ||
      file.type.includes("json") ||
      file.type.includes("javascript")
        ? await file.text()
        : undefined;

    // 3. Create metadata document
    const fileMeta: FileMeta = {
      id: fileId,
      name: file.name,
      type: getFileType(file.type),
      mimeType: file.type,
      size: file.size,
      folderId: folderId || "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      content: textContent,
      isStarred: false,
      isTrashed: false,
    };

    // Save metadata to database
    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        ...fileMeta,
        userId: currentUserId,
        folderId: folderId || null,
      },
    );

    return fileMeta;
  } catch (error) {
    console.error("Error saving file:", error);
    throw error;
  }
};

// Update file metadata
export const updateFileMeta = async (
  id: string,
  updates: Partial<FileMeta>,
): Promise<void> => {
  if (!currentUserId) throw new Error("User not authenticated");

  try {
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      id,
      {
        ...updates,
        updatedAt: Date.now(),
      },
    );
  } catch (error) {
    console.error("Error updating file metadata:", error);
    throw error;
  }
};

// Update folder metadata
export const updateFolderMeta = async (
  id: string,
  updates: Partial<FolderMeta>,
): Promise<void> => {
  if (!currentUserId) throw new Error("User not authenticated");

  try {
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      id,
      updates,
    );
  } catch (error) {
    console.error("Error updating folder metadata:", error);
    throw error;
  }
};

// Get all files for current user
export const getAllFiles = async (): Promise<FileMeta[]> => {
  if (!currentUserId) throw new Error("User not authenticated");

  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [Query.equal("userId", currentUserId)],
    );

    return response.documents.map((doc: any) => ({
      id: doc.$id,
      name: doc.name,
      type: doc.type,
      mimeType: doc.mimeType,
      size: doc.size,
      folderId: doc.folderId || null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      content: doc.content,
      summary: doc.summary,
      tags: doc.tags,
      isStarred: doc.isStarred || false,
      isTrashed: doc.isTrashed || false,
    }));
  } catch (error) {
    console.error("Error getting files:", error);
    return [];
  }
};

// Get all folders for current user
export const getAllFolders = async (): Promise<FolderMeta[]> => {
  if (!currentUserId) throw new Error("User not authenticated");

  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      [Query.equal("userId", currentUserId)],
    );

    return response.documents.map((doc: any) => ({
      id: doc.$id,
      name: doc.name,
      parentId: doc.parentId || null,
      createdAt: doc.createdAt,
      isTrashed: doc.isTrashed || false,
    }));
  } catch (error) {
    console.error("Error getting folders:", error);
    return [];
  }
};

// Get files in a specific folder
export const getFiles = async (
  folderId: string | null,
): Promise<FileMeta[]> => {
  const allFiles = await getAllFiles();
  return allFiles.filter((f) => f.folderId === folderId);
};

// Create a new folder
export const createFolder = async (
  name: string,
  parentId: string | null,
): Promise<FolderMeta> => {
  if (!currentUserId) throw new Error("User not authenticated");

  try {
    const folderId = ID.unique();
    const newFolder: FolderMeta = {
      id: folderId,
      name,
      parentId: parentId || null,
      createdAt: Date.now(),
      isTrashed: false,
    };

    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      folderId,
      {
        ...newFolder,
        userId: currentUserId,
        parentId: parentId || null,
      },
    );

    return newFolder;
  } catch (error) {
    console.error("Error creating folder:", error);
    throw error;
  }
};

// Get folders in a specific parent folder
export const getFolders = async (
  parentId: string | null,
): Promise<FolderMeta[]> => {
  const allFolders = await getAllFolders();
  return allFolders.filter((f) => f.parentId === parentId);
};

// Delete file permanently
export const deleteFile = async (id: string): Promise<void> => {
  if (!currentUserId) throw new Error("User not authenticated");

  try {
    // Delete from storage
    await storage.deleteFile(appwriteConfig.storageBucketId, id);

    // Delete metadata
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      id,
    );
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

// Delete folder permanently (and its contents)
export const deleteFolder = async (id: string): Promise<void> => {
  if (!currentUserId) throw new Error("User not authenticated");

  try {
    // Get all files in this folder
    const files = await getFiles(id);

    // Delete all files
    for (const file of files) {
      await deleteFile(file.id);
    }

    // Delete folder metadata
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      id,
    );
  } catch (error) {
    console.error("Error deleting folder:", error);
    throw error;
  }
};

// Download file from Appwrite Storage
export const downloadFile = async (fileId: string): Promise<Blob> => {
  try {
    const result = await storage.getFileDownload(
      appwriteConfig.storageBucketId,
      fileId,
    );
    return result as unknown as Blob;
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
};

// Get file preview URL
export const getFilePreview = (fileId: string): string => {
  return storage
    .getFilePreview(
      appwriteConfig.storageBucketId,
      fileId,
      400, // width
      400, // height
      undefined, // gravity
      100, // quality
    )
    .toString();
};

// Seed initial folders for new users
export const seedDB = async () => {
  if (!currentUserId) return;

  try {
    const folders = await getFolders(null);
    if (folders.length === 0) {
      await createFolder("Documents", null);
      await createFolder("Images", null);
      await createFolder("Work", null);
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};
