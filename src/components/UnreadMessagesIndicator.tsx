import { cn } from "@/lib/utils";

type UnreadMessagesIndicatorProps = {
  count: number;
  className?: string;
};

export function UnreadMessagesIndicator({ count, className }: UnreadMessagesIndicatorProps) {
  return (
    <span
      className={cn(
        "flex size-5 items-center justify-center rounded-full bg-destructive text-xs font-semibold text-white",
        className,
      )}
    >
      {count}
    </span>
  );
}
