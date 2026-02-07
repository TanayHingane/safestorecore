import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { FileMeta, FolderMeta } from "../types";
import * as db from "../services/appwriteStorage";
import { Query } from "appwrite"; // Import Query

import { useAuth } from "./AuthContext";

export type SidebarViewMode = "my-drive" | "recent" | "starred" | "trash";

interface FileSystemContextType {
  currentFolderId: string | null;
  files: FileMeta[];
  folders: FolderMeta[];
  breadcrumbs: FolderMeta[];
  isLoading: boolean;
  navigateTo: (folderId: string | null) => void;
  uploadFile: (file: File) => Promise<void>;
  createFolder: (name: string) => Promise<void>;
  deleteItem: (id: string, type: "file" | "folder") => Promise<void>;
  refresh: () => void;
  selectedFile: FileMeta | null;
  setSelectedFile: (file: FileMeta | null) => void;
  analyzingFileId: string | null;

  // New properties for sidebar functionality
  currentView: SidebarViewMode;
  changeView: (view: SidebarViewMode) => void;
  totalStorageUsed: number;
  toggleStar: (id: string) => Promise<void>;
  restoreItem: (id: string, type: "file" | "folder") => Promise<void>;
  emptyTrash: () => Promise<void>;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(
  undefined,
);

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<SidebarViewMode>("my-drive");

