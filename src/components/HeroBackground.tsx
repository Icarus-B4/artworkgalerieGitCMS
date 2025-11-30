import { useEffect, useState } from "react";

interface HeroBackgroundProps {
  projects: Array<{
    id: string;
    cover_image_url: string;
    title: string;
  }>;
}

export const HeroBackground = ({ projects }: HeroBackgroundProps) => {
  const [displayProjects, setDisplayProjects] = useState<Array<{ id: string; cover_image_url: string; title: string; }>>([]);
  const [imageReloadKey, setImageReloadKey] = useState(0);

  const getRandomProjects = (allProjects: typeof projects) => {
      const shuffled = [...allProjects].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 12);
  };

  useEffect(() => {
    if (!projects || projects.length === 0) {
      setDisplayProjects([]);
      return;
    }

    setDisplayProjects(getRandomProjects(projects));
    setImageReloadKey(prev => prev + 1); // Increment key to force image reload

    const interval = setInterval(() => {
      setDisplayProjects(getRandomProjects(projects));
      setImageReloadKey(prev => prev + 1); // Increment key to force image reload
    }, 120000);

    return () => clearInterval(interval);
  }, [projects]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background z-10" />
      
      {/* Animated Grid */}
      <div className="relative w-full h-full">
        <div className="grid grid-cols-4 grid-rows-3 gap-4 p-4 h-full opacity-80">
          {displayProjects.map((project, index) => (
            <div
              key={project.id}
              className="relative overflow-hidden rounded-lg animate-float"
              // style={{
              //   animationDelay: `${index * 0.2}s`,
              //   animationDuration: `${6 + (index % 3)}s`,
              // }}
            >
              <img
                key={`${project.id}-${imageReloadKey}`}
                src={`${project.cover_image_url}?v=${imageReloadKey}`}
                alt={project.title}
                className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700 brightness-90"
              />
              {/* <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" /> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
