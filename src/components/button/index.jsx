import { cn } from "../../lib/utils";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}) => {
  const baseStyle =
    "px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-red-500 hover:bg-red-650 text-white shadow-md shadow-red-500/20 hover:shadow-red-500/35 border border-red-400/20",
    secondary:
      "glass-panel text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 border border-gray-300/40 dark:border-gray-700/40",
    danger:
      "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 hover:shadow-red-600/35 border border-red-500/20",
    success:
      "bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-500/20 hover:shadow-green-500/35 border border-green-400/20",
    glass:
      "bg-white/10 dark:bg-black/20 text-gray-800 dark:text-white backdrop-blur-md border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/30"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyle, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
