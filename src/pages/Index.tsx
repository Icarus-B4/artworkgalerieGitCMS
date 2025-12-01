import { useState, useMemo } from "react";
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
    title: "Deep Core Develoer",
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

import projectsData from "@/data/projects.json";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const typewriterText = useTypewriter("Eine Plattform für Kreative, um ihre besten Arbeiten zu präsentieren", 50);

  // Use local data instead of Supabase
  const projects = projectsData;
  const isLoading = false;

  // Use local data for hero projects
  const allHeroProjects = projectsData;

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
            Entdecke kreative{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Meisterwerke
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground backdrop-blur-sm min-h-[2em]">
            {typewriterText}
            <span className="animate-pulse">|</span>
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <div className="container mx-auto px-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Projects Grid */}
      <section className="container mx-auto px-4 pb-20">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-scale-in">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                category={project.category}
                coverImage={project.cover_image_url}
                likes={project.likes}
                views={project.views}
              />
            ))}
          </div>
        )}

        {!isLoading && filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              Keine Projekte in dieser Kategorie gefunden.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Index;
