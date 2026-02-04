"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Users, MessageCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/events");
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* 하단 탭바 */}
      <nav className="border-t bg-background">
        <div className="flex justify-around items-center py-2">
          <NavItem href="/dashboard" icon={<BookOpen size={20} />} label="경조사" active={isActive("/dashboard")} />
          <NavItem href="/dashboard/friends" icon={<Users size={20} />} label="지인" active={isActive("/dashboard/friends")} />
          <NavItem href="/dashboard/chat" icon={<MessageCircle size={20} />} label="AI 비서" active={isActive("/dashboard/chat")} />
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 transition-colors px-4 py-1 ${
        active
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}
