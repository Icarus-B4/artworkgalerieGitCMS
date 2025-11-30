import { Button } from "@/components/ui/button";

const categories = [
  { value: "all", label: "Alle" },
  { value: "ai_ki", label: "AI/KI" },
  { value: "architektur", label: "Architektur" },
  { value: "design", label: "Design" },
  { value: "fotografie", label: "Fotografie" },
  { value: "illustration", label: "Illustration" },
  { value: "produktdesign", label: "Produktdesign" },
  { value: "mode", label: "Mode" },
  { value: "ui_ux", label: "UI/UX" },
  { value: "video", label: "Video" },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-12">
      {categories.map((category) => (
        <Button
          key={category.value}
          variant={selectedCategory === category.value ? "default" : "secondary"}
          onClick={() => onCategoryChange(category.value)}
          className="rounded-full px-6 transition-all duration-200"
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
};
