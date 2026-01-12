import * as React from "react";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function CustomSheet({
  open,
  onOpenChange,
  children,
}: CustomSheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet Content */}
      {children}
    </div>
  );
}

export function CustomSheetTrigger({
  children,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  return <button {...props}>{children}</button>;
}

type SheetSide = "top" | "bottom" | "left" | "right";

interface CustomSheetContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  side?: SheetSide;
  onClose?: () => void;
}

const sideVariants: Record<SheetSide, string> = {
  top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
  bottom:
    "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
  left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
  right:
    "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
};

export function CustomSheetContent({
  className,
  children,
  side = "right",
  onClose,
  ...props
}: CustomSheetContentProps) {
  return (
    <div
      className={cn(
        "fixed z-50 gap-4 border border-gray-200 bg-white p-6 text-gray-950 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100",
        sideVariants[side],
        className
      )}
      data-state="open"
      {...props}
    >
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none dark:ring-gray-300 dark:ring-offset-slate-950"
        >
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  );
}

export function CustomSheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
}

export function CustomSheetTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold text-gray-950 dark:text-slate-100",
        className
      )}
      {...props}
    />
  );
}

export function CustomSheetDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-sm text-gray-500 dark:text-slate-400",
        className
      )}
      {...props}
    />
  );
}



