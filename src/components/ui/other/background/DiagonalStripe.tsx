export default function DiagonalStripe() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(
            140deg,
            transparent 0%,
            transparent 85%,
            #fbbf24 85%,
            #fbbf24 87%,
            #3b82f6 87%,
            #3b82f6 89%,
            #111827 89%,
            #111827 91%,
            transparent 91%,
            transparent 100%
          )
        `,
        backgroundSize: '150% 150%',
        backgroundPosition: 'bottom right',
        backgroundRepeat: 'no-repeat',
      }}
    />
  )
}
