import * as React from "react";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function CustomModal({
  open,
  onOpenChange,
  children,
}: CustomModalProps) {
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

      {/* Content */}
      <div className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-50">
        {children}
      </div>
    </div>
  );
}

interface CustomModalContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean;
  onClose?: () => void;
}

export function CustomModalContent({
  className,
  children,
  showCloseButton = true,
  onClose,
  ...props
}: CustomModalContentProps) {
  return (
    <div
      className={cn(
        "bg-background animate-in fade-in-0 zoom-in-95 relative grid w-full gap-4 rounded-lg border p-6 shadow-lg outline-none sm:max-w-lg",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
        >
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  );
}

export function CustomModalHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
}

export function CustomModalTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-foreground text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
}

export function CustomModalDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-muted-foreground text-sm",
        className
      )}
      {...props}
    />
  );
}
