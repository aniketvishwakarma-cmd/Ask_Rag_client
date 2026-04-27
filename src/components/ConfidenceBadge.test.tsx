import { describe, expect, it } from 'vitest'
import ConfidenceBadge from './ConfidenceBadge'

describe('ConfidenceBadge', () => {
  it('uses the success style for high confidence answers', () => {
    const badge = ConfidenceBadge({ confidence: 0.85 }) as any

    expect(badge.props.className).toContain('badge-success')
  })

  it('uses the error style for low confidence answers', () => {
    const badge = ConfidenceBadge({ confidence: 0.2 }) as any

    expect(badge.props.className).toContain('badge-error')
  })
})
