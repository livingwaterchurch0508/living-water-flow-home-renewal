interface ContentCardProps {
  children: React.ReactNode;
  reverse?: boolean;
}

export function ContentCard({ children }: ContentCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-800 dark:via-neutral-900 dark:to-neutral-950 ">
      <div className="relative z-10 p-8 backdrop-blur-[1px]">{children}</div>
    </div>
  );
}
