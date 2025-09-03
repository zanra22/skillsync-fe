import { cn } from "@/lib/utils";
import React from "react";

interface BrandProps extends React.HTMLAttributes<HTMLSpanElement> {}

const Brand = ({ className, ...props }: BrandProps) => {
  return (
    <span className={cn("gradient-text", className)} {...props}>
      SkillSync
    </span>
  );
};

export default Brand;