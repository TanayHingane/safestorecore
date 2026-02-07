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

  // 2️⃣ Extract text content (if supported) - REMOVED FOR PERFORMANCE
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
      // content: textContent, // REMOVED FOR PERFORMANCE
      isStarred: false,
      isTrashed: false,
    },
    permissions,
  );

  return {
    id: fileId,
    storageFileId: fileId, // 🔥 CRITICAL
    name: file.name,
    type: getFileType(file.type),
    mimeType: file.type,
    size: file.size,
    folderId,
    createdAt: now,
    updatedAt: now,
    // content: textContent, // REMOVED FOR PERFORMANCE
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
export const queryFiles = async (
  queries: string[] = [],
  selectedAttributes: string[] = [],
): Promise<Partial<FileMeta>[]> => {
  if (!currentUserId) throw new Error("User not authenticated");

  const finalQueries = [...queries, Query.equal("userId", currentUserId)];
  if (selectedAttributes.length > 0) {
    finalQueries.push(Query.select(selectedAttributes));
  }

  const response = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.filesCollectionId,
    finalQueries,
  );

  return response.documents.map((doc: any) => ({
    id: doc.$id,
    storageFileId: doc.$id, // 🔥 CRITICAL
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
  isTrashed: boolean = false,
  isStarred: boolean = false,
  selectedAttributes: string[] = [],
): Promise<Partial<FileMeta>[]> => {
  const queries = [
    folderId === null ? Query.isNull("folderId") : Query.equal("folderId", folderId),
    Query.equal("isTrashed", isTrashed),
    Query.equal("isStarred", isStarred),
  ];
  return queryFiles(queries, selectedAttributes);
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
 * Get Appwrite download URL (browser-safe)
 */
export const getDownloadUrl = (fileId: string): string => {
  return storage
    .getFileDownload(appwriteConfig.storageBucketId, fileId)
    .toString();
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
export const queryFolders = async (
  queries: string[] = [],
  selectedAttributes: string[] = [],
): Promise<FolderMeta[]> => {
  if (!currentUserId) throw new Error("User not authenticated");

  const finalQueries = [...queries, Query.equal("userId", currentUserId)];
  if (selectedAttributes.length > 0) {
    finalQueries.push(Query.select(selectedAttributes));
  }

  const response = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.foldersCollectionId,
    finalQueries,
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
  isTrashed: boolean = false,
  selectedAttributes: string[] = [],
): Promise<FolderMeta[]> => {
  const queries = [
    parentId === null
      ? Query.isNull("parentId")
      : Query.equal("parentId", parentId),
    Query.equal("isTrashed", isTrashed),
  ];
  return queryFolders(queries, selectedAttributes);
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
