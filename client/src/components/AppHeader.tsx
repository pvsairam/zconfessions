import { ReactNode } from "react";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  rightSlot?: ReactNode;
  titleTestId?: string;
}

export function AppHeader({ title, subtitle, icon, rightSlot, titleTestId = "text-page-title" }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/98 backdrop-blur-md border-b border-border/60 pt-safe">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16 sm:h-18 gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {icon && (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-semibold truncate tracking-tight" data-testid={titleTestId}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground/70 truncate font-medium mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {rightSlot}
        </div>
      </div>
    </header>
  );
}
