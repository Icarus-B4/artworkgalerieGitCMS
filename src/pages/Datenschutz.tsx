import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Datenschutz = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Datenschutz Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in text-center">
            Datenschutzerklärung
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground backdrop-blur-sm mb-12 text-center">
            Schutz Ihrer persönlichen Daten bei der Artwork-Galerie
          </p>

          <div className="prose prose-lg max-w-none">
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 mb-8 border">
              <h2 className="text-3xl font-bold mb-6 text-primary">1. Verantwortlicher</h2>
              <p className="text-muted-foreground mb-4">
                Verantwortlicher für die Datenverarbeitung auf dieser Website ist:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Artwork-Galerie</strong><br />
                  Web⚡Stark.org<br />
                  E-Mail: icarus.mod56@gmail.com<br />
                  Website: https://webstark.org
                </p>
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 mb-8 border">
              <h2 className="text-3xl font-bold mb-6 text-primary">2. Datenerhebung und -verwendung</h2>
              <p className="text-muted-foreground mb-4">
                Wir erheben und verarbeiten personenbezogene Daten nur, soweit dies für die 
                Bereitstellung unserer Dienstleistungen erforderlich ist:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li><strong>Kontodaten:</strong> E-Mail-Adresse und Benutzername für die Anmeldung</li>
                <li><strong>Projektdaten:</strong> Titel, Beschreibung und Medien Ihrer hochgeladenen Arbeiten</li>
                <li><strong>Nutzungsdaten:</strong> Likes, Views und Kommentare zu Ihren Projekten</li>
                <li><strong>Technische Daten:</strong> IP-Adresse, Browser-Informationen für die Funktionalität</li>
              </ul>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 mb-8 border">
              <h2 className="text-3xl font-bold mb-6 text-primary">3. Rechtsgrundlage der Verarbeitung</h2>
              <p className="text-muted-foreground mb-4">
                Die Verarbeitung Ihrer personenbezogenen Daten erfolgt auf Grundlage von:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li><strong>Art. 6 Abs. 1 lit. a DSGVO:</strong> Einwilligung für die Nutzung der Plattform</li>
                <li><strong>Art. 6 Abs. 1 lit. b DSGVO:</strong> Vertragserfüllung für die Bereitstellung unserer Dienstleistungen</li>
                <li><strong>Art. 6 Abs. 1 lit. f DSGVO:</strong> Berechtigtes Interesse an der Plattform-Funktionalität</li>
              </ul>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 mb-8 border">
              <h2 className="text-3xl font-bold mb-6 text-primary">4. Datenspeicherung und -sicherheit</h2>
              <p className="text-muted-foreground mb-4">
                Wir verwenden moderne Sicherheitsmaßnahmen zum Schutz Ihrer Daten:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li><strong>Verschlüsselung:</strong> Alle Datenübertragungen erfolgen über HTTPS</li>
                <li><strong>Sichere Hosting:</strong> Daten werden auf sicheren Servern gespeichert</li>
                <li><strong>Zugriffskontrolle:</strong> Nur autorisierte Personen haben Zugang zu Ihren Daten</li>
                <li><strong>Regelmäßige Updates:</strong> Sicherheitsupdates werden zeitnah implementiert</li>
              </ul>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 mb-8 border">
              <h2 className="text-3xl font-bold mb-6 text-primary">5. Cookies und Tracking</h2>
              <p className="text-muted-foreground mb-4">
                Wir verwenden Cookies und ähnliche Technologien für:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li><strong>Funktionale Cookies:</strong> Für die Grundfunktionen der Website (Anmeldung, Einstellungen)</li>
                <li><strong>Analytische Cookies:</strong> Zur Verbesserung der Benutzererfahrung (anonymisiert)</li>
                <li><strong>Keine Werbe-Cookies:</strong> Wir verwenden keine Tracking-Cookies für Werbezwecke</li>
              </ul>
              <p className="text-muted-foreground">
                Sie können Cookies in Ihren Browser-Einstellungen deaktivieren, 
                dies kann jedoch die Funktionalität der Website beeinträchtigen.
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 mb-8 border">
              <h2 className="text-3xl font-bold mb-6 text-primary">6. Ihre Rechte</h2>
              <p className="text-muted-foreground mb-4">
                Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li><strong>Auskunftsrecht:</strong> Sie können Auskunft über Ihre gespeicherten Daten verlangen</li>
                <li><strong>Berichtigungsrecht:</strong> Falsche Daten können korrigiert werden</li>
                <li><strong>Löschungsrecht:</strong> Sie können die Löschung Ihrer Daten beantragen</li>
                <li><strong>Widerspruchsrecht:</strong> Sie können der Verarbeitung widersprechen</li>
                <li><strong>Datenübertragbarkeit:</strong> Ihre Daten können in einem strukturierten Format exportiert werden</li>
              </ul>
              <p className="text-muted-foreground">
                Kontaktieren Sie uns unter icarus.mod56@gmail.com für die Ausübung Ihrer Rechte.
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 mb-8 border">
              <h2 className="text-3xl font-bold mb-6 text-primary">7. Datenweitergabe</h2>
              <p className="text-muted-foreground mb-4">
                Wir geben Ihre personenbezogenen Daten nicht an Dritte weiter, außer:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Sie haben ausdrücklich zugestimmt</li>
                <li>Es ist gesetzlich vorgeschrieben</li>
                <li>Es ist für die Erfüllung unserer Dienstleistungen erforderlich</li>
                <li>Wir verwenden vertrauenswürdige Dienstleister (z.B. Hosting-Provider) unter strengen Datenschutzauflagen</li>
              </ul>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 mb-8 border">
              <h2 className="text-3xl font-bold mb-6 text-primary">8. Speicherdauer</h2>
              <p className="text-muted-foreground mb-4">
                Wir speichern Ihre Daten nur so lange, wie es erforderlich ist:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li><strong>Kontodaten:</strong> Bis zur Löschung Ihres Kontos</li>
                <li><strong>Projektdaten:</strong> Bis Sie Ihre Projekte löschen</li>
                <li><strong>Log-Daten:</strong> Maximal 12 Monate für Sicherheitszwecke</li>
                <li><strong>Rechtliche Aufbewahrung:</strong> Bestimmte Daten müssen gesetzlich aufbewahrt werden</li>
              </ul>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 mb-8 border">
              <h2 className="text-3xl font-bold mb-6 text-primary">9. Minderjährige</h2>
              <p className="text-muted-foreground">
                Unsere Plattform richtet sich an Nutzer ab 16 Jahren. Personen unter 16 Jahren 
                sollten keine personenbezogenen Daten ohne Einwilligung der Eltern oder Erziehungsberechtigten 
                an uns übermitteln. Wir sammeln wissentlich keine personenbezogenen Daten von Kindern unter 16 Jahren.
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 border">
              <h2 className="text-3xl font-bold mb-6 text-primary">10. Änderungen dieser Datenschutzerklärung</h2>
              <p className="text-muted-foreground">
                Wir behalten uns vor, diese Datenschutzerklärung zu aktualisieren, um sie an 
                geänderte Rechtslagen oder bei Änderungen unserer Dienstleistungen sowie der 
                Datenverarbeitung anzupassen. Für Ihren erneuten Besuch gilt dann die neue 
                Datenschutzerklärung.
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 border">
              <h2 className="text-3xl font-bold mb-6 text-primary">11. Kontakt</h2>
              <p className="text-muted-foreground mb-4">
                Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte wenden Sie sich an:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>E-Mail:</strong> icarus.mod56@gmail.com<br />
                  <strong>Website:</strong> https://webstark.org<br />
                  <strong>Stand:</strong> {new Date().toLocaleDateString('de-DE')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Datenschutz;
