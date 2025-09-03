import Sidebar from "@/app/portal/(app)/components/Sidebar";


export default function PortalLayout({ children }) {
  return (
    <div className=" flex min-h-screen">
      <Sidebar />
      <div className=" flex-grow p-8">{children}</div>
    </div>
  );
}
