import { FaBell } from "react-icons/fa";

export default function Topbar() {
  return (
    <header className="h-24 bg-brand-dark/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-10 shadow-sm print:hidden">

      <div>

        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Dashboard
        </h1>

        <p className="text-brand-peach text-sm font-semibold tracking-wider uppercase mt-1">
          Welcome back 👋
        </p>

      </div>

      <div className="flex items-center gap-6">

        <button className="relative text-gray-400 hover:text-brand-peach transition-colors p-2 rounded-full hover:bg-white/5">
          <FaBell className="text-xl" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-brand-dark"></span>
        </button>

        <div className="h-10 w-px bg-white/10 mx-2"></div>

        <img
          src="https://i.pravatar.cc/100?img=11"
          className="w-12 h-12 rounded-full border-2 border-brand-peach/50 hover:border-brand-peach transition-colors shadow-lg cursor-pointer"
          alt="Profile"
        />

      </div>

    </header>
  );
}