"use client"

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface EmphasisSliderProps {
  name: string
  level: number
  applyTo: ('projects' | 'experience')[]
  onUpdate: (name: string, level: number, applyTo: ('projects' | 'experience')[]) => void
  onRemove: () => void
}

export function EmphasisSlider({ name, level, applyTo, onUpdate, onRemove }: EmphasisSliderProps) {
  const [localName, setLocalName] = useState(name)
  const [localLevel, setLocalLevel] = useState(level)
  const [localApplyTo, setLocalApplyTo] = useState<('projects' | 'experience')[]>(applyTo)

  const getLevelLabel = (level: number) => {
    const labels = ['None', 'Low', 'Medium-Low', 'Medium', 'Medium-High', 'High']
    return labels[level] || ''
  }

  const handleCheckboxChange = (section: 'projects' | 'experience', checked: boolean) => {
    const updated = checked
      ? [...localApplyTo, section]
      : localApplyTo.filter(s => s !== section)
    setLocalApplyTo(updated)
    onUpdate(localName, localLevel, updated)
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <input
          type="text"
          value={localName}
          onChange={(e) => {
            setLocalName(e.target.value)
            onUpdate(e.target.value, localLevel, localApplyTo)
          }}
          placeholder="e.g., Metrics, Frontend, Leadership"
          className="flex-1 text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
        />
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Apply To Checkboxes */}
      <div className="mb-3 flex items-center space-x-4">
        <label className="flex items-center space-x-2 text-xs text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={localApplyTo.includes('projects')}
            onChange={(e) => handleCheckboxChange('projects', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Projects</span>
        </label>
        <label className="flex items-center space-x-2 text-xs text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={localApplyTo.includes('experience')}
            onChange={(e) => handleCheckboxChange('experience', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Experience</span>
        </label>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Emphasis Level</span>
          <span className="font-medium">{getLevelLabel(localLevel)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          value={localLevel}
          onChange={(e) => {
            const newLevel = parseInt(e.target.value)
            setLocalLevel(newLevel)
            onUpdate(localName, newLevel, localApplyTo)
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>0</span>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>
    </div>
  )
}