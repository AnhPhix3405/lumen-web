"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/lib/token-store";
import { logout } from "@/lib/auth-api";
import { useState } from "react";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/tests", label: "Tests", icon: "📝" },
  { href: "/my-results", label: "My Results", icon: "📊" },
  { href: "/dashboard", label: "Dashboard", icon: "⚡" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // ignore errors
    } finally {
      clearToken();
      router.push("/login");
    }
  };

  return (
    <nav style={s.nav}>
      <div style={s.inner}>
        {/* Logo */}
        <Link href="/tests" style={s.logo}>
          <Image
            src="/imgs/logo.png"
            alt="Lumen Logo"
            width={100}
            height={100}
            style={s.logoImage}
          />
          <span style={s.logoText}>Lumen</span>
        </Link>

        {/* Desktop links */}
        <div style={s.links}>
          {NAV_LINKS.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} style={{ ...s.link, ...(active ? s.linkActive : {}) }}>
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Account actions */}
        <div style={s.actions}>
          <button
            id="logout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
            style={s.logoutBtn}
          >
            {loggingOut ? "…" : "Sign out"}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button style={s.hamburger} onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
          <span style={{ fontSize: 20 }}>☰</span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={s.mobileMenu}>
          {NAV_LINKS.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              style={s.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              {icon} {label}
            </Link>
          ))}
          <button onClick={handleLogout} disabled={loggingOut} style={s.mobileLinkBtn}>
            🚪 {loggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </nav>
  );
}

const s: Record<string, React.CSSProperties> = {
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    height: 60,
    background: "rgba(7,7,15,0.85)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  },
  inner: {
    maxWidth: 1280,
    margin: "0 auto",
    height: "100%",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
    marginRight: 16,
  },
  logoImage: {
    objectFit: "contain",
  },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    background: "linear-gradient(135deg, #818cf8, #c084fc)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  links: {
    display: "flex",
    gap: 4,
    flex: 1,
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 8,
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 500,
    color: "rgba(255,255,255,0.55)",
    transition: "all 0.15s",
  },
  linkActive: {
    background: "rgba(99,102,241,0.15)",
    color: "#a5b4fc",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginLeft: "auto",
  },
  logoutBtn: {
    padding: "6px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.55)",
    transition: "all 0.15s",
  },
  hamburger: {
    display: "none",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "rgba(255,255,255,0.7)",
    padding: 4,
  },
  mobileMenu: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    background: "rgba(10,10,20,0.97)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column",
    padding: "8px 16px 16px",
    gap: 4,
  },
  mobileLink: {
    padding: "12px 16px",
    borderRadius: 8,
    textDecoration: "none",
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
  },
  mobileLinkBtn: {
    padding: "12px 16px",
    borderRadius: 8,
    textAlign: "left",
    background: "none",
    border: "none",
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    cursor: "pointer",
  },
};
