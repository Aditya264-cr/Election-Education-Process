import React from 'react';
import * as LucideIcons from 'lucide-react';

const Icon = ({ name, size = 20, className = '', ...props }) => {
  const LucideIcon = LucideIcons[name];
  
  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  return (
    <LucideIcon
      size={size}
      className={className}
      {...props}
    />
  );
};

export default Icon;
