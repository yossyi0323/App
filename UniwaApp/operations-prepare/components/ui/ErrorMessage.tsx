import React from 'react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className }) => (
  <div role="alert" className={`text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 ${className ?? ''}`.trim()}>
    {message}
  </div>
); 