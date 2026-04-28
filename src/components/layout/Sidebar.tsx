"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, ClipboardList, Search } from "lucide-react";

const navigation = [
  { name: "Главная", href: "/", icon: Home },
  { name: "Документы", href: "/documents", icon: FileText },
  { name: "Требования", href: "/requirements", icon: ClipboardList },
  { name: "Поиск", href: "/search", icon: Search },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">AI</span>
          </div>
          <div>
            <h1 className="font-semibold text-sm">Regulatory Assistant</h1>
            <p className="text-xs text-muted-foreground">Сопоставление требований</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <p>v0.1.0 MVP</p>
        </div>
      </div>
    </aside>
  );
}
