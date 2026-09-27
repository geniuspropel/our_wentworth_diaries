import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { ChevronsLeftRight } from 'lucide-react'

interface BeforeAfterComparisonProps {
  beforeImage: string
  afterImage: string
  afterLabel: string
}

export default function BeforeAfterComparison({ beforeImage, afterImage, afterLabel }: BeforeAfterComparisonProps) {
  const [position, setPosition] = useState(50)
  const frame = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  function moveTo(clientX: number) {
    const bounds = frame.current?.getBoundingClientRect()
    if (!bounds) return
    setPosition(Math.round(Math.max(0, Math.min(100, ((clientX - bounds.left) / bounds.width) * 100))))
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    dragging.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    moveTo(event.clientX)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragging.current) moveTo(event.clientX)
  }

  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    dragging.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const steps: Record<string, number> = { ArrowLeft: -2, ArrowRight: 2, PageDown: -10, PageUp: 10 }
    if (event.key in steps) {
      event.preventDefault()
      setPosition(current => Math.max(0, Math.min(100, current + steps[event.key])))
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      setPosition(event.key === 'Home' ? 0 : 100)
    }
  }

  return <div
    className="comparison-frame"
    ref={frame}
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerEnd}
    onPointerCancel={onPointerEnd}
  >
    <img className="comparison-image" src={afterImage} alt={`${afterLabel} preview`} draggable={false}/>
    <img className="comparison-image comparison-before" src={beforeImage} alt="Original room" draggable={false} style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}/>
    <span className="comparison-label comparison-label-before">ORIGINAL</span>
    <span className="comparison-label comparison-label-after">{afterLabel.toUpperCase()}</span>
    <div
      className="comparison-handle"
      style={{ left: `${position}%` }}
      role="slider"
      tabIndex={0}
      aria-label={`Compare original room with ${afterLabel}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={position}
      aria-valuetext={`${position}% original, ${100 - position}% ${afterLabel}`}
      onKeyDown={onKeyDown}
    >
      <span className="comparison-divider"/>
      <span className="comparison-grip"><ChevronsLeftRight size={21}/></span>
    </div>
  </div>
}
