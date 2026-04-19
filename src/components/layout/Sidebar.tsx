import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { NAVIGATION, type NavSection, type NavModule } from "../../config/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { Logo, LogoMark } from "../brand/Logo";
import { Tooltip } from "../common/Tooltip";
import { getModKeyLabel } from "../common/Kbd";
import { ShortcutsModal } from "../help/ShortcutsModal";
import { cn } from "../../lib/cn";

type Props = {
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export function Sidebar({ collapsed, onToggleCollapse }: Props) {
  return (
    <aside
      className={cn(
        "surface flex h-full flex-col border-r border-subtle transition-[width] duration-200 ease-out",
        collapsed ? "w-[64px]" : "w-[248px]",
      )}
    >
      <div
        className={cn(
          "flex h-[56px] items-center border-b border-subtle",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        {collapsed ? <LogoMark size={26} /> : <Logo size={26} />}
        {!collapsed && (
          <Tooltip
            label="Replier la sidebar"
            side="bottom"
            shortcut={`${getModKeyLabel()} \\`}
          >
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Replier la sidebar"
              className="hover:surface-subtle text-muted hover:text-secondary flex h-6 w-6 items-center justify-center rounded transition-base"
            >
              <PanelLeftClose size={13} strokeWidth={1.75} />
            </button>
          </Tooltip>
        )}
      </div>
      {collapsed && (
        <div className="flex justify-center border-b border-subtle py-1.5">
          <Tooltip
            label="Déployer la sidebar"
            side="right"
            shortcut={`${getModKeyLabel()} \\`}
          >
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Déployer la sidebar"
              className="hover:surface-subtle text-muted hover:text-secondary flex h-6 w-6 items-center justify-center rounded transition-base"
            >
              <PanelLeftOpen size={13} strokeWidth={1.75} />
            </button>
          </Tooltip>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-3">
        {NAVIGATION.map((section) => (
          <SidebarSection key={section.id} section={section} collapsed={collapsed} />
        ))}
      </nav>

      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
}

function SidebarSection({ section, collapsed }: { section: NavSection; collapsed: boolean }) {
  const [open, setOpen] = useState(true);

  if (collapsed) {
    return (
      <div className="mb-3">
        <div className="mb-1 px-2">
          <div className="border-subtle border-b" />
        </div>
        {section.modules.map((m) => (
          <SidebarItem key={m.id} module={m} collapsed />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group hover:surface-subtle mx-2 flex w-[calc(100%-16px)] items-center gap-1.5 rounded-md px-2 py-1.5 transition-base"
      >
        <ChevronDown
          size={11}
          strokeWidth={2.25}
          className={cn(
            "text-muted transition-transform duration-200",
            !open && "-rotate-90",
          )}
        />
        <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-tertiary group-hover:text-secondary">
          {section.label}
        </span>
        <span className="ml-auto font-mono text-[9.5px] text-muted">
          {section.modules.length}
        </span>
      </button>
      {open && (
        <div className="mt-1">
          {section.modules.map((m) => (
            <SidebarItem key={m.id} module={m} collapsed={false} />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarItem({ module, collapsed }: { module: NavModule; collapsed: boolean }) {
  const Icon = module.icon;
  const isSoon = !!module.badge;

  const link = (
    <NavLink
      to={module.path}
      className={({ isActive }) =>
        cn(
          "group relative mx-2 flex items-center gap-2.5 rounded-md text-[12.5px] transition-base no-tap-highlight",
          collapsed ? "h-9 w-9 justify-center" : "px-2.5 py-1.5",
          isActive
            ? "surface-hover text-primary"
            : isSoon
              ? "text-tertiary hover:surface-subtle hover:text-secondary"
              : "text-secondary hover:surface-subtle hover:text-primary",
        )
      }
      end={false}
    >
      {({ isActive }) => (
        <>
          {isActive && !collapsed && (
            <span className="bg-gold absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full" />
          )}
          {isActive && collapsed && (
            <span className="bg-gold absolute -left-2 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full" />
          )}
          <Icon
            size={collapsed ? 16 : 14.5}
            strokeWidth={1.6}
            className={cn(
              "shrink-0",
              isActive
                ? "text-gold"
                : isSoon
                  ? "text-muted group-hover:text-tertiary"
                  : "text-tertiary group-hover:text-secondary",
            )}
          />
          {!collapsed && (
            <>
              <span className="truncate">{module.label}</span>
              {isSoon && (
                <span className="ml-auto font-mono text-[10px] lowercase tracking-normal text-muted">
                  bientôt
                </span>
              )}
            </>
          )}
        </>
      )}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip label={module.label} side="right">
        {link}
      </Tooltip>
    );
  }
  return link;
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const { user, signOut } = useAuth();
  const [helpOpen, setHelpOpen] = useState(false);
  const email = user?.email ?? "";
  const initials = (email[0] ?? "?").toUpperCase();
  const name = email.split("@")[0]?.replace(/\./g, " ") ?? "Utilisateur";

  const helpButton = (
    <button
      type="button"
      onClick={() => setHelpOpen(true)}
      className={cn(
        "group hover:surface-subtle flex w-full items-center gap-2.5 rounded-md text-[12px] text-secondary transition-base hover:text-primary",
        collapsed ? "h-9 w-9 justify-center" : "px-2.5 py-1.5",
      )}
    >
      <HelpCircle
        size={14}
        strokeWidth={1.6}
        className="text-tertiary group-hover:text-secondary shrink-0"
      />
      {!collapsed && <span>Aide & raccourcis</span>}
    </button>
  );

  const settingsLink = (
    <NavLink
      to="/settings"
      className={({ isActive }) =>
        cn(
          "group flex w-full items-center gap-2.5 rounded-md text-[12px] transition-base no-tap-highlight",
          collapsed ? "h-9 w-9 justify-center" : "px-2.5 py-1.5",
          isActive
            ? "surface-hover text-primary"
            : "text-secondary hover:surface-subtle hover:text-primary",
        )
      }
    >
      {({ isActive }) => (
        <>
          <Settings
            size={14}
            strokeWidth={1.6}
            className={cn(
              "shrink-0",
              isActive ? "text-gold" : "text-tertiary group-hover:text-secondary",
            )}
          />
          {!collapsed && <span>Paramètres</span>}
        </>
      )}
    </NavLink>
  );

  return (
    <>
      <ShortcutsModal open={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Group 1: Help + Settings */}
      <div className="border-subtle border-t px-2 py-2">
        <div className={cn("flex flex-col gap-0.5", collapsed && "items-center")}>
          {collapsed ? (
            <Tooltip label="Aide & raccourcis" side="right">
              {helpButton}
            </Tooltip>
          ) : (
            helpButton
          )}
          {collapsed ? (
            <Tooltip label="Paramètres" side="right">
              {settingsLink}
            </Tooltip>
          ) : (
            settingsLink
          )}
        </div>
      </div>

      {/* Group 2: Identity */}
      <div className="border-subtle border-t px-2 py-2">
        <div
          className={cn(
            "flex items-center gap-2.5",
            collapsed ? "justify-center" : "px-1.5 py-1",
          )}
        >
          <Tooltip label={email || "Compte"} side="right">
            <div className="bg-gold-soft text-gold border-gold/30 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-medium uppercase">
              {initials}
            </div>
          </Tooltip>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-medium capitalize text-primary">{name}</div>
              <div className="truncate font-mono text-[10px] uppercase tracking-[0.1em] text-tertiary">
                {email}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Group 3: Logout — last visible element */}
      <div className="border-subtle border-t px-2 py-2">
        <div className={cn("flex flex-col gap-0.5", collapsed && "items-center")}>
          {collapsed ? (
            <Tooltip label="Se déconnecter" side="right">
              {logoutButton(signOut, true)}
            </Tooltip>
          ) : (
            logoutButton(signOut, false)
          )}
        </div>
      </div>
    </>
  );
}

function logoutButton(onClick: () => void, collapsed: boolean) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Se déconnecter"
      className={cn(
        "group hover:surface-subtle flex w-full items-center gap-2.5 rounded-md text-[12px] text-secondary transition-base hover:text-primary",
        collapsed ? "h-9 w-9 justify-center" : "px-2.5 py-1.5",
      )}
    >
      <LogOut
        size={14}
        strokeWidth={1.6}
        className="text-tertiary group-hover:text-secondary shrink-0"
      />
      {!collapsed && <span>Se déconnecter</span>}
    </button>
  );
}
