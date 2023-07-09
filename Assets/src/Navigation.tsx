import { NavLink } from "react-router-dom";

export const Navigation = () => {
  const inactiveLink = [
    "text-white",
    "hover:bg-slate-600",
    "rounded-md",
    "p-2",
  ].join(" ");

  const activeLink = ["text-white", "bg-slate-600", "rounded-md", "p-2"].join(
    " ",
  );

  return (
    <nav className="bg-slate-800">
      <div className="flex items-center space-x-4 px-4 py-2">
        <NavLink
          className={({ isActive }) => (isActive ? activeLink : inactiveLink)}
          to={"/dashboard"}
        >
          Dashboard
        </NavLink>
        <NavLink
          className={({ isActive }) => (isActive ? activeLink : inactiveLink)}
          to={"/accounts"}
        >
          Accounts
        </NavLink>
        <NavLink
          className={({ isActive }) => (isActive ? activeLink : inactiveLink)}
          to={"/savings"}
        >
          Savings
        </NavLink>
        <NavLink
          className={({ isActive }) => (isActive ? activeLink : inactiveLink)}
          to={"/goals"}
        >
          Goals
        </NavLink>
      </div>
    </nav>
  );
};
