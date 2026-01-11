'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

type TransitionType = 'zoom' | 'fade' | 'slide' | 'none'
type NavigationDirection = 'forward' | 'back' | 'none'

interface NavigationContextType {
  transitionType: TransitionType
  direction: NavigationDirection
  clickPosition: { x: number; y: number } | null
  setTransition: (
    type: TransitionType,
    direction: NavigationDirection,
    clickEvent?: React.MouseEvent
  ) => void
  resetTransition: () => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [transitionType, setTransitionType] = useState<TransitionType>('none')
  const [direction, setDirection] = useState<NavigationDirection>('none')
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null)

  const setTransition = useCallback(
    (type: TransitionType, dir: NavigationDirection, clickEvent?: React.MouseEvent) => {
      setTransitionType(type)
      setDirection(dir)
      
      // Capture click position if event provided
      if (clickEvent) {
        setClickPosition({
          x: clickEvent.clientX,
          y: clickEvent.clientY,
        })
      } else {
        setClickPosition(null)
      }
    },
    []
  )

  const resetTransition = useCallback(() => {
    setTransitionType('none')
    setDirection('none')
    setClickPosition(null)
  }, [])

  return (
    <NavigationContext.Provider
      value={{
        transitionType,
        direction,
        clickPosition,
        setTransition,
        resetTransition,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider')
  }
  return context
}