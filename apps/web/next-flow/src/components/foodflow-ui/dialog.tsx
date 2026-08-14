"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "./button";

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
      const firstFocusable =
        panelRef.current?.querySelector<HTMLElement>(focusableSelector);
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

function AccessibleCloseButton({ label }: { label: string }) {
  return (
    <DialogClose
      render={
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute top-4 right-4 bg-secondary"
          aria-label={label}
          title={label}
        />
      }
    >
      <X className="size-4" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </DialogClose>
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
  const handleOpenChange = useOpenChange(
    onClose,
    closeOnBackdrop,
    closeOnEscape,
  );

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      disablePointerDismissal={!closeOnBackdrop}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex max-h-[92dvh] flex-col gap-0 overflow-hidden p-0",
          modalSizes[size],
          className,
        )}
      >
        <AccessibleCloseButton label={closeLabel} />
        <DialogHeader className="border-b border-border px-5 py-4 pr-14 sm:px-6">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>
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
  bottom:
    "inset-x-0 top-auto bottom-0 left-0 max-h-[90dvh] max-w-none translate-x-0 translate-y-0",
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
  const handleOpenChange = useOpenChange(
    onClose,
    closeOnBackdrop,
    closeOnEscape,
  );

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      disablePointerDismissal={!closeOnBackdrop}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex w-full flex-col gap-0 overflow-hidden p-0",
          drawerSides[side],
          side !== "bottom" && drawerSizes[size],
          className,
        )}
      >
        <AccessibleCloseButton label={closeLabel} />
        <DialogHeader className="border-b border-border px-5 py-4 pr-14 sm:px-6">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>
        {footer && (
          <DialogFooter className="border-t border-border bg-muted/40 px-5 py-4 sm:px-6">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
