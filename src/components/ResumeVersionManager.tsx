"use client"

import { useState, useEffect } from 'react'
import { Resume, ResumeVersion, ResumeFeedback } from '@/../types/database'
import { ArrowLeft, Plus, X, FileText, Building, Briefcase, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import UpgradeModal from '@/components/UpgradeModal'
import { EmphasisManager } from './EmphasisManager'
import { EmphasisArea } from '@/../types/database'


interface Props {
  resume: Resume
}

export default function ResumeVersionManager({ resume }: Props) {
  const [versions, setVersions] = useState<ResumeVersion[]>([])
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null)
  const [isCreatingVersion, setIsCreatingVersion] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<Record<string, ResumeFeedback[]>>({})
  const [loadingFeedback, setLoadingFeedback] = useState<Record<string, boolean>>({})
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState('')
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro'>('free')
  const [isSavingEmphasis, setIsSavingEmphasis] = useState(false)

  const [formData, setFormData] = useState({
    version_name: '',
    company_name: '',
    job_title: '',
    job_description: '',
    custom_requirements: ''
  })

  useEffect(() => {
    fetchSubscriptionTier()
  }, [])
  
  const fetchSubscriptionTier = async () => {
    try {
      const response = await fetch('/api/user/subscription')
      if (response.ok) {
        const data = await response.json()
        setSubscriptionTier(data.subscription_tier)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }

  const handleEmphasisUpdate = async (sectionsToRegenerate: ('projects' | 'experience')[]) => {
    if (!activeVersion) return
    
    try {
      setIsSavingEmphasis(true)
      
      const validAreas = versions
        .find(v => v.id === activeVersion.id)
        ?.emphasis_areas.filter(area => area.name.trim() && area.level > 0) || []
      
      const response = await fetch(`/api/resumes/${resume.id}/versions/${activeVersion.id}/emphasis`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          emphasis_areas: validAreas,
          sections_to_regenerate: sectionsToRegenerate 
        }),
      })
  
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update emphasis')
      }
  
      setVersions(prev => prev.map(v => 
        v.id === activeVersion.id 
          ? { ...v, emphasis_areas: validAreas }
          : v
      ))
  
      await regenerateFeedbackSections(activeVersion.id, sectionsToRegenerate)
      
    } catch (error: any) {
      console.error('Error updating emphasis:', error)
      alert(error.message || 'Failed to update emphasis areas')
    } finally {
      setIsSavingEmphasis(false)
    }
  }

  const regenerateFeedbackSections = async (
    versionId: string, 
    sections: ('projects' | 'experience')[]
  ) => {
    try {
      const response = await fetch(
        `/api/resumes/${resume.id}/versions/${versionId}/feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sections_to_regenerate: sections }),
        }
      )
  
      if (!response.ok) {
        throw new Error('Failed to regenerate feedback')
      }
  
      const { feedback: newFeedback } = await response.json()
      
      setFeedback(prev => {
        const existing = prev[versionId] || []
        const updated = [...existing]
        
        newFeedback.forEach((newItem: any) => {
          const index = updated.findIndex(item => item.feedback_type === newItem.feedback_type)
          if (index >= 0) {
            updated[index] = newItem
          } else {
            updated.push(newItem)
          }
        })
        
        return { ...prev, [versionId]: updated }
      })
    } catch (error) {
      console.error('Error regenerating feedback:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchVersions()
  }, [])

  const fetchVersions = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/resumes/${resume.id}/versions`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch versions')
      }
  
      const data = await response.json()
      setVersions(data.versions || [])
      
      if (data.versions && data.versions.length > 0) {
        setActiveVersionId(data.versions[0].id)
      }
    } catch (error) {
      console.error('Error fetching versions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createVersion = async () => {
    try {
      const response = await fetch(`/api/resumes/${resume.id}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
  
      if (response.status === 402) {
        const errorData = await response.json()
        setUpgradeReason(errorData.error)
        setShowUpgradeModal(true)
        return
      }
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create version')
      }

      const { version } = await response.json()
      setVersions(prev => [version, ...prev])
      setActiveVersionId(version.id)
      setIsCreatingVersion(false)
      
      setFormData({
        version_name: '',
        company_name: '',
        job_title: '',
        job_description: '',
        custom_requirements: ''
      })
    } catch (error: any) {
      console.error('Error creating version:', error)
      alert(error.message)
    }
  }

  const deleteVersion = async (versionId: string) => {
    if (!confirm('Are you sure you want to delete this version? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/resumes/${resume.id}/versions/${versionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete version')
      }

      setVersions(prev => prev.filter(v => v.id !== versionId))
      
      if (activeVersionId === versionId) {
        const remainingVersions = versions.filter(v => v.id !== versionId)
        setActiveVersionId(remainingVersions.length > 0 ? remainingVersions[0].id : null)
      }

      setFeedback(prev => {
        const newFeedback = { ...prev }
        delete newFeedback[versionId]
        return newFeedback
      })
    } catch (error) {
      console.error('Error deleting version:', error)
      alert('Failed to delete version')
    }
  }

  const generateFeedback = async (versionId: string) => {
    try {
      setLoadingFeedback(prev => ({ ...prev, [versionId]: true }))
      
      const response = await fetch(`/api/resumes/${resume.id}/versions/${versionId}/feedback`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to generate feedback')
      }

      const { feedback: newFeedback } = await response.json()
      setFeedback(prev => ({ ...prev, [versionId]: newFeedback }))
    } catch (error) {
      console.error('Error generating feedback:', error)
      alert('Failed to generate feedback')
    } finally {
      setLoadingFeedback(prev => ({ ...prev, [versionId]: false }))
    }
  }

  const fetchFeedback = async (versionId: string) => {
    try {
      const response = await fetch(`/api/resumes/${resume.id}/versions/${versionId}/feedback`)
      
      if (response.ok) {
        const { feedback: existingFeedback } = await response.json()
        setFeedback(prev => ({ ...prev, [versionId]: existingFeedback }))
      }
    } catch (error) {
      console.error('Error fetching feedback:', error)
    }
  }

  useEffect(() => {
    if (activeVersionId && !feedback[activeVersionId]) {
      fetchFeedback(activeVersionId)
    }
  }, [activeVersionId])

  const activeVersion = versions.find(v => v.id === activeVersionId)
  const activeFeedback = activeVersionId ? feedback[activeVersionId] : undefined
  const isGeneratingFeedback = activeVersionId ? loadingFeedback[activeVersionId] : false

  return (
    <div className="min-h-screen bg-[#f6feea]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
            <div className="ml-6">
              <h1 className="text-xl font-semibold text-gray-900">{resume.original_filename}</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-200px)]">
          {/* Left Side - Resume Viewer + Emphasis Manager */}
          <div className="lg:col-span-2 flex flex-col space-y-4 min-h-0">
  {/* Resume Preview */}
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[600px] flex-shrink-0">
    <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
      <h3 className="text-lg font-medium text-gray-900">Resume Preview</h3>
    </div>
    <div className="flex-1 p-4 overflow-hidden">
      <iframe
        src={resume.file_url}
        className="w-full h-full border border-gray-300 rounded"
        title="Resume Preview"
      />
    </div>
  </div>

  {/* Emphasis Manager stays below */}
  {activeVersion && (
    <div className="flex-shrink-0">
      <EmphasisManager
        emphasisAreas={activeVersion?.emphasis_areas || []}
        onChange={(areas) => {
          if (activeVersion) {
            setVersions(prev => prev.map(v => 
              v.id === activeVersion.id 
                ? { ...v, emphasis_areas: areas }
                : v
            ))
          }
        }}
        onSave={handleEmphasisUpdate}
        isProUser={subscriptionTier === 'pro'}
        onUpgradeClick={() => setShowUpgradeModal(true)}
        isSaving={isSavingEmphasis}
      />
    </div>
  )}
</div>


          {/* Right Side - Version Management */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Job Versions</h3>
                  <button
                    onClick={() => setIsCreatingVersion(true)}
                    className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Version
                  </button>
                </div>

                <div className="flex space-x-1 overflow-x-auto">
                  {versions.map((version) => (
                    <button
                      key={version.id}
                      onClick={() => setActiveVersionId(version.id)}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${
                        activeVersionId === version.id
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <span className="truncate max-w-[120px]">{version.version_name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteVersion(version.id)
                        }}
                        className="ml-2 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading versions...</p>
                    </div>
                  </div>
                ) : isCreatingVersion ? (
                  <div className="space-y-6">
                    <h4 className="text-lg font-medium text-gray-900">Create New Version</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Version Name
                        </label>
                        <input
                          type="text"
                          value={formData.version_name}
                          onChange={(e) => setFormData({ ...formData, version_name: e.target.value })}
                          placeholder="e.g., Software Engineer at Google"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={formData.company_name}
                          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                          placeholder="e.g., Google"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Job Title
                        </label>
                        <input
                          type="text"
                          value={formData.job_title}
                          onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                          placeholder="e.g., Senior Software Engineer"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Job Description
                        </label>
                        <textarea
                          value={formData.job_description}
                          onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                          placeholder="Paste the job description here..."
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Custom Requirements (Optional)
                        </label>
                        <textarea
                          value={formData.custom_requirements}
                          onChange={(e) => setFormData({ ...formData, custom_requirements: e.target.value })}
                          placeholder="Any specific requirements or notes..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={createVersion}
                        disabled={!formData.version_name || !formData.company_name || !formData.job_title}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Create Version
                      </button>
                      <button
                        onClick={() => setIsCreatingVersion(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : activeVersion ? (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">{activeVersion.company_name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{activeVersion.job_title}</span>
                        </div>
                      </div>
                      
                      {activeVersion.job_description && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-2">Job Description:</p>
                          <p className="text-sm text-gray-700 line-clamp-3">{activeVersion.job_description}</p>
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <button
                        onClick={() => generateFeedback(activeVersion.id)}
                        disabled={isGeneratingFeedback}
                        className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isGeneratingFeedback ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Generating Feedback...
                          </>
                        ) : (
                          <>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Generate AI Feedback
                          </>
                        )}
                      </button>
                    </div>

                    {activeFeedback && activeFeedback.length > 0 && (
                      <div className="space-y-6">
                        <h4 className="text-lg font-medium text-gray-900">AI Feedback</h4>
                        
                        {activeFeedback
                          .sort((a, b) => {
                            const order = {
                              'project_suggestions': 1,
                              'experience_tweaks': 2,
                              'company_matches': 3
                            };
                            return (order[a.feedback_type as keyof typeof order] || 99) - (order[b.feedback_type as keyof typeof order] || 99);
                          })
                          .map((feedback) => (
                            <div key={feedback.id} className="border border-gray-200 rounded-lg p-6 bg-white">
                              <div className="flex items-center space-x-2 mb-4">
                                <div className={`w-3 h-3 rounded-full ${
                                  feedback.feedback_type === 'project_suggestions' ? 'bg-green-500' :
                                  feedback.feedback_type === 'experience_tweaks' ? 'bg-purple-500' :
                                  'bg-orange-500'
                                }`}></div>
                                <h5 className="text-base font-semibold text-gray-900">
                                  {feedback.feedback_type === 'project_suggestions' ? 'Project Suggestions' :
                                   feedback.feedback_type === 'experience_tweaks' ? 'Enhanced Experience' :
                                   'Alternative Companies'}
                                </h5>
                              </div>
                              <div className="prose prose-sm max-w-none">
                                <ReactMarkdown>{feedback.content}</ReactMarkdown>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No versions created yet</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Create your first version to get AI-powered feedback for specific job applications.
                      </p>
                      <button
                        onClick={() => setIsCreatingVersion(true)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Version
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason={upgradeReason}
      />
    </div>
  )
}