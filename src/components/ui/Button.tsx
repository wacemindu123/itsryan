import Link from 'next/link';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  href?: string;
  children: ReactNode;
  className?: string;
}

export default function Button({ 
  variant = 'primary', 
  href, 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = "px-[22px] py-3 text-[17px] font-normal rounded-full transition-all duration-300 cursor-pointer inline-block tracking-[-0.2px]";
  
  const variants = {
    primary: "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] hover:scale-[1.02]",
    secondary: "bg-transparent text-[var(--accent)] border border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
  };

  const combinedStyles = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedStyles}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedStyles} {...props}>
      {children}
    </button>
  );
}
