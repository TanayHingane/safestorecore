import React from "react";
import { HardDrive, Clock, Trash2, Star, Cloud } from "lucide-react";
import { useFileSystem, SidebarViewMode } from "../contexts/FileSystemContext";
import { formatSize } from "../utils";
import { UserButton, useUser } from "@clerk/clerk-react";
import Logo from "./Logo";

export const Sidebar: React.FC = () => {
  const { user } = useUser();
  const { totalStorageUsed, currentView, changeView, emptyTrash } =
    useFileSystem();

  const maxStorage = 5 * 1024 * 1024 * 1024; // 5GB Mock Limit
  const usedPercentage = Math.min((totalStorageUsed / maxStorage) * 100, 100);

  const handleEmptyTrash = async () => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete all items in the Trash? This action cannot be undone.",
      )
    ) {
      await emptyTrash();
    }
  };

  const NavButton = ({
    view,
    icon: Icon,
    label,
  }: {
    view: SidebarViewMode;
    icon: any;
    label: string;
  }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => changeView(view)}
        className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors font-medium ${
          isActive
            ? "bg-indigo-100 text-indigo-700"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        <Icon
          size={20}
          className={isActive ? "text-indigo-600" : "text-slate-500"}
        />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-full flex-shrink-0">
      <div className="p-6 flex items-center space-x-3">
        <Logo className="w-10 h-10" />
      </div>

      <div className=" flex flex-col justify-between h-full">
        <nav className="flex-1 px-4 space-y-1 mt-4 relative">
          <NavButton view="my-drive" icon={HardDrive} label="My Drive" />
          <NavButton view="recent" icon={Clock} label="Recent" />
          <NavButton view="starred" icon={Star} label="Starred" />
          <NavButton view="trash" icon={Trash2} label="Trash" />

          {currentView === "trash" && (
            <div className="mt-4 px-2">
              <button
                onClick={handleEmptyTrash}
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors border border-red-200 text-sm font-medium"
              >
                <Trash2 size={16} />
                <span>Empty Trash</span>
              </button>
            </div>
          )}
        </nav>

        <div>
          <div className="p-6">
            <div className=" flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase">
              {/* <UserAvatar appearance={{ elements: { avatarBox: "w-10 h-10" } }} /> */}
              <UserButton
                appearance={{ elements: { avatarBox: "w-10 h-10" } }}
              />
              <span>{user?.firstName}</span>
            </div>
          </div>

          <div className="p-6 border-t border-slate-200">
            <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500 uppercase">
              <span>Storage</span>
              <span>{Math.round(usedPercentage)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-500"
                style={{ width: `${usedPercentage}%` }}
              ></div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {formatSize(totalStorageUsed)} of 5 GB used
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
