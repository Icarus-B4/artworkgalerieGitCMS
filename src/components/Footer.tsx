import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Brand */}
          <div>
            <Link to="/" className="text-xl font-bold text-primary">
              Artwork-Galerie
            </Link>
            <p className="text-sm text-muted-foreground mt-2">
              Eine Plattform für Kreative
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-3">Entdecken</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Projekte</Link></li>
              <li><Link to="/admin" className="hover:text-primary transition-colors">Anmelden</Link></li>
              <li className="group">
                <Link to="/" className="hover:text-primary transition-colors">Links</Link>
                <ul className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-y-1">
                  <li><Link to="https://dropai.vercel.app" className="hover:text-primary transition-colors">Generative AI</Link></li>
                  <li><Link to="https://deepcorehub.vercel.app" className="hover:text-primary transition-colors">Deepcorehub</Link></li>
                  <li><Link to="https://webstark.org" className="hover:text-primary transition-colors">Webagentur Biel/Bienne</Link></li>
                </ul>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold mb-3">Information</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/nutzungplatform" className="hover:text-primary transition-colors">Nutzung der Platform</a></li>
              <li><a href="/datenschutz" className="hover:text-primary transition-colors">Datenschutz</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Build with ❤️ by <a href="https://webstark.org" className="hover:text-primary transition-colors">Web⚡Stark.org</a>. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
};
