import { BOARD_BACKGROUNDS, BOARD_COLORS } from '../lib/constants'

export default function BackgroundPicker({ current, onSelect }) {
  return (
    <div className="w-72">
      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Photos</p>
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {BOARD_BACKGROUNDS.filter(b => b.type === 'photo').map(bg => (
          <button
            key={bg.id}
            onClick={() => onSelect(bg.id)}
            className={`h-12 rounded cursor-pointer bg-cover bg-center border-2 ${
              current === bg.id ? 'border-blue-500' : 'border-transparent hover:border-gray-400'
            }`}
            style={{ backgroundImage: `url(${bg.url}&w=200&q=50)` }}
            title={bg.label}
          />
        ))}
      </div>

      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Gradients</p>
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {BOARD_BACKGROUNDS.filter(b => b.type === 'gradient').map(bg => (
          <button
            key={bg.id}
            onClick={() => onSelect(bg.id)}
            className={`h-12 rounded cursor-pointer border-2 ${
              current === bg.id ? 'border-blue-500' : 'border-transparent hover:border-gray-400'
            }`}
            style={{ background: bg.css }}
            title={bg.label}
          />
        ))}
      </div>

      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Solid Colors</p>
      <div className="grid grid-cols-4 gap-1.5">
        {BOARD_COLORS.map(c => (
          <button
            key={c}
            onClick={() => onSelect(c)}
            className={`h-12 rounded cursor-pointer border-2 ${
              current === c ? 'border-blue-500' : 'border-transparent hover:border-gray-400'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  )
}
