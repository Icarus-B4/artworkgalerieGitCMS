import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getMediaType } from "@/lib/mediaUtils";

interface ProjectCardProps {
  id: string;
  title: string;
  category: string;
  coverImage: string;
  likes: number;
  views: number;
}

export const ProjectCard = ({ id, title, category, coverImage, likes, views }: ProjectCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const mediaType = getMediaType(coverImage);

  return (
    <Link to={`/project/${id}`}>
      <Card
        className="group relative overflow-hidden border-none shadow-none transition-all duration-300 hover:shadow-[var(--card-hover-shadow)]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
          {mediaType === 'video' ? (
            <video
              src={coverImage}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              muted
              loop
              playsInline
              autoPlay
            />
          ) : (
            <img
              src={coverImage}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          
          {/* Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
              <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
              <p className="text-sm text-white/80 mb-3 capitalize">{category.replace('_', '/')}</p>
              
              {/* Stats */}
              <div className="flex items-center gap-4 text-white/80">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{likes}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{views}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
