// Fractional indexing helpers for drag-and-drop positioning

export function getInsertPosition(items, targetIndex) {
  if (items.length === 0) return 65536

  if (targetIndex === 0) {
    return items[0].position / 2
  }

  if (targetIndex >= items.length) {
    return items[items.length - 1].position + 65536
  }

  const before = items[targetIndex - 1].position
  const after = items[targetIndex].position
  return (before + after) / 2
}

export function needsNormalization(items) {
  for (let i = 1; i < items.length; i++) {
    if (items[i].position - items[i - 1].position < 0.001) return true
  }
  return false
}

export function normalizePositions(items) {
  return items.map((item, i) => ({
    ...item,
    position: (i + 1) * 65536,
  }))
}
