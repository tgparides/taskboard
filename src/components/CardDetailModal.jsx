import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useComments } from '../hooks/useComments'
import { useAttachments } from '../hooks/useAttachments'
import LabelPicker from './LabelPicker'
import MemberPicker from './MemberPicker'

export default function CardDetailModal({ card, labels, members, onClose, onUpdate, onDelete, onToggleLabel, onToggleMember, onCreateLabel }) {
  const { user } = useAuth()
  const { comments, addComment, deleteComment } = useComments(card?.id)
  const { attachments, uploadAttachment, deleteAttachment } = useAttachments(card?.id)

  const [title, setTitle] = useState(card?.title || '')
  const [description, setDescription] = useState(card?.description || '')
  const [dueDate, setDueDate] = useState(card?.due_date || '')
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [showLabels, setShowLabels] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const fileInputRef = useRef()

  useEffect(() => {
    if (card) {
      setTitle(card.title)
      setDescription(card.description || '')
      setDueDate(card.due_date || '')
    }
  }, [card])

  if (!card) return null

  function saveTitle() {
    if (title.trim() && title.trim() !== card.title) {
      onUpdate(card.id, { title: title.trim() })
    }
    setEditingTitle(false)
  }

  function saveDescription() {
    if (description !== (card.description || '')) {
      onUpdate(card.id, { description })
    }
    setEditingDesc(false)
  }

  function saveDueDate(val) {
    setDueDate(val)
    onUpdate(card.id, { due_date: val || null })
  }

  async function handleAddComment() {
    if (!commentText.trim()) return
    await addComment(user.id, commentText.trim())
    setCommentText('')
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    await uploadAttachment(file, user.id)

    // If it's an image, set as cover
    if (file.type.startsWith('image/')) {
      const att = attachments[attachments.length - 1]
      // Cover will be set from the attachment URL
    }
  }

  function handleSetCover(url) {
    onUpdate(card.id, { cover_url: url })
  }

  const cardLabels = card.card_labels || []
  const cardMembers = card.card_members || []

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center pt-12 bg-black/50 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mb-12" onClick={e => e.stopPropagation()}>
        {/* Cover image */}
        {card.cover_url && (
          <div className="relative">
            <img src={card.cover_url} alt="" className="w-full h-40 object-cover rounded-t-lg" />
            <button
              onClick={() => onUpdate(card.id, { cover_url: null })}
              className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded cursor-pointer border-none hover:bg-black/70"
            >
              Remove cover
            </button>
          </div>
        )}

        <div className="p-6">
          {/* Title */}
          {editingTitle ? (
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle() }}
              className="text-xl font-semibold w-full border border-blue-400 rounded px-2 py-1 focus:outline-none"
            />
          ) : (
            <h2
              onClick={() => setEditingTitle(true)}
              className="text-xl font-semibold text-gray-800 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2"
            >
              {card.title}
            </h2>
          )}

          {/* Labels display */}
          {cardLabels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {cardLabels.map(cl => {
                const label = labels.find(l => l.id === cl.label_id)
                if (!label) return null
                return (
                  <span
                    key={label.id}
                    className="px-2 py-0.5 rounded text-white text-xs font-medium"
                    style={{ backgroundColor: label.color }}
                  >
                    {label.name || '\u00A0\u00A0\u00A0'}
                  </span>
                )
              })}
            </div>
          )}

          {/* Members display */}
          {cardMembers.length > 0 && (
            <div className="flex gap-1.5 mt-3">
              <span className="text-xs text-gray-500 self-center mr-1">Assigned:</span>
              {cardMembers.map(cm => (
                <div
                  key={cm.user_id}
                  className="w-7 h-7 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center"
                  title={cm.profiles?.full_name}
                >
                  {(cm.profiles?.full_name || '?')[0].toUpperCase()}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-6 mt-4">
            {/* Main content */}
            <div className="flex-1">
              {/* Due date */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Due Date</p>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => saveDueDate(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {dueDate && (
                  <button
                    onClick={() => saveDueDate('')}
                    className="ml-2 text-xs text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</p>
                {editingDesc ? (
                  <div>
                    <textarea
                      autoFocus
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                    <div className="flex gap-2 mt-1">
                      <button onClick={saveDescription} className="px-3 py-1 bg-blue-600 text-white text-sm rounded border-none cursor-pointer">
                        Save
                      </button>
                      <button onClick={() => { setDescription(card.description || ''); setEditingDesc(false) }} className="px-3 py-1 text-sm text-gray-500 bg-transparent border-none cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setEditingDesc(true)}
                    className="text-sm text-gray-600 bg-gray-100 rounded p-2 min-h-[3rem] cursor-pointer hover:bg-gray-200 whitespace-pre-wrap"
                  >
                    {description || 'Add a more detailed description...'}
                  </div>
                )}
              </div>

              {/* Attachments */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Attachments</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-blue-600 hover:text-blue-800 bg-transparent border-none cursor-pointer"
                  >
                    + Add
                  </button>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
                </div>
                <div className="space-y-2">
                  {attachments.map(att => (
                    <div key={att.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded group">
                      {att.file_type?.startsWith('image/') ? (
                        <img src={att.file_url} alt="" className="w-16 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                          {att.file_name?.split('.').pop()?.toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <a href={att.file_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                          {att.file_name}
                        </a>
                        <p className="text-xs text-gray-400">
                          {att.file_size ? `${(att.file_size / 1024).toFixed(0)} KB` : ''}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        {att.file_type?.startsWith('image/') && (
                          <button
                            onClick={() => handleSetCover(att.file_url)}
                            className="text-xs text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer"
                            title="Set as cover"
                          >
                            &#128247;
                          </button>
                        )}
                        <button
                          onClick={() => deleteAttachment(att.id, att.file_url)}
                          className="text-xs text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Comments</p>
                <div className="space-y-3 mb-3">
                  {comments.map(c => (
                    <div key={c.id} className="flex gap-2 group">
                      <div className="w-7 h-7 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {(c.profiles?.full_name || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">{c.profiles?.full_name || 'User'}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(c.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </span>
                          {c.user_id === user?.id && (
                            <button
                              onClick={() => deleteComment(c.id)}
                              className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 bg-transparent border-none cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{c.body}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <textarea
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment() } }}
                    placeholder="Write a comment..."
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className="px-3 self-end py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 border-none cursor-pointer"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar actions */}
            <div className="w-44 space-y-3 flex-shrink-0">
              <div className="relative">
                <button
                  onClick={() => { setShowLabels(!showLabels); setShowMembers(false) }}
                  className="w-full text-left px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded border-none cursor-pointer text-gray-700"
                >
                  Labels
                </button>
                {showLabels && (
                  <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-20 w-56">
                    <LabelPicker
                      labels={labels}
                      cardLabels={cardLabels}
                      onToggle={labelId => onToggleLabel(card.id, labelId)}
                      onCreateLabel={onCreateLabel}
                    />
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => { setShowMembers(!showMembers); setShowLabels(false) }}
                  className="w-full text-left px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded border-none cursor-pointer text-gray-700"
                >
                  Members
                </button>
                {showMembers && (
                  <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-20 w-56">
                    <MemberPicker
                      members={members}
                      cardMembers={cardMembers}
                      onToggle={(userId, profile) => onToggleMember(card.id, userId, profile)}
                    />
                  </div>
                )}
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-left px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded border-none cursor-pointer text-gray-700"
              >
                Attachment
              </button>

              <hr className="border-gray-200" />

              <button
                onClick={() => { if (confirm('Delete this card?')) onDelete(card.id) }}
                className="w-full text-left px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded border-none cursor-pointer"
              >
                Delete Card
              </button>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl bg-transparent border-none cursor-pointer"
        >
          &times;
        </button>
      </div>
    </div>
  )
}
