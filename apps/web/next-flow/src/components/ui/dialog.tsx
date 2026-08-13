"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./button";

function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal(props: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/30 duration-150 supports-backdrop-filter:backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 dark:bg-black/60",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  closeLabel = "Close dialog",
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
  closeLabel?: string;
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid max-h-[92dvh] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-6 overflow-hidden rounded-none border border-border bg-popover p-6 text-sm text-popover-foreground shadow-md duration-150 outline-none sm:max-w-md data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-3 right-3"
                aria-label={closeLabel}
                title={closeLabel}
              />
            }
          >
            <X className="size-4" aria-hidden="true" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("flex flex-col gap-2", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("font-heading text-lg font-semibold uppercase tracking-[0.06em]", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  );
}

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function useDialogFocus<T extends HTMLElement = HTMLDivElement>(
  open: boolean,
  onClose: () => void,
  closeOnEscape: boolean,
) {
  const panelRef = React.useRef<T>(null);
  const onCloseRef = React.useRef(onClose);

  React.useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  React.useEffect(() => {
    if (!open) return;

    const priorFocus = document.activeElement as HTMLElement | null;
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => {
      const firstFocusable = panelRef.current?.querySelector<HTMLElement>(focusableSelector);
      (firstFocusable ?? panelRef.current)?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && closeOnEscape) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = priorOverflow;
      priorFocus?.focus();
    };
  }, [closeOnEscape, open]);

  return panelRef;
}

interface DialogBaseProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeLabel?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

function useOpenChange(
  onClose: () => void,
  closeOnBackdrop: boolean,
  closeOnEscape: boolean,
) {
  return React.useCallback(
    (nextOpen: boolean, details: DialogPrimitive.Root.ChangeEventDetails) => {
      if (nextOpen) return;
      if (details.reason === "outside-press" && !closeOnBackdrop) return;
      if (details.reason === "escape-key" && !closeOnEscape) return;
      onClose();
    },
    [closeOnBackdrop, closeOnEscape, onClose],
  );
}

export interface ModalProps extends DialogBaseProps {
  size?: "sm" | "md" | "lg";
}

const modalSizes: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-xl",
  lg: "sm:max-w-3xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  closeLabel = "Close dialog",
  closeOnBackdrop = true,
  closeOnEscape = true,
  size = "md",
  className,
}: ModalProps) {
  const handleOpenChange = useOpenChange(onClose, closeOnBackdrop, closeOnEscape);
  return (
    <Dialog open={open} onOpenChange={handleOpenChange} disablePointerDismissal={!closeOnBackdrop}>
      <DialogContent
        closeLabel={closeLabel}
        className={cn("flex flex-col gap-0 p-0", modalSizes[size], className)}
      >
        <DialogHeader className="border-b border-border px-5 py-4 pr-14 sm:px-6">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && (
          <DialogFooter className="border-t border-border bg-muted/40 px-5 py-4 sm:px-6">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export interface DrawerProps extends DialogBaseProps {
  side?: "right" | "left" | "bottom";
  size?: "sm" | "md" | "lg";
}

const drawerSizes: Record<NonNullable<DrawerProps["size"]>, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-xl",
};

const drawerSides: Record<NonNullable<DrawerProps["side"]>, string> = {
  right:
    "inset-x-0 top-auto bottom-0 left-0 max-h-[90dvh] translate-x-0 translate-y-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:max-h-none",
  left:
    "inset-x-0 top-auto bottom-0 left-0 max-h-[90dvh] translate-x-0 translate-y-0 sm:inset-y-0 sm:right-auto sm:left-0 sm:h-full sm:max-h-none",
  bottom: "inset-x-0 top-auto bottom-0 left-0 max-h-[90dvh] max-w-none translate-x-0 translate-y-0",
};

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  closeLabel = "Close drawer",
  closeOnBackdrop = true,
  closeOnEscape = true,
  side = "right",
  size = "md",
  className,
}: DrawerProps) {
  const handleOpenChange = useOpenChange(onClose, closeOnBackdrop, closeOnEscape);
  return (
    <Dialog open={open} onOpenChange={handleOpenChange} disablePointerDismissal={!closeOnBackdrop}>
      <DialogContent
        closeLabel={closeLabel}
        className={cn(
          "flex w-full flex-col gap-0 p-0",
          drawerSides[side],
          side !== "bottom" && drawerSizes[size],
          className,
        )}
      >
        <DialogHeader className="border-b border-border px-5 py-4 pr-14 sm:px-6">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && (
          <DialogFooter className="border-t border-border bg-muted/40 px-5 py-4 sm:px-6">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
