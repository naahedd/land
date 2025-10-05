"use client"

import { UserButton } from "@/components/auth/UserButton"
import Image from "next/image"
import Logo from "@/assets/r83.png"
import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Resume } from "@/../types/database"
import { useRouter } from "next/navigation"
import UpgradeModal from "@/components/UpgradeModal"


export default function Dashboard() {
  const { data: session, status } = useSession();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState('')
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro'>('free')
  const [resumeCount, setResumeCount] = useState(0)
  const [hasFetchedResumes, setHasFetchedResumes] = useState(false);


  // Handle authentication
  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) {
      redirect("/auth/signin");
    }
  }, [session, status]);

  // Fetch resumes on component mount
  useEffect(() => {
    if (session && !hasFetchedResumes) {
      fetchUserSubscription();
      fetchResumes().then(() => setHasFetchedResumes(true));
    }
  }, [session, hasFetchedResumes]);

  const fetchUserSubscription = async () => {
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

  const fetchResumes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/resumes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resumes');
      }

      const data = await response.json();
      setResumes(data.resumes || []);
    } catch (error: any) {
      console.error('Error fetching resumes:', error);
      setError('Failed to load resumes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
  
    setError('')
  
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.')
      return
    }
  
    if (file.size > 10 * 1024 * 1024) {
      setError('File size should be less than 10MB.')
      return
    }
  
    setIsUploading(true)
  
    try {
      const formData = new FormData()
      formData.append('file', file)
  
      const response = await fetch('/api/resumes', {
        method: 'POST',
        body: formData,
      })
  
      if (response.status === 402) {
        // Payment required - show upgrade modal
        const errorData = await response.json()
        setUpgradeReason(errorData.error)
        setShowUpgradeModal(true)
        return
      }
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }
  
      const { resume } = await response.json()
      setResumes(prev => [resume, ...prev])
      setError('')
  
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      console.error('Upload failed:', error)
      setError(error.message || 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleResumeClick = (resumeId: string) => {
    // Navigate to resume detail page
    router.push(`/dashboard/resume/${resumeId}`);
  };

  const handleResumeDelete = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete resume');
      }

      // Remove from local state
      setResumes(prev => prev.filter(resume => resume.id !== resumeId));
    } catch (error: any) {
      console.error('Delete failed:', error);
      setError('Failed to delete resume. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#f6feea] flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-gray-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  return (
    <>
    <div className="min-h-screen bg-[#f6feea]">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Dashboard Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image src={Logo} alt="Logo" height={52} width={52} />
              <h1 className="ml-3 text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <UserButton />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'there'}!
          </h2>
          <button 
            onClick={handleUploadClick}
            disabled={isUploading}
            className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Uploading...</span>
              </>
            ) : (
              <span>Upload Resume</span>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <svg className="animate-spin h-8 w-8 text-gray-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm text-gray-500">Loading resumes...</p>
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">No resumes uploaded yet</p>
                    <p className="text-xs text-gray-400">Upload your first resume to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resumes.map((resume) => (
                      <div key={resume.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div 
                            className="flex items-start space-x-3 flex-1"
                            onClick={() => handleResumeClick(resume.id)}
                          >
                            <div className="flex-shrink-0">
                              <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate" title={resume.original_filename}>
                                {resume.original_filename}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatFileSize(resume.file_size)}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDate(resume.uploaded_at)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResumeDelete(resume.id);
                            }}
                            className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete resume"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="mt-3 flex items-center space-x-2">
                          <button 
                            onClick={() => handleResumeClick(resume.id)}
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                          >
                            Manage Versions
                          </button>
                          <a
                            href={resume.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View PDF
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
  <h3 className="text-lg font-medium text-gray-900">Account Info</h3>
  {subscriptionTier === 'pro' ? (
    <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full">
      PRO
    </span>
  ) : (
    <button
      onClick={() => setShowUpgradeModal(true)}
      className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50"
    >
      Upgrade
    </button>
  )}
</div>
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  {session?.user?.image && (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500">{session?.user?.email}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
    <span>Plan</span>
    <span className={`px-2 py-1 rounded-full font-medium ${
      subscriptionTier === 'pro' 
        ? 'bg-blue-100 text-blue-800' 
        : 'bg-gray-100 text-gray-800'
    }`}>
      {subscriptionTier === 'free' ? 'Free' : 'Pro'}
    </span>
  </div>
  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
    <span>Resumes</span>
    <span className="font-medium">
      {subscriptionTier === 'pro' ? 'Unlimited' : `${resumes.length}/1`}
    </span>
  </div>
  {subscriptionTier === 'free' && resumes.length >= 1 && (
    <button
      onClick={() => setShowUpgradeModal(true)}
      className="w-full mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium"
    >
      Upgrade for unlimited resumes
    </button>
  )}
</div>
              </div>
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
    </>
  )
}