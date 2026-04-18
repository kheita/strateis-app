import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown, ChevronsLeft, ChevronsRight, LogOut, Activity } from "lucide-react";
import { NAVIGATION, type NavSection, type NavModule } from "../../config/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { Logo, LogoMark } from "../brand/Logo";
import { Tooltip } from "../common/Tooltip";
import { Badge } from "../common/Badge";
import { Kbd, getModKeyLabel } from "../common/Kbd";
import { cn } from "../../lib/cn";

type Props = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenStatus: () => void;
};

export function Sidebar({ collapsed, onToggleCollapse, onOpenStatus }: Props) {
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
        {collapsed ? (
          <LogoMark size={26} />
        ) : (
          <Logo size={26} />
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {NAVIGATION.map((section) => (
          <SidebarSection key={section.id} section={section} collapsed={collapsed} />
        ))}
      </nav>

      <SidebarFooter
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        onOpenStatus={onOpenStatus}
      />
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

  const link = (
    <NavLink
      to={module.path}
      className={({ isActive }) =>
        cn(
          "group relative mx-2 flex items-center gap-2.5 rounded-md text-[12.5px] transition-base no-tap-highlight",
          collapsed ? "h-9 w-9 justify-center" : "px-2.5 py-1.5",
          isActive
            ? "surface-hover text-primary"
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
            className={cn("shrink-0", isActive ? "text-gold" : "text-tertiary group-hover:text-secondary")}
          />
          {!collapsed && (
            <>
              <span className="truncate">{module.label}</span>
              {module.badge && (
                <Badge variant="soon" className="ml-auto">
                  {module.badge}
                </Badge>
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

function SidebarFooter({
  collapsed,
  onToggleCollapse,
  onOpenStatus,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenStatus: () => void;
}) {
  const { user, signOut } = useAuth();
  const email = user?.email ?? "";
  const initials = (email[0] ?? "?").toUpperCase();
  const name = email.split("@")[0]?.replace(/\./g, " ") ?? "Utilisateur";

  return (
    <div className="border-subtle border-t px-2 py-2">
      <div className={cn("flex flex-col gap-0.5", collapsed && "items-center")}>
        <Tooltip label="Statut système" side="right" shortcut="">
          <button
            type="button"
            onClick={onOpenStatus}
            className={cn(
              "group hover:surface-subtle flex w-full items-center gap-2.5 rounded-md text-[12px] text-secondary transition-base hover:text-primary",
              collapsed ? "h-9 w-9 justify-center" : "px-2.5 py-1.5",
            )}
          >
            <Activity size={14} strokeWidth={1.6} className="text-tertiary group-hover:status-ok shrink-0" />
            {!collapsed && <span>Statut système</span>}
          </button>
        </Tooltip>

        <Tooltip label={collapsed ? "Déplier" : "Replier"} side="right" shortcut={`${getModKeyLabel()} \\`}>
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              "group hover:surface-subtle flex w-full items-center gap-2.5 rounded-md text-[12px] text-secondary transition-base hover:text-primary",
              collapsed ? "h-9 w-9 justify-center" : "px-2.5 py-1.5",
            )}
          >
            {collapsed ? (
              <ChevronsRight size={14} strokeWidth={1.75} className="text-tertiary" />
            ) : (
              <ChevronsLeft size={14} strokeWidth={1.75} className="text-tertiary" />
            )}
            {!collapsed && <span>Réduire le menu</span>}
          </button>
        </Tooltip>
      </div>

      <div className="border-subtle mt-2 border-t pt-2">
        <div
          className={cn(
            "flex items-center gap-2.5",
            collapsed ? "flex-col" : "px-1.5 py-1",
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
          <Tooltip label="Se déconnecter" side={collapsed ? "right" : "top"}>
            <button
              type="button"
              onClick={signOut}
              aria-label="Se déconnecter"
              className="hover:surface-subtle text-tertiary hover:text-primary rounded-md p-1.5 transition-base"
            >
              <LogOut size={13} strokeWidth={1.75} />
            </button>
          </Tooltip>
        </div>
        {!collapsed && (
          <div className="mt-2 px-1.5">
            <Kbd className="mr-1">{getModKeyLabel()}</Kbd>
            <Kbd>K</Kbd>
            <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Recherche globale
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
