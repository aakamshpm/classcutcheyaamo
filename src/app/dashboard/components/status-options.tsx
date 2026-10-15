import { CheckIcon, CloseIcon, HalfIcon } from "@/app/components/icons";
import type { DayStatus } from "@/lib/attendance";

// the four things a day can be marked as. `tone` picks the --status-* colours.
export const STATUS_OPTIONS: {
  status: DayStatus;
  label: string;
  tone: string;
  icon: React.ReactNode;
}[] = [
  {
    status: "present",
    label: "present",
    tone: "present",
    icon: <CheckIcon className="h-4 w-4" />,
  },
  {
    status: "half_day",
    label: "half day",
    tone: "half",
    icon: <HalfIcon className="h-4 w-4" />,
  },
  {
    status: "absent",
    label: "absent",
    tone: "absent",
    icon: <CloseIcon className="h-4 w-4" />,
  },
  {
    status: "holiday",
    label: "no class",
    tone: "holiday",
    icon: null,
  },
];
