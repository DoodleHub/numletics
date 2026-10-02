import type { ComponentType, ReactNode, SVGProps } from "react";

export function Card({ children }: { children: ReactNode }) {
  return (
    <section className="flex flex-col rounded-card border border-line bg-surface px-6 pt-8 pb-6 md:px-[38px] md:pt-[45px] md:pb-[34px]">
      {children}
    </section>
  );
}

export function CardHeader({
  icon: Icon,
  title,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
}) {
  return (
    <h2 className="flex items-center gap-4 text-[1.625rem] font-bold leading-tight tracking-[-0.01em] md:gap-6 md:text-title">
      <Icon className="size-9 shrink-0 md:size-11" />
      {title}
    </h2>
  );
}
