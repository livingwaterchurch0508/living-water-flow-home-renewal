import { BorderBeam } from '@/app/components/magicui/border-beam';

interface ContentCardProps {
  children: React.ReactNode;
  reverse?: boolean;
}

export function ContentCard({ children, reverse = false }: ContentCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
      <BorderBeam className="opacity-20" reverse={reverse} />
      <div className="relative z-10 p-8">
        {children}
      </div>
    </div>
  );
} 