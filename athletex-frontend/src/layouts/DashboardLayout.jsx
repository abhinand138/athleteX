import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-brand-dark flex grid-bg relative">
      
      {/* Subtle radial gradients in the background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-peach/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden z-10">

        <Topbar />

        <main className="flex-1 p-10 overflow-y-auto scroll-smooth">
          {children}
        </main>

      </div>

    </div>
  );
}