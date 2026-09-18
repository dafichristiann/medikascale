type ChipTone = 'green' | 'amber' | 'red' | 'grey' | 'white' | 'blue';

const toneClass: Record<ChipTone, string> = {
  green: 'bg-status-greenTint text-status-green',
  amber: 'bg-status-amberTint text-status-amber',
  red: 'bg-status-redTint text-status-red',
  grey: 'bg-status-greyTint text-status-grey',
  white: 'bg-white text-slate border border-border',
  blue: 'bg-blue-50 text-blue-700 border border-blue-200',
};

export default function Chip({ tone, children }: { tone: ChipTone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full ${toneClass[tone]}`}>
      {children}
    </span>
  );
}
