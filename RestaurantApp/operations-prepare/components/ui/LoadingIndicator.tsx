import React from 'react';
import { LABELS } from '@/lib/constants/labels';
import { INFO, $msg } from '@/lib/constants/messages';

interface LoadingIndicatorProps {
  message?: string;
  className?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = $msg(INFO.I30030),
  className,
}) => (
  <div role="status" className={`flex items-center gap-2 text-gray-500 ${className ?? ''}`.trim()}>
    <svg
      className="animate-spin h-5 w-5 text-gray-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
    <span>{message}</span>
  </div>
);
