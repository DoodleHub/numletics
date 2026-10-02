import { SiteHeader } from "@/components/layout/site-header";

// Signed-in pages share the header and footer here, so they stay put while a page's loading.tsx
// skeleton shows during navigation. Each page still gates itself with requireUser().
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col px-4 md:px-[77px]">
      <SiteHeader />
      {children}
      <footer className="py-10 text-center text-base text-muted md:pt-[50px] md:text-caption">
        Two problems. Every day.
      </footer>
    </div>
  );
}
