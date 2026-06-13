import Image from "next/image";
import Link from "next/link";

export const FILLS_LOGO_SRC = "/logo-fills-graphite.png";

type FillsLogoProps = {
  linked?: boolean;
  className?: string;
};

export function FillsLogo({ linked = true, className = "h-5 w-auto sm:h-6" }: FillsLogoProps) {
  const logo = (
    <Image
      src={FILLS_LOGO_SRC}
      alt="FILLS"
      width={541}
      height={247}
      className={className}
      priority
    />
  );

  if (!linked) {
    return logo;
  }

  return (
    <Link href="/" className="inline-flex shrink-0 items-center">
      {logo}
    </Link>
  );
}
