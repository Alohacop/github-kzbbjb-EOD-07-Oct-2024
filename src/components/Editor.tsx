import React, { useRef, useCallback, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { ExternalLink, Trash2 } from 'lucide-react'

interface IndexCardData {
  id: string
  content: string
  source: string
  timestamp: string
  tags: string[]
  filebox: string
  isEditable?: boolean
  isNewCard?: boolean
}

interface EditorProps {
  cards: IndexCardData[]
  moveCard: (dragIndex: number, hoverIndex: number) => void
  updateCardContent: (id: string, content: string) => void
  onDrop: (item: IndexCardData & { isNewCard?: boolean }, index: number) => void
  onDragOut: (item: IndexCardData) => void
  deleteCard: (id: string) => void
}

interface DragItem {
  index: number
  id: string
  type: string
}

const EditorCard: React.FC<{
  card: IndexCardData
  index: number
  moveCard: (dragIndex: number, hoverIndex: number) => void
  updateCardContent: (id: string, content: string) => void
  onDragOut: (item: IndexCardData) => void
  deleteCard: (id: string) => void
}> = ({ card, index, moveCard, updateCardContent, onDragOut, deleteCard }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  const [{ handlerId }, drop] = useDrop({
    accept: 'editor-card',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      if (dragIndex === hoverIndex) {
        return
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      moveCard(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: 'editor-card',
    item: () => {
      return { ...card, index }
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult()
      if (!dropResult) {
        onDragOut(item)
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const opacity = isDragging ? 0 : 1
  drag(drop(ref))

  const handleDelete = () => {
    setShowDeleteConfirmation(true)
  }

  const confirmDelete = () => {
    deleteCard(card.id)
    setShowDeleteConfirmation(false)
  }

  const cancelDelete = () => {
    setShowDeleteConfirmation(false)
  }

  return (
    <div ref={ref} style={{ opacity }} className="bg-white p-4 rounded-lg shadow mb-4" data-handler-id={handlerId}>
      <div className="mb-2">
        <textarea
          className="w-full p-2 border rounded mb-2"
          value={card.content}
          onChange={(e) => updateCardContent(card.id, e.target.value)}
          placeholder="Enter your content here..."
        />
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center">
          <ExternalLink className="w-4 h-4 mr-1" />
          <a href={card.source} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
            {card.source}
          </a>
        </div>
        {card.isNewCard && (
          <button
            className="text-red-500 hover:text-red-700"
            onClick={handleDelete}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
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

export const Editor: React.FC<EditorProps> = ({ cards, moveCard, updateCardContent, onDrop, onDragOut, deleteCard }) => {
  const ref = useRef<HTMLDivElement>(null)

  const [, drop] = useDrop(() => ({
    accept: ['card', 'editor-card'],
    drop(item: IndexCardData & { index?: number, isNewCard?: boolean }, monitor) {
      const didDrop = monitor.didDrop()
      if (didDrop) {
        return
      }

      const clientOffset = monitor.getClientOffset()
      if (!clientOffset || !ref.current) return

      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverY = clientOffset.y - hoverBoundingRect.top

      let insertIndex = cards.length
      for (let i = 0; i < cards.length; i++) {
        const cardNode = ref.current.children[i] as HTMLElement
        if (cardNode) {
          const cardRect = cardNode.getBoundingClientRect()
          const cardMiddleY = cardRect.top + cardRect.height / 2 - hoverBoundingRect.top
          if (hoverY < cardMiddleY) {
            insertIndex = i
            break
          }
        }
      }

      onDrop(item, insertIndex)
    },
  }), [cards, onDrop])

  return (
    <div ref={drop(ref)} className="w-full h-[calc(100%-3rem)] p-4 border rounded-lg overflow-y-auto">
      {cards.map((card, index) => (
        <EditorCard
          key={card.id}
          card={card}
          index={index}
          moveCard={moveCard}
          updateCardContent={updateCardContent}
          onDragOut={onDragOut}
          deleteCard={deleteCard}
        />
      ))}
      {cards.length === 0 && (
        <p className="text-gray-500">Drag and drop index cards here...</p>
      )}
    </div>
  )
}