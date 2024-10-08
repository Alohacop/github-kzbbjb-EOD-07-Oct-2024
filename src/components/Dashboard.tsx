import React, { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { IndexCard } from './IndexCard'
import { Editor } from './Editor'
import { ChevronDown } from 'lucide-react'

interface IndexCardData {
  id: string
  content: string
  source: string
  timestamp: string
  tags: string[]
  filebox: string
  isEditable?: boolean
  isUsed?: boolean
  isNewCard?: boolean
}

export const Dashboard: React.FC = () => {
  const [cards, setCards] = useState<IndexCardData[]>([
    {
      id: uuidv4(),
      content: 'The impact of climate change on global agriculture',
      source: 'https://www.nature.com/articles/s41558-021-01000-1',
      timestamp: '10/6/2024, 3:17:19 PM',
      tags: ['climate change', 'agriculture', 'global impact'],
      filebox: 'Environment',
      isUsed: false,
    },
    {
      id: uuidv4(),
      content: 'Advancements in quantum computing and their potential applications',
      source: 'https://www.science.org/doi/10.1126/science.abe8770',
      timestamp: '10/6/2024, 3:17:19 PM',
      tags: ['quantum computing', 'technology', 'future applications'],
      filebox: 'Technology',
      isUsed: false,
    },
    {
      id: uuidv4(),
      content: 'The role of artificial intelligence in modern healthcare',
      source: 'https://www.thelancet.com/journals/landig/article/PIIS2589-7500(20)30295-8/fulltext',
      timestamp: '10/6/2024, 3:17:19 PM',
      tags: ['artificial intelligence', 'healthcare', 'technology'],
      filebox: 'Healthcare',
      isUsed: false,
    },
  ])
  const [editorCards, setEditorCards] = useState<IndexCardData[]>([])
  const [showSaveAsDropdown, setShowSaveAsDropdown] = useState(false)
  const [selectedFilebox, setSelectedFilebox] = useState<string>('All')

  const fileboxes = ['All', ...new Set(cards.map(card => card.filebox))]

  const filteredCards = selectedFilebox === 'All' 
    ? cards 
    : cards.filter(card => card.filebox === selectedFilebox)

  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    setEditorCards((prevCards) => {
      const newCards = [...prevCards]
      const [draggedCard] = newCards.splice(dragIndex, 1)
      newCards.splice(hoverIndex, 0, draggedCard)
      return newCards
    })
  }, [])

  const onDrop = useCallback((item: IndexCardData & { isNewCard?: boolean }, index: number) => {
    setEditorCards((prevCards) => {
      if (item.isNewCard) {
        const newCard: IndexCardData = {
          id: uuidv4(),
          content: '',
          source: '',
          timestamp: new Date().toLocaleString(),
          tags: [],
          filebox: selectedFilebox === 'All' ? 'Uncategorized' : selectedFilebox,
          isEditable: true,
          isNewCard: true,
        }
        return [...prevCards.slice(0, index), newCard, ...prevCards.slice(index)]
      } else {
        const existingIndex = prevCards.findIndex(card => card.id === item.id)
        if (existingIndex !== -1) {
          return prevCards
        } else {
          const newCard = { ...item, isEditable: true }
          return [...prevCards.slice(0, index), newCard, ...prevCards.slice(index)]
        }
      }
    })

    if (!item.isNewCard) {
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === item.id ? { ...card, isUsed: true } : card
        )
      )
    }
  }, [selectedFilebox])

  const onDragOutOfEditor = useCallback((item: IndexCardData) => {
    setEditorCards((prevCards) => prevCards.filter((card) => card.id !== item.id))
    setCards((prevCards) => {
      const existingCard = prevCards.find((card) => card.id === item.id)
      if (existingCard) {
        return prevCards.map((card) =>
          card.id === item.id ? { ...card, isUsed: false } : card
        )
      } else {
        return [...prevCards, { ...item, isUsed: false }]
      }
    })
  }, [])

  const updateCard = useCallback((updatedCard: IndexCardData) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === updatedCard.id ? { ...card, ...updatedCard } : card
      )
    )
  }, [])

  const deleteCard = useCallback((id: string) => {
    setCards((prevCards) => prevCards.filter((card) => card.id !== id))
    setEditorCards((prevCards) => prevCards.filter((card) => card.id !== id))
  }, [])

  const updateCardContent = useCallback((id: string, content: string) => {
    setEditorCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id ? { ...card, content } : card
      )
    )
  }, [])

  const updateCardTags = useCallback((id: string, tags: string[]) => {
    setEditorCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id ? { ...card, tags } : card
      )
    )
  }, [])

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Research Tool</h1>
      <div className="flex-1 flex">
        <div className="w-1/2 pr-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Index Cards</h2>
            <select
              className="border rounded p-2"
              value={selectedFilebox}
              onChange={(e) => setSelectedFilebox(e.target.value)}
            >
              {fileboxes.map((filebox) => (
                <option key={filebox} value={filebox}>
                  {filebox}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-4">
            <IndexCard
              id="new-card"
              content=""
              source=""
              timestamp=""
              tags={[]}
              filebox={selectedFilebox === 'All' ? 'Uncategorized' : selectedFilebox}
              isNewCard={true}
              updateCard={updateCard}
              deleteCard={deleteCard}
            />
            {filteredCards.map((card) => (
              <IndexCard
                key={card.id}
                {...card}
                isEditable={false}
                updateCard={updateCard}
                deleteCard={deleteCard}
              />
            ))}
          </div>
        </div>
        <div className="w-1/2 pl-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Editor</h2>
            <div className="flex space-x-2">
              <button className="bg-blue-500 text-white px-4 py-2 rounded">
                Save to WordPress
              </button>
              <div className="relative">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded flex items-center"
                  onClick={() => setShowSaveAsDropdown(!showSaveAsDropdown)}
                >
                  Save As <ChevronDown className="ml-1 w-4 h-4" />
                </button>
                {showSaveAsDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg">
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                      Save as .MD
                    </button>
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                      Save as .txt
                    </button>
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                      Save as .xml (WXR)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Editor
            cards={editorCards}
            moveCard={moveCard}
            updateCardContent={updateCardContent}
            updateCardTags={updateCardTags}
            onDrop={onDrop}
            onDragOut={onDragOutOfEditor}
            deleteCard={deleteCard}
          />
        </div>
      </div>
    </div>
  )
}