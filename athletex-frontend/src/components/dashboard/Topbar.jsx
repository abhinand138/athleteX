import { FaBell } from "react-icons/fa";

export default function Topbar() {
  return (
    <header className="h-20 bg-[#111317] border-b border-white/5 flex items-center justify-between px-8">

      <div>

        <h1 className="text-2xl font-bold text-white">
          Dashboard
        </h1>

        <p className="text-gray-400">
          Welcome back 👋
        </p>

      </div>

      <div className="flex items-center gap-5">

        <button className="text-white text-xl">
          <FaBell />
        </button>

        <img
          src="https://i.pravatar.cc/100"
          className="w-11 h-11 rounded-full"
          alt="Profile"
        />

      </div>

    </header>
  );
}