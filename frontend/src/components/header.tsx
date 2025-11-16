import { Button } from "@/components/ui/button";
import  Link  from "next/link";

type LoginProps = {
    isUserLoggedinYoutube: boolean
}

export default function Header({ isUserLoggedinYoutube }: LoginProps) {
    return (  
        <header className="fixed top-0 inset-x-0 z-50 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
                <img
                    src="/icons/spotimigrate_name.png"
                    alt="SpotiMigrate logo"
                    className="h-8 w-auto sm:h-9 md:h-10 rounded md:rounded-md"
                    
                />
                <span className="hidden sm:inline text-lg font-logo font-extrabold">SpotiMigrate</span>
            </Link>
            </div>
                <div className="hidden sm:flex items-center gap-3">
                    <Button variant="link">
                    <img src="/icons/github.png" alt="Github" width={20} height={20} />
                    <a href="https://github.com/aniketboghum/SpotiMigrate" target="_blank">Github</a>
                    </Button>

                    <Button variant="secondary" onClick={() => window.location.href='/ai'} disabled={!isUserLoggedinYoutube}>
                        { isUserLoggedinYoutube?  "AI Playlists Generator" : "Login to Youtube For AI Playlists" }
                    </Button>
                </div>
            </div>
        </header>
    );
}

export { Header };