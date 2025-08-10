import { MessageSquare } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t border-border/30 bg-background/50 py-12 backdrop-blur-lg">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex items-center space-x-2">
                        <MessageSquare className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold">SilentEcho</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} SilentEcho. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-6">
                        <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                            Privacy
                        </a>
                        <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                            Terms
                        </a>
                        <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                            Contact
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}