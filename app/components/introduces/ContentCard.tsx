import { BorderBeam } from '@/app/components/magicui/border-beam';

interface ContentCardProps {
  children: React.ReactNode;
  reverse?: boolean;
}

export function ContentCard({ children, reverse = false }: ContentCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-800 dark:via-neutral-900 dark:to-neutral-950">
      <BorderBeam
        className="opacity-50"
        reverse={reverse}
        colorFrom="#3b82f6"
        colorTo="#8b5cf6"
        size={100}
        duration={4}
      />
      <div className="relative z-10 p-8 backdrop-blur-[1px]">{children}</div>
    </div>
  );
}
