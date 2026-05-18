import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export const siteShellClassName =
  "mx-auto max-w-[1180px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8";

export const articleColumnClassName = "mx-auto max-w-[820px]";

export function PageShell({ children, className }: Props) {
  return <main className={cn(siteShellClassName, className)}>{children}</main>;
}

export function ArticleColumn({ children, className }: Props) {
  return (
    <article className={cn(articleColumnClassName, className)}>
      {children}
    </article>
  );
}
