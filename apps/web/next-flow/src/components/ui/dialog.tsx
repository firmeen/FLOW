"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { IconButton } from "./icon-button";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function useDialogFocus<T extends HTMLElement = HTMLDivElement>(open: boolean, onClose: () => void, closeOnEscape: boolean) {
  const panelRef = useRef<T>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
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
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

export interface ModalProps extends DialogBaseProps {
  size?: "sm" | "md" | "lg";
}

const modalSizes: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
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
  className = "",
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useDialogFocus(open, onClose, closeOnEscape);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#10271f]/55 p-0 backdrop-blur-[1px] sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={[
          "flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-lg border border-[#d9ded6] bg-[#fbfbf7]",
          "shadow-[0_24px_70px_rgba(10,31,24,0.26)] focus:outline-none sm:rounded-lg",
          modalSizes[size],
          className,
        ].filter(Boolean).join(" ")}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#e3e6df] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold tracking-[-0.02em] text-[#193027]">
              {title}
            </h2>
            {description && (
              <div id={descriptionId} className="mt-1 text-sm leading-5 text-[#69766f]">
                {description}
              </div>
            )}
          </div>
          <IconButton label={closeLabel} variant="ghost" size="sm" onClick={onClose}>
            <X className="size-4" aria-hidden="true" />
          </IconButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-[#e3e6df] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export interface DrawerProps extends DialogBaseProps {
  side?: "right" | "left" | "bottom";
  size?: "sm" | "md" | "lg";
}

const drawerSizes: Record<NonNullable<DrawerProps["size"]>, string> = {
  sm: "md:max-w-sm",
  md: "md:max-w-md",
  lg: "md:max-w-xl",
};

const drawerSides: Record<NonNullable<DrawerProps["side"]>, string> = {
  right: "inset-x-0 bottom-0 max-h-[90dvh] rounded-t-lg md:inset-y-0 md:right-0 md:left-auto md:h-full md:max-h-none md:rounded-none",
  left: "inset-x-0 bottom-0 max-h-[90dvh] rounded-t-lg md:inset-y-0 md:left-0 md:right-auto md:h-full md:max-h-none md:rounded-none",
  bottom: "inset-x-0 bottom-0 max-h-[90dvh] rounded-t-lg",
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
  className = "",
}: DrawerProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useDialogFocus(open, onClose, closeOnEscape);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#10271f]/55 backdrop-blur-[1px]"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={[
          "absolute flex w-full flex-col overflow-hidden border border-[#d9ded6] bg-[#fbfbf7]",
          "shadow-[0_16px_60px_rgba(10,31,24,0.28)] focus:outline-none",
          drawerSides[side],
          side === "bottom" ? "" : drawerSizes[size],
          className,
        ].filter(Boolean).join(" ")}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-[#cbd2cb] md:hidden" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4 border-b border-[#e3e6df] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold tracking-[-0.02em] text-[#193027]">
              {title}
            </h2>
            {description && (
              <div id={descriptionId} className="mt-1 text-sm leading-5 text-[#69766f]">
                {description}
              </div>
            )}
          </div>
          <IconButton label={closeLabel} variant="ghost" size="sm" onClick={onClose}>
            <X className="size-4" aria-hidden="true" />
          </IconButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-[#e3e6df] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
