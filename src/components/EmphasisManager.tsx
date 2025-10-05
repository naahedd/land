"use client"

import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Crown } from 'lucide-react'
import { EmphasisSlider } from './EmphasisSlider'
import { EmphasisArea } from '@/../types/database'

interface EmphasisManagerProps {
  emphasisAreas: EmphasisArea[]
  onChange: (areas: EmphasisArea[]) => void
  onSave: (sectionsToRegenerate: ('projects' | 'experience')[]) => void
  isProUser: boolean
  onUpgradeClick?: () => void
  isSaving?: boolean
}

export function EmphasisManager({ 
  emphasisAreas, 
  onChange, 
  onSave,
  isProUser,
  onUpgradeClick,
  isSaving = false
}: EmphasisManagerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const addEmphasisArea = () => {
    if (emphasisAreas.length >= 5) {
      alert('Maximum 5 emphasis areas allowed')
      return
    }
    
    onChange([...emphasisAreas, { name: '', level: 0, apply_to: [] }])
  }

  const updateEmphasisArea = (
    index: number, 
    name: string, 
    level: number, 
    apply_to: ('projects' | 'experience')[]
  ) => {
    const updated = [...emphasisAreas]
    updated[index] = { name, level, apply_to }
    onChange(updated)
  }

  const removeEmphasisArea = (index: number) => {
    onChange(emphasisAreas.filter((_, i) => i !== index))
  }

  // Determine which sections need regeneration
  const getSectionsToRegenerate = (): ('projects' | 'experience')[] => {
    const sections = new Set<'projects' | 'experience'>()
    emphasisAreas.forEach(area => {
      if (area.level > 0 && area.name.trim()) {
        area.apply_to.forEach(section => sections.add(section))
      }
    })
    return Array.from(sections)
  }

  const sectionsToRegenerate = getSectionsToRegenerate()
  const canSave = sectionsToRegenerate.length > 0

  if (!isProUser) {
    return (
      <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
        <div className="flex items-center space-x-2 mb-2">
          <Crown className="h-5 w-5 text-blue-600" />
          <h4 className="text-sm font-medium text-gray-900">Emphasis Areas</h4>
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">
            PRO
          </span>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          Fine-tune AI feedback by emphasizing specific areas in your projects or experience sections.
        </p>
        <button
          onClick={onUpgradeClick}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Upgrade to Pro to unlock →
        </button>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-medium text-gray-900">Emphasis Areas</h4>
          {emphasisAreas.filter(a => a.level > 0).length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              {emphasisAreas.filter(a => a.level > 0).length}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-600 mb-3">
            Add emphasis areas and choose which sections to apply them to. Only areas with level &gt; 0 will be used.
          </p>

          {/* Scrollable container for sliders */}
          <div className="max-h-[400px] overflow-y-auto space-y-3 mb-3 pr-1">
            {emphasisAreas.map((area, index) => (
              <EmphasisSlider
                key={index}
                name={area.name}
                level={area.level}
                applyTo={area.apply_to}
                onUpdate={(name, level, apply_to) => updateEmphasisArea(index, name, level, apply_to)}
                onRemove={() => removeEmphasisArea(index)}
              />
            ))}
          </div>

          {emphasisAreas.length < 5 && (
            <button
              onClick={addEmphasisArea}
              className="w-full py-2 px-3 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Emphasis Area</span>
            </button>
          )}

          {/* Update Button */}
          <div className="pt-3 border-t border-gray-200 mt-3">
            <button
              onClick={() => onSave(sectionsToRegenerate)}
              disabled={!canSave || isSaving}
              className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Updating...</span>
                </>
              ) : (
                <span>
                  {canSave 
                    ? `Update Feedback (${sectionsToRegenerate.map(s => s === 'projects' ? 'Projects' : 'Experience').join(' & ')})`
                    : 'Select areas and sections to update'
                  }
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}