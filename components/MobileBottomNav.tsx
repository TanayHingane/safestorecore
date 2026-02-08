import { HardDrive, Clock, Star, Trash2 } from "lucide-react";
import { useFileSystem } from "../contexts/FileSystemContext";

export const MobileBottomNav = () => {
  const { currentView, changeView } = useFileSystem();

  const items = [
    { view: "my-drive", icon: HardDrive },
    { view: "recent", icon: Clock },
    { view: "starred", icon: Star },
    { view: "trash", icon: Trash2 },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 flex justify-around py-2 md:hidden z-40">
      {items.map(({ view, icon: Icon }) => {
        const active = currentView === view;
        return (
          <button
            key={view}
            onClick={() => changeView(view as any)}
            className={`flex flex-col items-center text-xs ${
              active ? "text-indigo-600" : "text-slate-400"
            }`}
          >
            <Icon size={20} />
            <span className="mt-1 capitalize">{view.replace("-", " ")}</span>
          </button>
        );
      })}
    </div>
  );
};
