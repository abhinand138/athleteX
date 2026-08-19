import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-brand-dark flex grid-bg relative print:block print:bg-white print:min-h-0 print:h-auto print:w-full">
      
      {/* Subtle radial gradients in the background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-peach/5 rounded-full blur-[100px] pointer-events-none print:hidden" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none print:hidden" />

      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden z-10 print:h-auto print:overflow-visible print:block print:w-full">

        <Topbar />

        <main className="flex-1 p-10 overflow-y-auto scroll-smooth print:p-0 print:overflow-visible print:h-auto print:block print:w-full">
          {children}
        </main>

      </div>

    </div>
  );
}