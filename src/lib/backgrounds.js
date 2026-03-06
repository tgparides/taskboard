import { BOARD_BACKGROUNDS } from './constants'

// Resolve a board's color field to CSS styles for the board area and header
export function getBoardBackground(color) {
  if (!color) return { board: { backgroundColor: '#3b82f622' }, header: { backgroundColor: '#3b82f6dd' } }

  // Check if it's a background ID
  const bg = BOARD_BACKGROUNDS.find(b => b.id === color)

  if (bg?.type === 'photo') {
    return {
      board: {
        backgroundImage: `url(${bg.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      },
      header: { backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' },
    }
  }

  if (bg?.type === 'gradient') {
    return {
      board: { background: bg.css },
      header: { backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' },
    }
  }

  // Plain hex color
  return {
    board: { backgroundColor: `${color}22` },
    header: { backgroundColor: `${color}dd` },
  }
}

// Get a small preview style for the boards grid
export function getBoardPreviewStyle(color) {
  if (!color) return { backgroundColor: '#3b82f6' }

  const bg = BOARD_BACKGROUNDS.find(b => b.id === color)

  if (bg?.type === 'photo') {
    return {
      backgroundImage: `url(${bg.url}&w=400&q=50)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }

  if (bg?.type === 'gradient') {
    return { background: bg.css }
  }

  return { backgroundColor: color }
}
