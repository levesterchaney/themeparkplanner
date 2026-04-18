'use client';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'primary',
  size = 'md',
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  const variantStyles = {
    primary: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
    secondary:
      'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
    destructive:
      'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
    outline:
      'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  const sizeStyles = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-9 px-4 py-2 text-sm',
    lg: 'h-10 px-6 py-2',
  };

  const className = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
}
