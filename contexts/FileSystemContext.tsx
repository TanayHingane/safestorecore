import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { FileMeta, FolderMeta } from "../types";
import * as db from "../services/appwriteStorage";

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

      const allFiles = await db.getAllFiles();
      const allFolders = await db.getAllFolders();

      // Calculate Total Storage Used
      const total = allFiles.reduce((acc, f) => acc + f.size, 0);
      setTotalStorageUsed(total);

      // Filter Data based on Current View
      let displayFiles: FileMeta[] = [];
      let displayFolders: FolderMeta[] = [];

      if (currentView === "my-drive") {
        displayFiles = allFiles.filter(
          (f) => f.folderId === currentFolderId && !f.isTrashed,
        );
        displayFolders = allFolders.filter(
          (f) => f.parentId === currentFolderId && !f.isTrashed,
        );
      } else if (currentView === "recent") {
        displayFiles = allFiles
          .filter((f) => !f.isTrashed)
          .sort((a, b) => b.updatedAt - a.updatedAt);
        displayFolders = [];
      } else if (currentView === "starred") {
        displayFiles = allFiles.filter((f) => f.isStarred && !f.isTrashed);
        displayFolders = [];
      } else if (currentView === "trash") {
        displayFiles = allFiles.filter((f) => f.isTrashed);
        displayFolders = allFolders.filter((f) => f.isTrashed);
      }

      setFiles(displayFiles);
      setFolders(displayFolders);

      // Update breadcrumbs (Only for My Drive)
      if (currentView === "my-drive") {
        if (currentFolderId === null) {
          setBreadcrumbs([]);
        } else {
          // Simple one-level breadcrumb for now
          const currentFolder = allFolders.find(
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
    // If not in 'my-drive', default to root or disable?
    // We'll upload to currentFolderId (which is null if view != my-drive)
    const targetFolder = currentView === "my-drive" ? currentFolderId : null;

    const savedFile = await db.saveFile(file, targetFolder);
    loadData(); // Reload to update list

    // Trigger Gemini Analysis automatically
    setAnalyzingFileId(savedFile.id);
  };

  const createNewFolder = async (name: string) => {
    const targetFolder = currentView === "my-drive" ? currentFolderId : null;
    await db.createFolder(name, targetFolder);
    loadData();
  };

  const deleteItem = async (id: string, type: "file" | "folder") => {
    if (currentView === "trash") {
      // Permanent delete
      if (type === "file") await db.deleteFile(id);
      else await db.deleteFolder(id);
    } else {
      // Soft delete (Move to Trash)
      if (type === "file") await db.updateFileMeta(id, { isTrashed: true });
      else await db.updateFolderMeta(id, { isTrashed: true });
    }
    loadData();
  };

  const restoreItem = async (id: string, type: "file" | "folder") => {
    if (type === "file") await db.updateFileMeta(id, { isTrashed: false });
    else await db.updateFolderMeta(id, { isTrashed: false });
    loadData();
  };

  const toggleStar = async (id: string) => {
    const allFiles = await db.getAllFiles(); // Get fresh state
    const file = allFiles.find((f) => f.id === id);
    if (file) {
      await db.updateFileMeta(id, { isStarred: !file.isStarred });
      loadData();
    }
  };

  const emptyTrash = async () => {
    const allFiles = await db.getAllFiles();
    const allFolders = await db.getAllFolders();

    const trashedFiles = allFiles.filter((f) => f.isTrashed);
    const trashedFolders = allFolders.filter((f) => f.isTrashed);

    for (const file of trashedFiles) {
      await db.deleteFile(file.id);
    }

    for (const folder of trashedFolders) {
      await db.deleteFolder(folder.id);
    }

    loadData();
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
