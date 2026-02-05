import React, { useState, useEffect } from 'react';
import { useFileSystem } from '../contexts/FileSystemContext';
import { Folder, FileText, Image, FileCode, Plus, Search, Cloud, Trash2, Download, Star, RefreshCcw, FolderPlus, Check, X } from 'lucide-react';
import { FileType, FileMeta } from '../types';
import { formatSize } from '../utils';

// Separated component to handle Blob URL lifecycle and prevent memory leaks
const FileCard = ({ 
    file, 
    onDelete,
    onStar,
    onRestore,
    inTrash
}: { 
    file: FileMeta, 
    onDelete: (e: React.MouseEvent, id: string) => void,
    onStar: (e: React.MouseEvent, id: string) => void,
    onRestore?: (e: React.MouseEvent, id: string) => void,
    inTrash: boolean
}) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        let url: string | null = null;
        if (file.type === FileType.IMAGE && file.blob) {
            url = URL.createObjectURL(file.blob);
            setPreviewUrl(url);
        }
        
        return () => {
            if (url) URL.revokeObjectURL(url);
        };
    }, [file]);

    const handleDownload = () => {
        if (inTrash) return; // Disable download in trash
        
        if (window.confirm(`Do you want to download "${file.name}"?`)) {
            if (file.blob) {
                const url = URL.createObjectURL(file.blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = file.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                alert("File content is missing or corrupted. Try re-uploading.");
            }
        }
    };

    const FileIcon = ({ type }: { type: FileType }) => {
        switch (type) {
            case FileType.IMAGE: return <Image className="text-purple-500" size={40} />;
            case FileType.CODE: return <FileCode className="text-emerald-500" size={40} />;
            default: return <FileText className="text-blue-500" size={40} />;
        }
    };

    return (
        <div 
            onClick={handleDownload}
            className={`group relative bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:border-indigo-300 ${inTrash ? 'opacity-75 grayscale' : 'cursor-pointer'}`}
        >
            {/* Preview Area */}
            <div className="h-40 bg-slate-50 flex items-center justify-center p-4 border-b border-slate-100 group-hover:bg-slate-100 transition-colors relative">
                {file.type === FileType.IMAGE && previewUrl ? (
                    <img src={previewUrl} alt={file.name} className="w-full h-full object-contain" />
                ) : (
                    <FileIcon type={file.type} />
                )}
                
                {/* Overlay Download Icon on Hover (Only if not in trash) */}
                {!inTrash && (
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <div className="bg-white/90 p-2 rounded-full shadow-sm text-indigo-600">
                            <Download size={24} />
                        </div>
                    </div>
                )}
            </div>
            
            {/* Footer Area */}
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <h3 className="font-medium text-slate-800 truncate text-sm flex-1" title={file.name}>{file.name}</h3>
                    {!inTrash && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onStar(e, file.id); }}
                            className={`p-1 rounded-full transition-colors ${file.isStarred ? 'text-yellow-400 hover:text-yellow-500' : 'text-slate-300 hover:text-yellow-400'}`}
                        >
                            <Star size={16} fill={file.isStarred ? "currentColor" : "none"} />
                        </button>
                    )}
                </div>
                <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-400">{formatSize(file.size)}</span>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         {inTrash && onRestore && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onRestore(e, file.id); }}
                                className="text-slate-400 hover:text-green-600 p-1 rounded-full hover:bg-green-50 transition-colors"
                                title="Restore"
                            >
                                <RefreshCcw size={16} />
                            </button>
                        )}
                        <button 
                            onClick={(e) => onDelete(e, file.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                            title={inTrash ? "Delete Permanently" : "Move to Trash"}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MainView: React.FC = () => {
  const { files, folders, navigateTo, currentFolderId, isLoading, uploadFile, deleteItem, currentView, toggleStar, restoreItem, createFolder } = useFileSystem();
  const [isUploadDragging, setIsUploadDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Folder State
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Drag and Drop Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsUploadDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // This is required to allow dropping
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if we are actually leaving the container or just entering a child element
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
        return;
    }
    setIsUploadDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsUploadDragging(false);
    
    // Only allow upload in My Drive
    if (currentView !== 'my-drive') return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(file => {
          uploadFile(file);
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(file => uploadFile(file));
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, type: 'file' | 'folder') => {
    e.preventDefault(); 
    e.stopPropagation(); 
    
    const message = currentView === 'trash' 
        ? `Are you sure you want to PERMANENTLY delete this ${type}? This cannot be undone.`
        : `Move this ${type} to trash?`;

    if (window.confirm(message)) {
        try {
            await deleteItem(id, type);
        } catch (error) {
            console.error("Failed to delete item:", error);
            alert("Failed to delete item.");
        }
    }
  };

  const handleRestore = async (e: React.MouseEvent, id: string, type: 'file' | 'folder') => {
      e.preventDefault();
      e.stopPropagation();
      try {
          await restoreItem(id, type);
      } catch (error) {
          console.error("Failed to restore item:", error);
      }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getViewTitle = () => {
      switch(currentView) {
          case 'recent': return 'Recent Files';
          case 'starred': return 'Starred';
          case 'trash': return 'Trash';
          default: return currentFolderId ? 'Current Folder' : 'My Drive';
      }
  };

  return (
    <div 
      className="flex-1 h-full overflow-y-auto bg-white relative flex flex-col"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header / Toolbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2 text-lg text-slate-600">
           {currentView === 'my-drive' && (
                <button onClick={() => navigateTo(null)} className="hover:text-indigo-600 font-medium">Drive</button>
           )}
           {currentView === 'my-drive' && currentFolderId && <span className="text-slate-400">/</span>}
           <span className="font-semibold text-slate-900">{getViewTitle()}</span>
        </div>

        <div className="flex items-center space-x-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search files..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
                />
            </div>
            {currentView === 'my-drive' && (
                <>
                    {isCreatingFolder ? (
                        <form onSubmit={handleCreateFolder} className="flex items-center space-x-2 bg-slate-100 rounded-lg p-1 border border-slate-200 animate-in fade-in slide-in-from-right-4 duration-200">
                            <input 
                                type="text" 
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="Folder name"
                                className="bg-transparent border-none focus:outline-none text-sm px-2 w-32"
                                autoFocus
                            />
                            <button type="submit" className="p-1 hover:bg-white rounded-md text-green-600 transition-colors shadow-sm">
                                <Check size={16} />
                            </button>
                            <button type="button" onClick={() => setIsCreatingFolder(false)} className="p-1 hover:bg-white rounded-md text-red-500 transition-colors shadow-sm">
                                <X size={16} />
                            </button>
                        </form>
                    ) : (
                        <button 
                            onClick={() => setIsCreatingFolder(true)}
                            className="flex items-center space-x-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            <FolderPlus size={18} />
                            <span className="font-medium text-sm">New Folder</span>
                        </button>
                    )}

                    <label className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm">
                        <Plus size={18} />
                        <span className="font-medium text-sm">Upload</span>
                        <input type="file" className="hidden" onChange={handleFileUpload} multiple />
                    </label>
                </>
            )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 flex-1">
        
        {isLoading && (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        )}

        {!isLoading && (
            <>
                {/* Folders Section */}
                {filteredFolders.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Folders</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredFolders.map(folder => (
                        <div 
                            key={folder.id}
                            onClick={() => currentView === 'my-drive' ? navigateTo(folder.id) : null}
                            className={`group p-4 bg-slate-50 border border-slate-200 rounded-xl transition-all flex items-center justify-between ${currentView === 'my-drive' ? 'hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer' : ''} ${currentView === 'trash' ? 'opacity-75 grayscale' : ''}`}
                        >
                            <div className="flex items-center space-x-3 overflow-hidden">
                                <Folder className="text-indigo-400 group-hover:text-indigo-600 fill-current flex-shrink-0" size={24} />
                                <span className="font-medium text-slate-700 truncate">{folder.name}</span>
                            </div>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {currentView === 'trash' && (
                                     <button 
                                        onClick={(e) => handleRestore(e, folder.id, 'folder')}
                                        className="relative z-20 p-1.5 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all"
                                        title="Restore Folder"
                                    >
                                        <RefreshCcw size={16} />
                                    </button>
                                )}
                                <button 
                                    onClick={(e) => handleDelete(e, folder.id, 'folder')}
                                    className="relative z-20 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title={currentView === 'trash' ? "Delete Permanently" : "Move to Trash"}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
                )}

                {/* Files Section */}
                <div>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Files</h2>
                {filteredFiles.length === 0 && filteredFolders.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                        <div className="inline-flex p-4 bg-indigo-50 rounded-full mb-4">
                            {currentView === 'trash' ? <Trash2 className="text-indigo-400" size={32} /> : <Plus className="text-indigo-400" size={32} />}
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">
                            {currentView === 'trash' ? 'Trash is empty' : 'No files found'}
                        </h3>
                        {currentView === 'my-drive' && <p className="text-slate-500 mt-1">Drag and drop files here to upload</p>}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredFiles.map(file => (
                        <FileCard 
                            key={file.id} 
                            file={file} 
                            onDelete={(e, id) => handleDelete(e, id, 'file')}
                            onStar={(e, id) => toggleStar(id)}
                            onRestore={(e, id) => handleRestore(e, id, 'file')}
                            inTrash={currentView === 'trash'}
                        />
                    ))}
                    </div>
                )}
                </div>
            </>
        )}
      </div>

      {/* Drag Overlay */}
      {isUploadDragging && currentView === 'my-drive' && (
        <div className="absolute inset-0 bg-indigo-600/10 backdrop-blur-sm border-4 border-indigo-600 border-dashed rounded-lg z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center animate-bounce">
                <div className="p-4 bg-indigo-100 rounded-full mb-3">
                    <Cloud className="text-indigo-600" size={32} />
                </div>
                <span className="text-xl font-bold text-indigo-900">Drop files to upload</span>
            </div>
        </div>
      )}
    </div>
  );
};