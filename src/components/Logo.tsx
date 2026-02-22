import { GraduationCap } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
};

const textSizeMap = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-3xl",
  xl: "text-5xl",
};

const Logo = ({ size = "md", showText = true }: LogoProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="gradient-primary rounded-2xl p-2.5 text-primary-foreground">
        <GraduationCap className={sizeMap[size]} />
      </div>
      {showText && (
        <span className={`${textSizeMap[size]} font-bold tracking-tight text-foreground`}>
          Edu<span className="text-primary">Flow</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
