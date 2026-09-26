"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ComponentType } from "react";
import {
  BarChart3,
  Calendar,
  CalendarDays,
  ChevronLeft,
  FileText,
  LayoutDashboard,
  Menu,
  Moon,
  Monitor,
  Sliders,
  Sun,
  Users,
  Wallet,
} from "lucide-react";
import { useTheme, type ThemeMode } from "@/contexts/ThemeContext";

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "PILOTAGE",
    items: [
      { label: "Tableau de bord", href: "/", icon: LayoutDashboard },
      { label: "Calendrier", href: "/calendrier", icon: Calendar },
      { label: "Agents", href: "/agents", icon: Users },
      { label: "Plannings", href: "/plannings", icon: CalendarDays },
    ],
  },
  {
    title: "DÉCOMPTE",
    items: [
      { label: "Décompte hebdo", href: "/decompte/hebdo", icon: FileText },
      { label: "Décompte mensuel", href: "/decompte/mensuel", icon: BarChart3 },
      { label: "Paie", href: "/paie", icon: Wallet },
      { label: "Règles de majoration", href: "/regles-majoration", icon: Sliders },
    ],
  },
];

const themeOptions: Array<{
  mode: ThemeMode;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { mode: "light", label: "Clair", icon: Sun },
  { mode: "dark", label: "Sombre", icon: Moon },
  { mode: "system", label: "Système", icon: Monitor },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { themeMode, setThemeMode } = useTheme();

  return (
    <aside
      className={`fixed left-0 top-0 z-30 flex h-screen flex-col overflow-visible border-r border-white/10 bg-gradient-to-b from-[#1f754b] via-[#17643f] to-[#104c30] text-white shadow-[8px_0_30px_rgba(10,54,34,0.12)] transition-all duration-300 ${
        isCollapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-emerald-200/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-black/10 blur-3xl" />

      {isCollapsed ? (
        <div className="relative z-10 flex flex-col items-center space-y-3 border-b border-white/10 bg-black/5 p-3">
          <div
            className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-lg ring-1 ring-white/40"
            title="LA FIPA - Heures supplémentaires"
          >
            <Image
              src="/branding/logo-fipa.jpeg"
              alt="Logo La FIPA"
              width={32}
              height={32}
              className="rounded object-contain"
              priority
            />
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="rounded-2xl p-2 text-emerald-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/15 hover:text-white hover:shadow-sm"
            title="Déployer la sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-black/5 p-3">
          <div className="flex min-w-0 items-center space-x-3 overflow-hidden">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-lg ring-1 ring-white/40">
              <Image
                src="/branding/logo-fipa.jpeg"
                alt="Logo La FIPA"
                width={36}
                height={36}
                className="rounded object-contain"
                priority
              />
            </div>
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="text-sm font-bold leading-tight tracking-[0.16em]">LA FIPA</h1>
              <p className="truncate text-[10px] font-medium uppercase tracking-wider text-emerald-100">
                Heures supplémentaires
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="shrink-0 rounded-2xl p-2 text-emerald-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/15 hover:text-white hover:shadow-sm"
            title="Replier la sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className={`relative z-10 flex-1 space-y-5 overflow-y-auto py-4 custom-scrollbar ${isCollapsed ? "px-2" : "px-3"}`}>
        {navSections.map((section) => (
          <div key={section.title} className="space-y-2">
            {!isCollapsed && (
              <div className="mb-2 flex items-center gap-2 px-3">
                <span className="h-px w-3 bg-emerald-200/50" />
                <h2 className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-100/75">
                  {section.title}
                </h2>
              </div>
            )}
            {isCollapsed && <div className="mx-auto mb-2 h-px w-7 bg-white/15" />}
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    aria-current={isActive ? "page" : undefined}
                    className={`group relative flex min-h-10 items-center gap-3 rounded-2xl px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-white/[0.18] font-semibold text-white shadow-[0_8px_18px_rgba(0,0,0,0.10)]"
                        : "text-emerald-50/85 hover:-translate-y-0.5 hover:translate-x-0.5 hover:bg-white/[0.10] hover:text-white hover:shadow-sm"
                    } ${isCollapsed ? "w-11 justify-center px-0" : ""}`}
                  >
                    <Icon
                      strokeWidth={isActive ? 2.3 : 1.9}
                      className={`h-[21px] w-[21px] shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? "text-emerald-50" : "text-emerald-200/90"
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className={`relative z-10 px-3 pb-3 ${isCollapsed ? "flex justify-center" : ""}`}>
        <div
          className={`rounded-2xl border border-white/10 bg-black/10 p-1 shadow-inner ${
            isCollapsed ? "flex flex-col gap-1" : "grid grid-cols-3 gap-1"
          }`}
          aria-label="Choisir le thème"
        >
          {themeOptions.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setThemeMode(mode)}
              title={isCollapsed ? label : undefined}
              aria-label={`Thème ${label}`}
              aria-pressed={themeMode === mode}
              className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                themeMode === mode
                  ? "bg-white text-[#155435] shadow-md"
                  : "text-emerald-100 hover:bg-white/15 hover:text-white"
              } ${isCollapsed ? "h-9 w-9 px-0" : "min-w-0"}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span className="truncate">{label}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className={`relative z-10 border-t border-white/10 bg-black/10 p-3 ${isCollapsed ? "flex justify-center" : ""}`}>
        {isCollapsed ? (
          <div
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-bold text-white shadow-inner ring-1 ring-white/20"
            title="Marie Diallo (Administratrice)"
          >
            <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-300 ring-2 ring-[#145b39]" />
            MD
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl px-2 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-sm">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-bold text-white shadow-inner ring-1 ring-white/20">
              <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-emerald-300 ring-2 ring-[#145b39]" />
              MD
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-[13px] font-semibold text-white">Marie Diallo</p>
              <p className="truncate text-[11px] text-emerald-200">Administratrice</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
