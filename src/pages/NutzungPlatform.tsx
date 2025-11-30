import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProjectCard } from "@/components/ProjectCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { HeroBackground } from "@/components/HeroBackground";
import { useTypewriter } from "@/hooks/useTypewriter";

// Demo images
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";
import project4 from "@/assets/project-4.png";
import project5 from "@/assets/project-5.jpg";
import project6 from "@/assets/project-6.jpg";
import project7 from "@/assets/project-7.webp";
import project8 from "@/assets/project-8.png";

const demoProjects = [
  {
    id: "demo-1",
    title: "Abstract Geometrie",
    category: "design",
    cover_image_url: project1,
    likes: 234,
    views: 1523,
  },
  {
    id: "demo-2",
    title: "Deep Core Developer",
    category: "design",
    cover_image_url: project2,
    likes: 567,
    views: 3421,
  },
  {
    id: "demo-3",
    title: " Kunst",
    category: "illustration",
    cover_image_url: project3,
    likes: 432,
    views: 2134,
  },
  {
    id: "demo-4",
    title: "Retouching",
    category: "fotografie",
    cover_image_url: project4,
    likes: 891,
    views: 4532,
  },
  {
    id: "demo-5",
    title: "Moderne Architektur",
    category: "architektur",
    cover_image_url: project5,
    likes: 345,
    views: 2876,
  },
  {
    id: "demo-6",
    title: "Produktfotografie",
    category: "produktdesign",
    cover_image_url: project6,
    likes: 678,
    views: 3987,
  },
  {
    id: "demo-7",
    title: "Geometrie",
    category: "design",
    cover_image_url: project7,
    likes: 856,
    views: 4897,
  },
  {
    id: "demo-8",
    title: "Musik Album Cover",
    category: "design",
    cover_image_url: project8,
    likes: 943,
    views: 3846,
  },
];

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const typewriterText = useTypewriter("Eine Plattform für Kreative, um ihre besten Arbeiten zu präsentieren", 50);

  const { data: projects = [] } = useQuery({
    queryKey: ["projects", selectedCategory],
    queryFn: async () => [],
    enabled: false,
  });

  const { data: allHeroProjects = [] } = useQuery({
    queryKey: ["allHeroProjects"],
    queryFn: async () => [],
    enabled: false,
  });

  // Use demo projects if no projects in database
  const displayProjects = projects.length > 0 ? projects : demoProjects;
  // Compose hero projects: use all projects (real + demo) for random selection in HeroBackground
  const allAvailableProjects = useMemo(() => {
    return allHeroProjects.length > 0 ? [...allHeroProjects, ...demoProjects] : demoProjects;
  }, [allHeroProjects, demoProjects]);
  const filteredProjects = selectedCategory === "all"
    ? displayProjects
    : displayProjects.filter((p) => p.category === selectedCategory);

  console.log("Selected category:", selectedCategory);
  console.log("Filtered projects for display:", filteredProjects);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        <HeroBackground projects={allAvailableProjects} />
        <div className="container mx-auto text-center max-w-4xl relative z-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Nutzung der Platform
          </h1>
        </div>
      </section>



      {/* Nutzung der Platform */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-xl md:text-2xl text-muted-foreground backdrop-blur-sm mb-12 text-center">
            Richtlinien und Bedingungen für die Nutzung der Artwork-Galerie
          </p>

          <div className="prose prose-lg max-w-none">
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 mb-8 border">
              <h2 className="text-3xl font-bold mb-6 text-primary">1. Eigentum und Urheberrecht</h2>
              <p className="text-muted-foreground mb-4">
                Als Nutzer der Artwork-Galerie bestätigen Sie, dass alle von Ihnen hochgeladenen Inhalte
                (Bilder, Videos, Texte und sonstige Materialien) Ihr geistiges Eigentum sind oder Sie
                über die notwendigen Rechte verfügen, diese zu veröffentlichen.
              </p>
              <p className="text-muted-foreground mb-4">
                Sie sind allein verantwortlich dafür, dass Ihre Inhalte keine Rechte Dritter verletzen.
                Die Artwork-Galerie übernimmt keine Haftung für Urheberrechtsverletzungen durch
                Nutzer-uploaded Inhalte.
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 mb-8 border">
              <h2 className="text-3xl font-bold mb-6 text-primary">2. Datenschutz und Privatsphäre</h2>
              <p className="text-muted-foreground mb-4">
                Die Nutzung unserer Plattform unterliegt unseren Datenschutzrichtlinien.
                Durch die Nutzung der Artwork-Galerie erklären Sie sich damit einverstanden,
                dass wir Ihre Daten gemäß unserer Datenschutzerklärung verarbeiten.
              </p>
              <p className="text-muted-foreground mb-4">
                Wir respektieren Ihre Privatsphäre und verpflichten uns, Ihre persönlichen Daten
                sicher und vertraulich zu behandeln. Weitere Details finden Sie in unserer
                <a href="/datenschutz" className="text-primary hover:underline"> Datenschutzerklärung</a>.
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 mb-8 border">
              <h2 className="text-3xl font-bold mb-6 text-primary">3. Respektvolle Kommunikation</h2>
              <p className="text-muted-foreground mb-4">
                Die Artwork-Galerie ist ein Ort für kreativen Austausch und Inspiration.
                Wir erwarten von allen Nutzern einen respektvollen und freundlichen Umgang miteinander.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Kommentare und Feedback sollten konstruktiv und respektvoll sein</li>
                <li>Diskriminierung, Beleidigungen oder Hassrede sind nicht toleriert</li>
                <li>Spam oder unerwünschte Werbung ist untersagt</li>
                <li>Respektieren Sie die Arbeit und Meinungen anderer Kreativer</li>
              </ul>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 mb-8 border">
              <h2 className="text-3xl font-bold mb-6 text-primary">4. Inhaltsrichtlinien</h2>
              <p className="text-muted-foreground mb-4">
                Hochgeladene Inhalte sollten:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Kreative Arbeiten aus den Bereichen Design, Fotografie, Illustration, Architektur oder verwandten Bereichen sein</li>
                <li>Von angemessener Qualität und für die Öffentlichkeit geeignet sein</li>
                <li>Keine illegalen, beleidigenden oder unangemessenen Inhalte enthalten</li>
                <li>Ihre eigenen Werke oder Werke sein, für die Sie die Veröffentlichungsrechte besitzen</li>
              </ul>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 mb-8 border">
              <h2 className="text-3xl font-bold mb-6 text-primary">5. Plattform-Nutzung</h2>
              <p className="text-muted-foreground mb-4">
                Die Artwork-Galerie stellt eine Plattform für die Präsentation und den Austausch
                kreativer Arbeiten zur Verfügung. Wir behalten uns das Recht vor, Inhalte zu
                moderieren und bei Verstößen gegen diese Richtlinien entsprechende Maßnahmen zu ergreifen.
              </p>
              <p className="text-muted-foreground mb-4">
                Bei Fragen oder Problemen wenden Sie sich gerne an unser Support-Team.
                Wir sind hier, um eine positive und inspirierende Community zu fördern.
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 border">
              <h2 className="text-3xl font-bold mb-6 text-primary">6. Änderungen der Nutzungsbedingungen</h2>
              <p className="text-muted-foreground">
                Wir behalten uns das Recht vor, diese Nutzungsbedingungen jederzeit zu ändern.
                Wesentliche Änderungen werden wir rechtzeitig bekannt geben. Die fortgesetzte
                Nutzung der Plattform nach Änderungen gilt als Zustimmung zu den neuen Bedingungen.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
