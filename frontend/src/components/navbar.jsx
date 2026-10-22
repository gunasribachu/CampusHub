
import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }

  const links = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Assignments", path: "/assignments" },
    { name: "Exams", path: "/exams" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
            C
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              CampusHub
            </h1>
            <p className="text-xs text-slate-500">
              Your student workspace
            </p>
          </div>
        </NavLink>

        <div className="flex flex-wrap items-center gap-1">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-800">
              {user.name || "Student"}
            </p>
            <p className="text-xs text-slate-500">
              {user.branch || "Student account"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
