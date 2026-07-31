import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#080809] flex">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="p-8 overflow-y-auto">
          {children}
        </main>

      </div>

    </div>
  );
}