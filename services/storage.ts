import { generateId, getFileType } from "../utils";
import { FileMeta, FolderMeta } from "../types";

// Simple IDB wrapper
const DB_NAME = 'GeminiCloudDriveDB';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('folders')) {
        db.createObjectStore('folders', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveFile = async (file: File, folderId: string | null): Promise<FileMeta> => {
  const db = await openDB();
  const textContent = (file.type.startsWith('text/') || file.type.includes('json') || file.type.includes('javascript')) 
    ? await file.text() 
    : undefined;

  const newFile: FileMeta = {
    id: generateId(),
    name: file.name,
    type: getFileType(file.type),
    mimeType: file.type,
    size: file.size,
    folderId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: textContent,
    blob: file // Store blob directly in IDB (supported by modern browsers)
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    const store = tx.objectStore('files');
    store.add(newFile);
    tx.oncomplete = () => resolve(newFile);
    tx.onerror = () => reject(tx.error);
  });
};

export const updateFileMeta = async (id: string, updates: Partial<FileMeta>): Promise<void> => {
    const db = await openDB();
    const tx = db.transaction('files', 'readwrite');
    const store = tx.objectStore('files');
    const req = store.get(id);
    
    return new Promise((resolve, reject) => {
        req.onsuccess = () => {
            const data = req.result;
            if (data) {
                store.put({ ...data, ...updates });
                resolve();
            } else {
                reject("File not found");
            }
        }
        req.onerror = () => reject(req.error);
    });
}

export const updateFolderMeta = async (id: string, updates: Partial<FolderMeta>): Promise<void> => {
    const db = await openDB();
    const tx = db.transaction('folders', 'readwrite');
    const store = tx.objectStore('folders');
    const req = store.get(id);
    
    return new Promise((resolve, reject) => {
        req.onsuccess = () => {
            const data = req.result;
            if (data) {
                store.put({ ...data, ...updates });
                resolve();
            } else {
                reject("Folder not found");
            }
        }
        req.onerror = () => reject(req.error);
    });
}

export const getAllFiles = async (): Promise<FileMeta[]> => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction('files', 'readonly');
    const store = tx.objectStore('files');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as FileMeta[]);
  });
};

export const getAllFolders = async (): Promise<FolderMeta[]> => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction('folders', 'readonly');
    const store = tx.objectStore('folders');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as FolderMeta[]);
  });
};

export const getFiles = async (folderId: string | null): Promise<FileMeta[]> => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction('files', 'readonly');
    const store = tx.objectStore('files');
    const request = store.getAll();
    request.onsuccess = () => {
      const allFiles = request.result as FileMeta[];
      resolve(allFiles.filter(f => f.folderId === folderId));
    };
  });
};

export const createFolder = async (name: string, parentId: string | null): Promise<FolderMeta> => {
  const db = await openDB();
  const newFolder: FolderMeta = {
    id: generateId(),
    name,
    parentId,
    createdAt: Date.now()
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction('folders', 'readwrite');
    tx.objectStore('folders').add(newFolder);
    tx.oncomplete = () => resolve(newFolder);
    tx.onerror = () => reject(tx.error);
  });
};

export const getFolders = async (parentId: string | null): Promise<FolderMeta[]> => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction('folders', 'readonly');
    const store = tx.objectStore('folders');
    const request = store.getAll();
    request.onsuccess = () => {
      const allFolders = request.result as FolderMeta[];
      resolve(allFolders.filter(f => f.parentId === parentId));
    };
  });
};

export const deleteFile = async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('files', 'readwrite');
        tx.objectStore('files').delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export const deleteFolder = async (id: string): Promise<void> => {
    const db = await openDB();
    // Use multi-store transaction to delete folder AND its content
    const tx = db.transaction(['files', 'folders'], 'readwrite');
    const filesStore = tx.objectStore('files');
    const foldersStore = tx.objectStore('folders');

    return new Promise((resolve, reject) => {
        // 1. Get all files to find ones in this folder
        // (In a production app, use an index on folderId)
        const request = filesStore.getAll();
        
        request.onsuccess = () => {
            const files = request.result as FileMeta[];
            const filesToDelete = files.filter(f => f.folderId === id);
            
            // Delete files
            filesToDelete.forEach(f => {
                filesStore.delete(f.id);
            });
            
            // Delete folder
            foldersStore.delete(id);
        };

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// Initial mock data seeder
export const seedDB = async () => {
    const folders = await getFolders(null);
    if (folders.length === 0) {
        await createFolder("Documents", null);
        await createFolder("Images", null);
        await createFolder("Work", null);
    }
}