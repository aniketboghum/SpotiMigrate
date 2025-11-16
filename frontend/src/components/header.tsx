import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";

export default function Header() {
    return (  
        <header className="fixed top-0 inset-x-0 z-50 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
            <a href="/">
                <img
                    src="/icons/spotimigrate_name.png"
                    alt="SpotiMigrate logo"
                    className="h-8 w-auto sm:h-9 md:h-10 rounded md:rounded-md"
                    
                />
            </a>
            <span className="hidden sm:inline text-lg font-logo font-extrabold">SpotiMigrate</span>
            </div>
                <div className="hidden sm:flex items-center gap-3">
                    <Button variant="link">
                    <img src="/icons/github.png" alt="Github" width={20} height={20} />
                    <a href="https://github.com/aniketboghum/SpotiMigrate" target="_blank">Github</a>
                    </Button>

                    <Button variant="secondary" onClick={() => window.location.href='/ai'}>
                        AI Playlists Generator
                    </Button>
                </div>
            </div>
        </header>
    );
}

export { Header };