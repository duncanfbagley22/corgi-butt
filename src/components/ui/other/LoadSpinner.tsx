import React from 'react'

interface LoadSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
  overlay?: boolean // <-- new prop
}

export function LoadSpinner({ 
  size = 'md', 
  text,
  className = '', 
  overlay = false 
}: LoadSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-gray-300 border-t-blue-600 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-400`}>
          {text}
        </p>
      )}
    </div>
  )

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        {spinnerContent}
      </div>
    )
  }

  return spinnerContent
}

export default LoadSpinner
