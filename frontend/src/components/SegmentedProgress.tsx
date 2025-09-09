export default function SegmentedProgress({ total, booked, minGoal, showMinLabel = false }: { total: number, booked: number, minGoal: number, showMinLabel?: boolean }){
  const safeTotal = Math.max(total, 1)
  const threshold = Math.min(minGoal || safeTotal, safeTotal)
  const minPct = (threshold / safeTotal) * 100
  const bookedToMin = Math.min(booked, threshold)
  const bookedOver = Math.max(0, booked - threshold)
  const fill1 = (bookedToMin / safeTotal) * 100
  const fill2 = (bookedOver / safeTotal) * 100
  return (
    <div className="relative w-full h-6 md:h-7 rounded bg-base-200 overflow-visible">
      {/* background segments */}
      <div className="absolute inset-0 flex h-3 top-1.5 md:top-2 rounded overflow-hidden">
        <div style={{ width: `${minPct}%` }} className="bg-base-300" />
        <div style={{ width: `${100 - minPct}%` }} className="bg-base-200" />
      </div>
      {/* fills */}
      <div className="absolute left-0 right-0 pointer-events-none flex h-3 top-1.5 md:top-2 rounded overflow-hidden">
        <div style={{ width: `${fill1}%` }} className="bg-primary transition-all" />
        <div style={{ width: `${fill2}%` }} className="bg-success transition-all" />
      </div>
      {/* marker */}
      <div className="absolute -translate-x-1/2 top-0" style={{ left: `${minPct}%` }}>
        <div className="h-6 md:h-7 flex flex-col items-center gap-0.5">
          {showMinLabel && (
            <div className="text-[10px] md:text-xs px-1 py-0.5 rounded bg-secondary text-secondary-content whitespace-nowrap">Min {threshold}</div>
          )}
          <div className="h-3 w-0 border-l-2 border-secondary/80" />
        </div>
      </div>
    </div>
  )
}
