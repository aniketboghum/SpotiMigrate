import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/header";
import { Combobox } from "@/components/ui/combobox";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      {/* Main content */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-28 pb-16">
        {/* Hero */}
        <section className="text-center">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-balance">
              Move playlists between platforms in minutes
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              Seamlessly migrate your music between Spotify and YouTube Music with accurate matches and zero fuss.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button className="w-full sm:w-auto">
                <img src="/icons/spotify.png" alt="spotify" width={16} height={16} />
                <span className="ml-2">Login with Spotify</span>
              </Button>
              <Button className="w-full sm:w-auto" variant="secondary">
                <img src="/icons/youtube_music.png" alt="youtube music" width={16} height={16} />
                <span className="ml-2">Login with YouTube</span>
              </Button>
            </div>
          </div>
        </section>

        {/* Visual divider */}
        <Separator className="my-12" />

        {/* Features */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-xl border bg-card text-card-foreground p-6">
            <h3 className="font-semibold text-lg">Step: 1</h3>
            <p className="mt-2 text-sm text-muted-foreground">Login to Spotify and Youtube Music by clicking the button above.</p>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground p-6">
            <h3 className="font-semibold text-lg">Step: 2</h3>
            <p className="mt-2 text-sm text-muted-foreground">Select the playlists you want to migrate from the Dropdown.</p>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground p-6">
            <h3 className="font-semibold text-lg">Step: 3</h3>
            <p className="mt-2 text-sm text-muted-foreground">Click Start Migrating to start the migration.</p>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-12 text-center flex flex-col items-center justify-center gap-4">
          <Combobox />
          <Button size="lg" className="px-8">
            <a href="/migrationq">Start Migrating</a>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} SpotiMigrate</span>
        </div>
      </footer>
    </div>
  );
}
