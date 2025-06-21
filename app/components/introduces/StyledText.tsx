import { TextReveal } from '@/components/magicui/text-reveal';

import { cn } from '@/lib/utils';

interface StyledTextProps {
  text: string;
  className?: string;
}

export function TitleText({ text, className }: StyledTextProps) {
  return (
    <TextReveal
      text={text}
      className={cn(
        'text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent',
        className
      )}
    />
  );
}

export function SubtitleText({ text, className }: StyledTextProps) {
  return (
    <TextReveal
      text={text}
      className={cn('text-xl text-neutral-800 dark:text-neutral-200', className)}
    />
  );
}

export function BodyText({ text, className }: StyledTextProps) {
  return (
    <TextReveal
      text={text}
      className={cn(
        'text-neutral-600 dark:text-neutral-400 whitespace-pre-line leading-relaxed',
        className
      )}
    />
  );
}
