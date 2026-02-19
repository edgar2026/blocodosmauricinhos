
import React from 'react';

interface LogoProps {
  className?: string;
  color?: 'navy' | 'white';
}

export const Logo: React.FC<LogoProps> = ({ className = "h-12", color = 'navy' }) => {

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/logo-uninassau.png"
        alt="UNINASSAU"
        className="h-full object-contain"
        style={{
          filter: color === 'white' ? 'invert(1)' : 'none',
          mixBlendMode: color === 'navy' ? 'multiply' : 'normal'
        }}
      />
    </div>
  );
};
