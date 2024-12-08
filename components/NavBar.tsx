"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/training", label: "Training" },
  { href: "/statistics", label: "Statistics" },
];

const NavBar = () => {
  const pathname = usePathname();

  return (
    <div className="flex justify-between items-center py-4">
      <div className="text-xl font-bold">
        <Link href="/">Training Tracker</Link>
      </div>
      <div className="flex gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? "font-bold" : ""}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NavBar;
