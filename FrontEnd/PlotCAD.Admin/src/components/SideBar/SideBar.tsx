import { ISideBarItem } from "./SideBar.types";

interface ISideBarProps {
  items: ISideBarItem[];
  open: boolean;
}

const SideBar = ({ items, open }: ISideBarProps) => {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-30" />
      <aside className="fixed top-16 right-0 h-[calc(100vh-64px)] w-full sm:w-64 bg-white shadow-lg z-40 animate-slide-in-right">
        <nav className="flex flex-col py-4">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                item.selected
                  ? "bg-primary-soft text-primary font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              {item.text}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default SideBar;
