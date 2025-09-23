export default function GeometricBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {/* Utah Jazz gradient background - thirds layout at 45 degrees */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-purple-100" />
    </div>
  )
}