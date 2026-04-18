import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useSidebarCollapse } from "../../hooks/useSidebarCollapse";
import { useCommandPalette } from "../../contexts/CommandPaletteContext";
import { findModuleByPath } from "../../config/navigation";
import { cn } from "../../lib/cn";
import { LogoMark } from "../brand/Logo";
import { StatusPanel } from "../status/StatusPanel";

export function AppShell() {
  const { collapsed, toggle: toggleCollapse } = useSidebarCollapse();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileStatusOpen, setMobileStatusOpen] = useState(false);
  const { openPalette } = useCommandPalette();

  // Update document title from current module
  useEffect(() => {
    const m = findModuleByPath(pathname);
    document.title = m ? `Strateis App — ${m.label}` : "Strateis App";
  }, [pathname]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="surface-app grid-bg flex h-screen w-screen overflow-hidden text-primary">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
          onOpenStatus={() => setMobileStatusOpen(true)}
        />
      </div>

      {/* Mobile drawer */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onOpenStatus={() => {
          setMobileOpen(false);
          setMobileStatusOpen(true);
        }}
      />

      {/* Mobile-only status sheet (desktop has its own dropdown in TopBar) */}
      <div className="md:hidden">
        <StatusPanel
          open={mobileStatusOpen}
          onClose={() => setMobileStatusOpen(false)}
          mode="sheet"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top utility bar */}
        <div className="surface border-subtle flex h-[52px] items-center justify-between border-b px-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir la navigation"
            className="hover:surface-subtle text-secondary flex h-9 w-9 items-center justify-center rounded-md transition-base"
          >
            <Menu size={16} strokeWidth={1.75} />
          </button>
          <LogoMark size={24} />
          <button
            type="button"
            onClick={openPalette}
            aria-label="Recherche"
            className="hover:surface-subtle text-secondary flex h-9 w-9 items-center justify-center rounded-md transition-base"
          >
            <span className="font-mono text-[10px]">⌘K</span>
          </button>
        </div>

        <div className="hidden md:block">
          <TopBar />
        </div>

        <main className="surface-app relative flex-1 overflow-hidden">
          <div className="h-full w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function MobileDrawer({
  open,
  onClose,
  onOpenStatus,
}: {
  open: boolean;
  onClose: () => void;
  onOpenStatus: () => void;
}) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200 md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-200 ease-out md:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="relative h-full">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la navigation"
            className="surface border-default text-tertiary hover:text-primary absolute -right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border shadow-elev-1"
          >
            <X size={13} strokeWidth={2} />
          </button>
          <Sidebar collapsed={false} onToggleCollapse={() => {}} onOpenStatus={onOpenStatus} />
        </div>
      </div>
    </>
  );
}
