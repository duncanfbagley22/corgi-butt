// CardContainer.tsx
'use client'

import React, { useRef, useState } from 'react'
import clsx from 'clsx'
import { X, CheckCircle2 } from 'lucide-react'
import { theme } from "../../../../../config/theme";

interface CardContainerProps {
  children?: React.ReactNode
  backgroundColor?: string
  hoverEffect?: boolean
  padding?: string
  shadow?: boolean
  borderRadius?: string
  width?: string | number
  height?: string | number
  border?: boolean
  className?: string
  onClick?: () => void
  onLongPress?: () => void
  editMode?: boolean
  onDelete?: () => void
  enableLongPress?: boolean
  showToastOnLongPress?: boolean // New prop
  toastMessage?: string // New prop
}

// Toast Component
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  const [isExiting, setIsExiting] = useState(false);

  React.useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2700);

    const removeTimer = setTimeout(onClose, 3000);
    
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [onClose]);

  return (
    <div className={`fixed top-24 left-0 right-0 z-50 flex justify-center ${isExiting ? 'animate-fade-out' : 'animate-slide-down'}`}>
      <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};

export default function CardContainer({
  children,
  backgroundColor = theme.colors.primary,
  hoverEffect = true,
  padding = '1rem',
  shadow = true,
  borderRadius = '0.75rem',
  border = false,
  className,
  onClick,
  onLongPress,
  editMode = false,
  onDelete,
  enableLongPress = false,
  showToastOnLongPress = false,
  toastMessage = "Task completed!",
}: CardContainerProps) {

  const [isLongPressing, setIsLongPressing] = useState(false)
  const [longPressProgress, setLongPressProgress] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const triggeredLongPress = useRef(false)
  const longPressDuration = 1000
  const longPressDelay = 400
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.()
  }

  const startLongPress = (e: React.MouseEvent | React.TouchEvent) => {
    if (!enableLongPress || editMode) return
    if ((e.target as HTMLElement).closest('button')) return

    triggeredLongPress.current = false
    setIsLongPressing(false)
    setLongPressProgress(0)

    delayTimerRef.current = setTimeout(() => {
      setIsLongPressing(true)

      const startTime = Date.now()

      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime
        const progress = Math.min((elapsed / longPressDuration) * 100, 100)
        setLongPressProgress(progress)
      }, 16)

      longPressTimerRef.current = setTimeout(() => {
        triggeredLongPress.current = true
        clearInterval(progressIntervalRef.current!)
        setIsLongPressing(false)
        setLongPressProgress(0)
        
        // Show toast if enabled
        if (showToastOnLongPress) {
          setShowToast(true)
        }
        
        onLongPress?.()
      }, longPressDuration)
    }, longPressDelay)
  }

  const stopLongPress = () => {
    clearTimeout(delayTimerRef.current!)
    delayTimerRef.current = null

    clearTimeout(longPressTimerRef.current!)
    clearInterval(progressIntervalRef.current!)
    longPressTimerRef.current = null
    progressIntervalRef.current = null

    setIsLongPressing(false)
    setLongPressProgress(0)
  }

  const handleClick = () => {
    if (!triggeredLongPress.current) {
      onClick?.()
    }
    triggeredLongPress.current = false
  }

  return (
    <>
      <style jsx global>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .animate-fade-out {
          animation: fade-out 0.3s ease-out forwards;
        }
      `}</style>

      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}

      <div
        onClick={handleClick}
        onMouseDown={startLongPress}
        onMouseUp={stopLongPress}
        onMouseLeave={stopLongPress}
        onTouchStart={startLongPress}
        onTouchEnd={stopLongPress}
        onTouchCancel={stopLongPress}
        className={clsx(
          'transition-all duration-300 gap-2 relative overflow-hidden flex flex-col',
          shadow && 'shadow-md',
          hoverEffect && !isLongPressing && 'hover:scale-[1.03] hover:shadow-lg hover:-translate-y-1',
          border && 'border border-gray-600',
          'cursor-pointer',
          editMode && 'animate-wiggle',
          isLongPressing && 'scale-95',
          className
        )}
        style={{
          backgroundColor,
          padding,
          borderRadius,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
        }}
      >
        {children}

        {editMode && (
          <button
            onClick={handleDeleteClick}
            className="absolute right-4 top-4 bg-red-400 hover:bg-red-600 rounded-full p-1 shadow-lg z-10"
            aria-label="Delete"
          >
            <X size={16} color="white" />
          </button>
        )}

        {isLongPressing && enableLongPress && (
          <div className="absolute inset-0 backdrop-blur-sm bg-black/30 rounded-[inherit] flex items-center justify-center z-20">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="36" stroke="white" strokeWidth="4" fill="none" opacity="0.3" />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="#42B94A"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - longPressProgress / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </>
  )
}