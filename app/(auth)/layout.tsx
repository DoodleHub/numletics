import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col px-4 md:px-[77px]">
      <header className="pt-6 md:pt-[34px]">
        <Link
          href="/"
          aria-label="Numletics home"
          className="inline-block rounded-control focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          <Logo />
        </Link>
      </header>
      <main className="mx-auto w-full max-w-auth py-12 md:pt-[104px]">{children}</main>
    </div>
  );
}
