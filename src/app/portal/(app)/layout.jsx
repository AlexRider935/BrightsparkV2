import Sidebar from "@/app/portal/(app)/components/Sidebar";

export default function PortalLayout({ children }) {
  return (
    // This parent div now fills the entire screen height
    <div className="flex h-screen  text-light-slate">
      {/* 1. Sidebar Container: We wrap the Sidebar in a div with a fixed width
         and tell it not to shrink. This reserves space for it. */}
      <div className="w-64 shrink-0">
        <Sidebar />
      </div>

      {/* 2. Main Content: This div now takes up the remaining space, handles its
         own scrolling, and won't overflow. */}
      <main className="flex-1 overflow-y-auto p-8 min-w-0">{children}</main>
    </div>
  );
}
