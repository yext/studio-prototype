import { StreamsDataExpression } from '../types'

export function isStreamsDataExpression(
  value: unknown
): value is StreamsDataExpression {
  return !!value && typeof value === 'string' && value.startsWith('document.')
}