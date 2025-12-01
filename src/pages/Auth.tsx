import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/hooks/use-session";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { session: firebaseSession, loading: firebaseLoading } = useSession();

  useEffect(() => {
    if (!firebaseLoading && firebaseSession) {
      navigate("/admin/dashboard");
    }
  }, [firebaseSession, firebaseLoading, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: "Account erstellt",
          description: "Willkommen! Sie sind nun angemeldet.",
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Erfolgreich angemeldet",
          description: "Willkommen zurück!",
        });
      }
      navigate("/admin/dashboard");
    } catch (error: any) {
      let errorMessage = "Ein Fehler ist aufgetreten.";
      if (error.code === "auth/invalid-email") errorMessage = "Ungültige E-Mail-Adresse.";
      if (error.code === "auth/user-disabled") errorMessage = "Benutzerkonto deaktiviert.";
      if (error.code === "auth/user-not-found") errorMessage = "Benutzer nicht gefunden.";
      if (error.code === "auth/wrong-password") errorMessage = "Falsches Passwort.";
      if (error.code === "auth/email-already-in-use") errorMessage = "E-Mail wird bereits verwendet.";
      if (error.code === "auth/weak-password") errorMessage = "Passwort ist zu schwach (min. 6 Zeichen).";

      toast({
        title: "Fehler",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking auth state
  if (firebaseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 px-4">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            {isSignUp ? "Registrieren" : "Anmelden"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Erstellen Sie ein Konto für die Artwork Galerie"
              : "Melden Sie sich an, um Projekte zu verwalten"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Wird geladen..." : (isSignUp ? "Registrieren" : "Anmelden")}
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary hover:underline"
              >
                {isSignUp
                  ? "Bereits ein Konto? Anmelden"
                  : "Noch kein Konto? Registrieren"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

