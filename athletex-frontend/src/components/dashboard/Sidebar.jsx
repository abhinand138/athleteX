import {
  FaHome,
  FaUser,
  FaChartBar,
  FaTrophy,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

export default function Sidebar() {

  const menu = [
    {
      icon: <FaHome />,
      name: "Dashboard",
    },
    {
      icon: <FaUser />,
      name: "Profile",
    },
    {
      icon: <FaChartBar />,
      name: "Performance",
    },
    {
      icon: <FaTrophy />,
      name: "Achievements",
    },
    {
      icon: <FaCog />,
      name: "Settings",
    },
  ];

  return (

    <aside className="w-72 bg-[#0F1115] border-r border-white/5 flex flex-col">

      <div className="h-20 flex items-center justify-center">

        <h1 className="text-3xl font-bold text-brand-peach">
          AthleteX
        </h1>

      </div>

      <nav className="flex-1 px-5">

        {menu.map((item) => (

          <button
            key={item.name}
            className="w-full flex items-center gap-4 px-5 py-4 mb-2 rounded-xl hover:bg-brand-peach hover:text-black transition-all"
          >
            {item.icon}

            {item.name}

          </button>

        ))}

      </nav>

      <button className="m-5 flex items-center gap-4 px-5 py-4 rounded-xl bg-red-500 hover:bg-red-600">

        <FaSignOutAlt />

        Logout

      </button>

    </aside>

  );

}