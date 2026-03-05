export default function MemberPicker({ members, cardMembers, onToggle }) {
  const assignedIds = new Set(cardMembers.map(cm => cm.user_id))

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Members</p>
      <div className="space-y-1">
        {members.map(member => (
          <button
            key={member.id}
            onClick={() => onToggle(member.id, member)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left cursor-pointer border ${
              assignedIds.has(member.id)
                ? 'border-gray-400 bg-gray-50'
                : 'border-transparent hover:bg-gray-100'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0">
              {(member.full_name || member.email || '?')[0].toUpperCase()}
            </div>
            <span className="text-gray-700 flex-1">{member.full_name || member.email}</span>
            {assignedIds.has(member.id) && <span className="text-blue-600">&#10003;</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
