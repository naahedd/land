"use client"

import { useState } from 'react'
import { X, Check, Zap } from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  reason?: string
}

export default function UpgradeModal({ isOpen, onClose, reason }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleUpgrade = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout')
      }

      const { checkoutUrl } = await response.json()
      
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl
    } catch (error: any) {
      console.error('Upgrade error:', error)
      alert(error.message || 'Failed to start checkout')
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to Pro</h2>
          {reason && (
            <p className="text-sm text-red-600 mb-4">{reason}</p>
          )}
          <p className="text-gray-600">One-time payment. Lifetime access.</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
          <div className="text-center mb-4">
            <span className="text-4xl font-bold text-gray-900">$10</span>
            <span className="text-gray-600 ml-2">one-time</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">Unlimited resume uploads</span>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">Unlimited version creation</span>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">Enhanced AI feedback with GPT-4o</span>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">Priority support</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Upgrade Now - $10'}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Secure payment processed by Stripe
        </p>
      </div>
    </div>
  )
}