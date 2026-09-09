import {
  FaHome,
  FaUser,
  FaUsers,
  FaChartBar,
  FaTrophy,
  FaCog,
  FaSignOutAlt,
  FaUserFriends,
  FaDumbbell,
  FaFileAlt,
  FaBell,
} from "react-icons/fa";

import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isCoach = user.role === "COACH";
  const isAdmin = user.role === "ADMIN";

  const menu = isAdmin
    ? [
        {
          icon: <FaHome />,
          name: "Admin Console",
          path: "/admin/dashboard"
        },
        {
          icon: <FaUsers />,
          name: "User Directory",
          path: "/admin/users"
        },
        {
          icon: <FaUserFriends />,
          name: "Rosters",
          path: "/admin/rosters"
        },
        {
          icon: <FaCog />,
          name: "Settings",
          path: "/settings"
        }
      ]
    : isCoach 
    ? [
        {
          icon: <FaHome />,
          name: "Dashboard",
          path: "/coach/dashboard"
        },
        {
          icon: <FaUser />,
          name: "Profile",
          path: "/coach/profile"
        },
        {
          icon: <FaUserFriends />,
          name: "Athletes",
          path: "/coach/athletes"
        },
        {
          icon: <FaDumbbell />,
          name: "Training",
          path: "/coach/training"
        },
        {
          icon: <FaTrophy />,
          name: "Achievements",
          path: "/coach/achievements"
        },
        {
          icon: <FaChartBar />,
          name: "Analytics",
          path: "/coach/analytics"
        },
        {
          icon: <FaFileAlt />,
          name: "Reports",
          path: "/coach/reports"
        },
        {
          icon: <FaBell />,
          name: "Notifications",
          path: "/coach/notifications"
        },
        {
          icon: <FaCog />,
          name: "Settings",
          path: "/settings"
        }
      ]
    : [
        {
          icon: <FaHome />,
          name: "Dashboard",
          path: "/dashboard"
        },
        {
          icon: <FaUser />,
          name: "Profile",
          path: "/profile"
        },
        {
          icon: <FaChartBar />,
          name: "Performance",
          path: "/performance"
        },
        {
          icon: <FaDumbbell />,
          name: "Training",
          path: "/training"
        },
        {
          icon: <FaTrophy />,
          name: "Achievements",
          path: "/achievements"
        },
        {
          icon: <FaBell />,
          name: "Notifications",
          path: "/athlete/notifications"
        },
        {
          icon: <FaCog />,
          name: "Settings",
          path: "/settings"
        },
      ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (

    <aside className="w-72 bg-brand-dark/95 backdrop-blur-xl border-r border-white/5 flex flex-col shadow-2xl relative z-20 print:hidden">

      <div className="h-28 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-peach/5 to-transparent pointer-events-none" />
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-peach to-orange-400 tracking-wider uppercase drop-shadow-sm">
          AthleteX
        </h1>
      </div>

      <nav className="flex-1 px-5 mt-4 space-y-2">

        {menu.map((item) => (

          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `w-full flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold tracking-wide transition-all group overflow-hidden relative ${isActive ? 'text-black bg-brand-peach shadow-[0_0_20px_rgba(238,155,116,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-300 ease-out" />
                )}
                
                <span className={`text-xl relative z-10 ${!isActive && 'group-hover:text-brand-peach transition-colors'}`}>
                  {item.icon}
                </span>

                <span className="relative z-10">{item.name}</span>
              </>
            )}
          </NavLink>

        ))}

      </nav>

      <button 
        onClick={handleLogout}
        className="m-6 flex items-center justify-center gap-3 px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-bold tracking-wide transition-all shadow-inner hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] group"
      >

        <FaSignOutAlt className="text-lg group-hover:-translate-x-1 transition-transform" />

        Logout

      </button>

    </aside>

  );

}