import { LINE_META } from '@/lib/lines';
import { LineId } from '@/lib/types';

export default function LineBadge({ lineId }: { lineId: LineId }) {
  const meta = LINE_META[lineId];
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-display text-xs font-semibold tracking-tight ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder}`}
    >
      {meta.code}
    </span>
  );
}
