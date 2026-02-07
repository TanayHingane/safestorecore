export enum FileType {
  IMAGE = "image",
  TEXT = "text",
  CODE = "code",
  PDF = "pdf",
  DOCUMENT = "document",
  VIDEO = "video",
  PPT = "ppt",
  AUDIO = "audio",
  UNKNOWN = "unknown",
}

export interface FileMeta {
  id: string; // DB doc ID = Storage file ID
  storageFileId: string; // Storage file ID
  name: string;
  type: FileType;
  mimeType: string;
  size: number;
  folderId: string | null; // null is root
  createdAt: number;
  updatedAt: number;
  content?: string; // For text files
  summary?: string; // Gemini generated
  tags?: string[]; // Gemini generated
  blob?: Blob; // Not stored in JSON, but hydrated runtime
  isStarred?: boolean;
  isTrashed?: boolean;
}

export interface FolderMeta {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
  isTrashed?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export type ViewMode = "grid" | "list";
