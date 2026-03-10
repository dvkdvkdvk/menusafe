import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  iconOnly?: boolean
  variant?: "default" | "white" | "dark"
  size?: "sm" | "md" | "lg" | "xl"
}

const sizes = {
  sm: { icon: "h-7 w-7", text: "text-lg" },
  md: { icon: "h-9 w-9", text: "text-xl" },
  lg: { icon: "h-11 w-11", text: "text-2xl" },
  xl: { icon: "h-14 w-14", text: "text-3xl" },
}

export function Logo({ className, iconOnly = false, variant = "default", size = "md" }: LogoProps) {
  const sizeConfig = sizes[size]
  
  const iconColors = {
    default: "bg-primary text-primary-foreground",
    white: "bg-white text-primary",
    dark: "bg-foreground text-background",
  }
  
  const textColors = {
    default: "text-foreground",
    white: "text-white",
    dark: "text-foreground",
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Modern shield + checkmark logo representing safety */}
      <div className={cn(
        "relative flex items-center justify-center rounded-xl",
        sizeConfig.icon,
        iconColors[variant]
      )}>
        {/* Shield shape with scan lines */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="h-[60%] w-[60%]"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Shield outline */}
          <path d="M12 2L4 5v6c0 5.5 3.5 10 8 11 4.5-1 8-5.5 8-11V5l-8-3z" />
          {/* Checkmark inside */}
          <path d="M9 12l2 2 4-4" />
        </svg>
      </div>
      
      {!iconOnly && (
        <span className={cn(
          "font-semibold tracking-tight",
          sizeConfig.text,
          textColors[variant]
        )}>
          Menu<span className="font-bold">Safe</span>
        </span>
      )}
    </div>
  )
}

// Standalone icon for favicons, app icons, etc.
export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 512 512" 
      fill="none" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width="512" height="512" rx="108" fill="#1a4d2e" />
      
      {/* Shield */}
      <path 
        d="M256 96L128 144v96c0 88 56 160 128 176 72-16 128-88 128-176v-96L256 96z" 
        stroke="white" 
        strokeWidth="24" 
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Checkmark */}
      <path 
        d="M200 256l40 40 72-72" 
        stroke="#c8f547" 
        strokeWidth="28" 
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
