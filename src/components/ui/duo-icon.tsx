import * as React from "react";
import { duoIconsData, type DuoIconName } from "./duo-icons-data";

export interface DuoIconProps extends Omit<React.SVGProps<SVGSVGElement>, "name"> {
  name: DuoIconName;
  size?: number | string;
  className?: string;
}

export function DuoIcon({
  name,
  size = 20,
  className = "size-5 shrink-0",
  ...props
}: DuoIconProps) {
  const svgContent = duoIconsData[name];
  if (!svgContent) return null;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      {...props}
    />
  );
}

export { type DuoIconName };
