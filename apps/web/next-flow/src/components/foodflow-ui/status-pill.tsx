import { Badge, type BadgeProps } from "./badge";

export function StatusPill(props: BadgeProps) {
  return <Badge dot {...props} />;
}
