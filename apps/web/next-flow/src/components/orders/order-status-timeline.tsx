import { Check, XCircle } from "lucide-react";

const steps = [
  { key: "SENT", label: "Sent" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PREPARING", label: "Preparing" },
  { key: "COMING_TO_TABLE", label: "Coming to table" },
  { key: "SERVED", label: "Served" },
] as const;

export function OrderStatusTimeline({ status }: { status: string }) {
  if (status === "REJECTED" || status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-md border border-[#e8b8b3] bg-[#fff0ee] px-3 py-2.5 text-[#8e3d36]" role="status">
        <XCircle className="size-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-xs font-bold">Order {status.toLocaleLowerCase()}</p>
          <p className="mt-0.5 text-[10px] opacity-75">This order is no longer moving through preparation.</p>
        </div>
      </div>
    );
  }
  const activeIndex = Math.max(0, steps.findIndex((step) => step.key === status));

  return (
    <ol className="grid grid-cols-5" aria-label={`Order status: ${steps[activeIndex]?.label ?? status}`}>
      {steps.map((step, index) => {
        const complete = index <= activeIndex;
        const current = index === activeIndex;
        return (
          <li className="relative flex min-w-0 flex-col items-center text-center" key={step.key}>
            {index > 0 && (
              <span className={`absolute right-1/2 top-3 h-px w-full ${index <= activeIndex ? "bg-forest" : "bg-line"}`} />
            )}
            <span
              className={`relative z-10 grid size-6 place-items-center rounded-full border text-[10px] font-bold ${
                complete ? "border-forest bg-forest text-white" : "border-line bg-white text-foreground/35"
              } ${current ? "ring-4 ring-forest-soft" : ""}`}
              aria-current={current ? "step" : undefined}
            >
              {index < activeIndex ? <Check className="size-3" aria-hidden="true" /> : index + 1}
            </span>
            <span className={`mt-2 hidden text-[10px] leading-tight sm:block ${current ? "font-bold text-forest" : "text-foreground/45"}`}>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
