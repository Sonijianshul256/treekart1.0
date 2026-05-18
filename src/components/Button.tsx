import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const styles: Record<Variant, string> = {
  primary: 'bg-grove-700 text-white hover:bg-grove-900',
  secondary: 'bg-white text-grove-700 ring-1 ring-grove-100 hover:bg-grove-50',
  ghost: 'bg-transparent text-grove-700 hover:bg-grove-50',
  danger: 'bg-red-600 text-white hover:bg-red-700'
};

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
