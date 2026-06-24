import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-center", className)}>
      <Image
        src="/openqr-logo-stacked.svg"
        alt="OpenQR — open-source QR codes, free forever"
        width={220}
        height={138}
        priority
        className="h-auto w-44 dark:hidden sm:w-52"
      />
      <Image
        src="/openqr-logo-stacked-dark.svg"
        alt="OpenQR — open-source QR codes, free forever"
        width={220}
        height={138}
        priority
        className="hidden h-auto w-44 dark:block sm:w-52"
      />
    </div>
  );
}
