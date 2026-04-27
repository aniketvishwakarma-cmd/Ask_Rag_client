import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

interface ConfidenceBadgeProps {
  confidence: number
  showLabel?: boolean
}

function ConfidenceBadge({ confidence, showLabel = true }: ConfidenceBadgeProps) {
  const getConfidenceLevel = (score: number) => {
    if (score >= 0.8) return { level: 'HIGH', color: 'success', icon: CheckCircleIcon }
    if (score >= 0.6) return { level: 'MEDIUM', color: 'warning', icon: ExclamationTriangleIcon }
    return { level: 'LOW', color: 'error', icon: XCircleIcon }
  }

  const { level, color, icon: Icon } = getConfidenceLevel(confidence)

  return (
    <span className={`badge-${color} flex items-center`}>
      <Icon className="mr-1 h-3 w-3" />
      {showLabel && (
        <>
          {level} ({Math.round(confidence * 100)}%)
        </>
      )}
    </span>
  )
}

export default ConfidenceBadge
