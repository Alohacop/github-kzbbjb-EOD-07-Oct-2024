import React, { useState, useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { ExternalLink, Clock, Tag, Folder, Trash2 } from 'lucide-react'

interface IndexCardProps {
  id: string
  content: string
  source: string
  timestamp: string
  tags: string[]
  filebox: string
  isNewCard?: boolean
  isUsed?: boolean
  isEditable?: boolean
  updateCard: (card: IndexCardProps) => void
  deleteCard: (id: string) => void
}

export const IndexCard: React.FC<IndexCardProps> = ({ 
  id, 
  content, 
  source, 
  timestamp, 
  tags, 
  filebox, 
  isNewCard, 
  isUsed, 
  isEditable, 
  updateCard,
  deleteCard
}) => {
  const [isEditing, setIsEditing] = useState(isEditable || content === '')
  const [editedContent, setEditedContent] = useState(content)
  const [editedSource, setEditedSource] = useState(source)
  const [editedTags, setEditedTags] = useState(tags.join(', '))
  const [editedFilebox, setEditedFilebox] = useState(filebox)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  useEffect(() => {
    if (isEditable || content === '') {
      setIsEditing(true)
    }
  }, [isEditable, content])

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'card',
    item: isNewCard ? { isNewCard: true } : { id, content: editedContent, source: editedSource, timestamp, tags: editedTags.split(',').map(tag => tag.trim()), filebox: editedFilebox },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [id, editedContent, editedSource, editedTags, editedFilebox, timestamp, isNewCard])

  const handleSave = () => {
    updateCard({
      id,
      content: editedContent,
      source: editedSource,
      timestamp,
      tags: editedTags.split(',').map(tag => tag.trim()),
      filebox: editedFilebox,
      isUsed,
      updateCard,
      deleteCard,
    })
    setIsEditing(false)
  }

  const handleDelete = () => {
    setShowDeleteConfirmation(true)
  }

  const confirmDelete = () => {
    deleteCard(id)
    setShowDeleteConfirmation(false)
  }

  const cancelDelete = () => {
    setShowDeleteConfirmation(false)
  }

  return (
    <div
      ref={drag}
      className={`p-4 rounded-lg shadow mb-4 ${
        isDragging ? 'opacity-50' : ''
      } ${isUsed ? 'bg-gray-100' : 'bg-white'} ${isNewCard ? 'border-2 border-dashed border-gray-300' : ''}`}
    >
      {isNewCard ? (
        <p className="text-gray-400 text-center">Drag to add a new card</p>
      ) : isEditing ? (
        <div className="space-y-2">
          <textarea
            className="w-full p-2 border rounded"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="Enter content"
            autoFocus
          />
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={editedSource}
            onChange={(e) => setEditedSource(e.target.value)}
            placeholder="Enter source URL"
          />
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={editedTags}
            onChange={(e) => setEditedTags(e.target.value)}
            placeholder="Enter tags, separated by commas"
          />
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={editedFilebox}
            onChange={(e) => setEditedFilebox(e.target.value)}
            placeholder="Enter filebox name"
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      ) : (
        <>
          <p className="text-gray-800 mb-2">{editedContent}</p>
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <a href={editedSource} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-600">
              <ExternalLink className="w-4 h-4 mr-1" />
              Source
            </a>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {timestamp}
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {editedTags.split(',').map((tag, index) => (
              <span key={`${id}-${tag.trim()}-${index}`} className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                <Tag className="w-3 h-3 mr-1" />
                {tag.trim()}
              </span>
            ))}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Folder className="w-4 h-4 mr-1" />
            {editedFilebox}
          </div>
          <div className="mt-2 flex justify-between items-center">
            <button
              className="text-blue-500 hover:underline"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
            <button
              className="text-red-500 hover:text-red-700"
              onClick={handleDelete}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="mb-4">Are you sure you want to delete this card?</p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}