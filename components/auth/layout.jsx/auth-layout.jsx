import { LucideVegan } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[2.5fr_1.5fr]">
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/cranes.png"
          alt="Ace 80"
          fill
          className="absolute inset-0 h-full w-full object-cover"
          priority
        />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2 font-medium">
  <Image src="/Ace80.png" alt="Ace Logo" width={120} height={120} />
 
</Link>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
