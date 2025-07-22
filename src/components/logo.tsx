import { cn } from '@/lib/utils';
import * as React from 'react';

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('w-8 h-8', className)}
      {...props}
    >
      <path d="M12 2a10 10 0 0 0-4.44 1.34" />
      <path d="M12 22a10 10 0 0 0 9.77-7.24" />
      <path d="m2 12.3-.12.34a10 10 0 0 0 2.2 6.22" />
      <path d="M6.34 3.56A10.03 10.03 0 0 0 2.2 12.64" />
      <path d="M17.66 20.44A10 10 0 0 0 21.8 12.4" />
      <path d="M12 2a10 10 0 0 1 4.44 1.34" />
      <path d="M12 22a10 10 0 0 1-9.77-7.24" />
      <path d="M8 14c.5 2.5 2.2 4 4 4s3.5-1.5 4-4" />
      <path d="m14 10 1-1" />
      <path d="m10 10-1-1" />
      <path d="M12 12V7a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1v1" />
    </svg>
  );
}
