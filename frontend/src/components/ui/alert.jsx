import React from 'react';

export const Alert = ({ children, variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-900',
    destructive: 'bg-red-100 text-red-900',
    success: 'bg-green-100 text-green-900'
  };

  return (
    <div className={`p-4 rounded-lg ${variants[variant]}`} {...props}>
      {children}
    </div>
  );
};

export const AlertDescription = ({ children }) => {
  return <div className="text-sm">{children}</div>;
};


export default Alert;