import { useState } from "react";
import { Menu, X } from "lucide-react";
import TitleName from "./TitleName";
import growlabLogo from "../assets/growlab-icon.svg";
import NavButton from "./NavButton";
import { Link, useLocation } from "react-router-dom";

/**
 * Responsive top navigation bar with the GrowLab logo, brand name, and page links.
 * No props required.
 */
export default function NavBar() {
  const location = useLocation();
  const path = location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", title: "Home", active: path === "/" },
    { to: "/simulate", title: "SimLab", active: path.startsWith("/simulate") },
    { to: "/data", title: "YieldIQ", active: path === "/data" },
    { to: "/about", title: "About", active: path === "/about" },
  ];

  return (
    <div className="relative">
      <div className="flex flex-row justify-between items-center px-6 md:px-20 py-4 z-[1000] border-b border-gray-200">
        <Link to="/" className="flex flex-row gap-3 items-center">
          <img src={growlabLogo} width={32} height={32} />
          <TitleName />
        </Link>

        {/* Desktop nav — visible on medium size + */}
        <div className="hidden md:flex">
          {navLinks.map(({ to, title, active }) => (
            <Link key={to} to={to}>
              <NavButton title={title} isCurrPage={active} />
            </Link>
          ))}
        </div>

        {/* Hamburger menu — visible below medium size */}
        <button
          className="flex md:hidden items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown - only renders when hamburger button clicked */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-md z-50 flex flex-col items-start px-4 py-2">
          {navLinks.map(({ to, title, active }) => (
            <Link
              key={to}
              to={to}
              className="w-full"
              onClick={() => setMenuOpen(false)}
            >
              <NavButton title={title} isCurrPage={active} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
