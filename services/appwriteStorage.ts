import { databases, storage, appwriteConfig } from "../config/appwrite";
import { ID, Query, Permission, Role } from "appwrite";
import { getFileType } from "../utils";
import { FileMeta, FolderMeta } from "../types";

/* ───────────────────────── USER CONTEXT ───────────────────────── */

let currentUserId: string | null = null;

export const setCurrentUserId = (userId: string | null) => {
  currentUserId = userId;
};

/**
 * DEV permissions
 * (Later: replace Role.any() with Role.user(userId))
 */
const permissions = [Permission.read(Role.any()), Permission.write(Role.any())];

/* ───────────────────────── FILES ───────────────────────── */

/**
 * Upload file + save metadata
 */
export const saveFile = async (
  file: File,
  folderId: string | null,
): Promise<FileMeta> => {
  if (!currentUserId) throw new Error("User not authenticated");

  const fileId = ID.unique();
  const now = Date.now();

  // 1️⃣ Upload to Appwrite Storage
  await storage.createFile(
    appwriteConfig.storageBucketId,
    fileId,
    file,
    permissions,
  );

  // 2️⃣ Extract text content (if supported)
  const textContent =
    file.type.startsWith("text/") ||
    file.type.includes("json") ||
    file.type.includes("javascript")
      ? await file.text()
      : undefined;

  // 3️⃣ Save metadata (MATCHES SCHEMA EXACTLY)
  await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.filesCollectionId,
    fileId,
    {
      userId: currentUserId,
      name: file.name,
      type: getFileType(file.type),
      mimeType: file.type,
      size: file.size,
      folderId,
      createdAt: now,
      updatedAt: now,
      content: textContent,
      isStarred: false,
      isTrashed: false,
    },
    permissions,
  );

  return {
    id: fileId,
    name: file.name,
    type: getFileType(file.type),
    mimeType: file.type,
    size: file.size,
    folderId,
    createdAt: now,
    updatedAt: now,
    content: textContent,
    isStarred: false,
    isTrashed: false,
  };
};

/**
 * Update file metadata
 */
export const updateFileMeta = async (
  id: string,
  updates: Partial<FileMeta>,
): Promise<void> => {
  if (!currentUserId) throw new Error("User not authenticated");

  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.filesCollectionId,
    id,
    {
      ...updates,
      updatedAt: Date.now(),
    },
  );
};

/**
 * Get all files for current user
 */
export const getAllFiles = async (): Promise<FileMeta[]> => {
  if (!currentUserId) throw new Error("User not authenticated");

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
    folderId: doc.folderId ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    content: doc.content,
    summary: doc.summary,
    tags: doc.tags,
    isStarred: doc.isStarred ?? false,
    isTrashed: doc.isTrashed ?? false,
  }));
};

/**
 * Get files inside a folder
 */
export const getFiles = async (
  folderId: string | null,
): Promise<FileMeta[]> => {
  const files = await getAllFiles();
  return files.filter((f) => f.folderId === folderId);
};

/**
 * Delete file permanently
 */
export const deleteFile = async (id: string): Promise<void> => {
  if (!currentUserId) throw new Error("User not authenticated");

  await storage.deleteFile(appwriteConfig.storageBucketId, id);
  await databases.deleteDocument(
    appwriteConfig.databaseId,
    appwriteConfig.filesCollectionId,
    id,
  );
};

/**
 * Download file
 */
export const downloadFile = async (fileId: string): Promise<Blob> => {
  const result = await storage.getFileDownload(
    appwriteConfig.storageBucketId,
    fileId,
  );
  return result as unknown as Blob;
};

/**
 * File preview URL
 */
export const getFilePreview = (fileId: string): string => {
  return storage
    .getFilePreview(
      appwriteConfig.storageBucketId,
      fileId,
      400,
      400,
      undefined,
      100,
    )
    .toString();
};

/* ───────────────────────── FOLDERS ───────────────────────── */

/**
 * Create folder
 */
export const createFolder = async (
  name: string,
  parentId: string | null,
): Promise<FolderMeta> => {
  if (!currentUserId) throw new Error("User not authenticated");

  const folderId = ID.unique();
  const now = Date.now();

  await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.foldersCollectionId,
    folderId,
    {
      userId: currentUserId,
      name,
      parentId,
      createdAt: now,
      isTrashed: false,
    },
    permissions,
  );

  return {
    id: folderId,
    name,
    parentId,
    createdAt: now,
    isTrashed: false,
  };
};

/**
 * Update folder metadata
 */
export const updateFolderMeta = async (
  id: string,
  updates: Partial<FolderMeta>,
): Promise<void> => {
  if (!currentUserId) throw new Error("User not authenticated");

  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.foldersCollectionId,
    id,
    updates,
  );
};

/**
 * Get all folders for current user
 */
export const getAllFolders = async (): Promise<FolderMeta[]> => {
  if (!currentUserId) throw new Error("User not authenticated");

  const response = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.foldersCollectionId,
    [Query.equal("userId", currentUserId)],
  );

  return response.documents.map((doc: any) => ({
    id: doc.$id,
    name: doc.name,
    parentId: doc.parentId ?? null,
    createdAt: doc.createdAt,
    isTrashed: doc.isTrashed ?? false,
  }));
};

/**
 * Get folders inside a parent folder
 */
export const getFolders = async (
  parentId: string | null,
): Promise<FolderMeta[]> => {
  const folders = await getAllFolders();
  return folders.filter((f) => f.parentId === parentId);
};

/**
 * Delete folder and its contents
 */
export const deleteFolder = async (id: string): Promise<void> => {
  if (!currentUserId) throw new Error("User not authenticated");

  const files = await getFiles(id);
  for (const file of files) {
    await deleteFile(file.id);
  }

  await databases.deleteDocument(
    appwriteConfig.databaseId,
    appwriteConfig.foldersCollectionId,
    id,
  );
};

/* ───────────────────────── SEEDING ───────────────────────── */

/**
 * Create default folders for new users
 */
export const seedDB = async () => {
  if (!currentUserId) return;

  const rootFolders = await getFolders(null);

  if (rootFolders.length === 0) {
    await createFolder("Documents", null);
    await createFolder("Images", null);
    await createFolder("Work", null);
  }
};