  const [files, setFiles] = useState<FileMeta[]>([]);
  const [folders, setFolders] = useState<FolderMeta[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<FolderMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileMeta | null>(null);
  const [analyzingFileId, setAnalyzingFileId] = useState<string | null>(null);
  const [totalStorageUsed, setTotalStorageUsed] = useState(0);
  const hasSeededRef = React.useRef(false);

  // Set user ID in storage service when user changes
  useEffect(() => {
    if (user) {
      db.setCurrentUserId(user.id);
    } else {
      db.setCurrentUserId(null);
    }
  }, [user]);

  const loadData = useCallback(async () => {
    if (!user) {
      setIsLoading(false); // 👈 safety reset
      return;
    }

    setIsLoading(true);
    try {
      if (!hasSeededRef.current) {
        await db.seedDB();
        hasSeededRef.current = true;
      }

      // Attributes to fetch for files (excluding 'content')
      const fileAttributes = [
        // "id", // $id is always returned
        // "storageFileId", // Redundant with $id
        "name",
        "type",
        "mimeType",
        "size",
        "folderId",
        "createdAt",
        "updatedAt",
        "summary",
        "tags",
        "isStarred",
        "isTrashed",
      ];

      let fetchedFiles: Partial<FileMeta>[] = [];
      let fetchedFolders: FolderMeta[] = [];
      let totalStorage = 0;

      if (currentView === "my-drive") {
        fetchedFiles = await db.getFiles(
          currentFolderId,
          false,
          false,
          fileAttributes,
        );
        fetchedFolders = await db.getFolders(currentFolderId, false);
      } else if (currentView === "recent") {
        fetchedFiles = await db.queryFiles(
          [Query.equal("isTrashed", false), Query.orderDesc("updatedAt")],
          fileAttributes,
        );
      } else if (currentView === "starred") {
        fetchedFiles = await db.queryFiles(
          [Query.equal("isStarred", true), Query.equal("isTrashed", false)],
          fileAttributes,
        );
      } else if (currentView === "trash") {
        fetchedFiles = await db.queryFiles(
          [Query.equal("isTrashed", true)],
          fileAttributes,
        );
        fetchedFolders = await db.queryFolders([
          Query.equal("isTrashed", true),
        ]);
      }

      // Calculate Total Storage Used
      // Only calculate total storage if not in trash view, otherwise it's misleading
      if (currentView !== "trash") {
        const allUserFiles = await db.queryFiles(
          [Query.equal("isTrashed", false)],
          ["size"],
        );
        totalStorage = allUserFiles.reduce((acc, f) => acc + (f.size || 0), 0);
      }
      setTotalStorageUsed(totalStorage);
      setFiles(fetchedFiles as FileMeta[]);
      setFolders(fetchedFolders);

      // Update breadcrumbs (Only for My Drive)
      if (currentView === "my-drive") {
        if (currentFolderId === null) {
          setBreadcrumbs([]);
        } else {
          const currentFolder = fetchedFolders.find(
            (f) => f.id === currentFolderId,
          );
          if (currentFolder) setBreadcrumbs([currentFolder]);
        }
      } else {
        setBreadcrumbs([]);
      }

    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentFolderId, currentView, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const navigateTo = (folderId: string | null) => {
    setCurrentView("my-drive");
    setCurrentFolderId(folderId);
    setSelectedFile(null);
  };

  const changeView = (view: SidebarViewMode) => {
    setCurrentView(view);
    setCurrentFolderId(null); // Reset to root when switching main views
    setSelectedFile(null);
  };

  const uploadFile = async (file: File) => {
    setIsLoading(true);
    const targetFolder = currentView === "my-drive" ? currentFolderId : null;

    try {
      const savedFile = await db.saveFile(file, targetFolder);
      setFiles((prevFiles) => [...prevFiles, savedFile as FileMeta]); // Add new file to state

      // Trigger Gemini Analysis automatically
      setAnalyzingFileId(savedFile.id);
    } catch (error) {
      console.error("Failed to upload file", error);
      // Optionally, show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  const createNewFolder = async (name: string) => {
    const targetFolder = currentView === "my-drive" ? currentFolderId : null;
    const createdFolder = await db.createFolder(name, targetFolder);
    setFolders((prevFolders) => [...prevFolders, createdFolder]); // Add new folder to state
  };

  const deleteItem = async (id: string, type: "file" | "folder") => {
    if (currentView === "trash") {
      // Permanent delete
      if (type === "file") {
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
        await db.deleteFile(id);
      } else {
        setFolders((prevFolders) =>
          prevFolders.filter((folder) => folder.id !== id),
        );
        await db.deleteFolder(id);
      }
    } else {
      // Soft delete (Move to Trash)
      if (type === "file") {
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
        await db.updateFileMeta(id, { isTrashed: true });
      } else {
        setFolders((prevFolders) =>
          prevFolders.filter((folder) => folder.id !== id),
        );
        await db.updateFolderMeta(id, { isTrashed: true });
      }
    }
  };

  const restoreItem = async (id: string, type: "file" | "folder") => {
    if (type === "file") {
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === id ? { ...file, isTrashed: false } : file,
        ),
      );
      try {
        await db.updateFileMeta(id, { isTrashed: false });
      } catch (error) {
        console.error("Failed to restore file", error);
        setFiles((prevFiles) =>
          prevFiles.map((file) =>
            file.id === id ? { ...file, isTrashed: true } : file,
          ),
        );
      }
    } else {
      setFolders((prevFolders) =>
        prevFolders.map((folder) =>
          folder.id === id ? { ...folder, isTrashed: false } : folder,
        ),
      );
      try {
        await db.updateFolderMeta(id, { isTrashed: false });
      } catch (error) {
        console.error("Failed to restore folder", error);
        setFolders((prevFolders) =>
          prevFolders.map((folder) =>
            folder.id === id ? { ...folder, isTrashed: true } : folder,
          ),
        );
      }
    }
  };

  const toggleStar = async (id: string) => {
    // Optimistic UI update
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === id ? { ...file, isStarred: !file.isStarred } : file,
      ),
    );
    try {
      const file = files.find((f) => f.id === id);
      if (file) {
        await db.updateFileMeta(id, { isStarred: !file.isStarred });
      }
    } catch (error) {
      console.error("Failed to toggle star", error);
      // Revert optimistic update if API call fails
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === id ? { ...file, isStarred: !file.isStarred } : file,
        ),
      );
    }
  };

  const emptyTrash = async () => {
    // Start loading indicator
    setIsLoading(true);
    try {
      const trashedFiles = await db.queryFiles([
        Query.equal("isTrashed", true),
      ]);
      const trashedFolders = await db.queryFolders([
        Query.equal("isTrashed", true),
      ]);

      for (const file of trashedFiles) {
        await db.deleteFile(file.id);
      }

      for (const folder of trashedFolders) {
        await db.deleteFolder(folder.id);
      }
      loadData(); // Reload data after emptying trash
    } catch (error) {
      console.error("Failed to empty trash", error);
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  return (
    <FileSystemContext.Provider
      value={{
        currentFolderId,
        files,
        folders,
        breadcrumbs,
        isLoading,
        navigateTo,
        uploadFile,
        createFolder: createNewFolder,
        deleteItem,
        refresh: loadData,
        selectedFile,
        setSelectedFile,
        analyzingFileId,
        currentView,
        changeView,
        totalStorageUsed,
        toggleStar,
        restoreItem,
        emptyTrash,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context)
    throw new Error("useFileSystem must be used within FileSystemProvider");
  return context;
};
