import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 ">
      <div className="absolute top-0 left-0 h-80 w-80 bg-gradient-to-br from-green-500 to-transparent rounded-full blur-3xl opacity-70" />
      <div className="absolute bottom-0 right-0 h-80 w-80 bg-gradient-to-tl from-red-500 to-transparent rounded-full blur-3xl opacity-70" />

      <div className="flex flex-col items-center gap-4">
        <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
          Welcome to SpotiMigrate
        </h1>

        <Button className="mt-4 w-3xs" variant="default"> Login to Spotify </Button>
        <Button className="mt-4 w-3xs" variant="default"> Login to YouTube </Button>
      </div>

      <div className="relative flex place-items-baseline">
        <p className="text-center text-lg mt-10 text-muted-foreground">
          Get started by logging into your Spotify and YouTube accounts
        </p>
      </div>
    </main>
  );
}
