import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin, uploadResumeFile } from '@/lib/supabase'
import { extractTextFromPDF, cleanResumeText } from '@/lib/pdfUtils'
import { checkResumeUploadLimit } from '@/lib/subscriptionUtils'

export const runtime = "nodejs";


export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const limitCheck = await checkResumeUploadLimit(user.id);
    
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { 
          error: limitCheck.reason,
          upgrade_required: true 
        },
        { status: 402 } // 402 Payment Required
      );
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      )
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Generate resume ID
    const resumeId = crypto.randomUUID()


    let resumeText = ''
    try {
      const extractedText = await extractTextFromPDF(file)
      resumeText = cleanResumeText(extractedText)


      if (resumeText.length === 0) {
        console.warn('No text extracted — possibly scanned PDF')
      }
    } catch (extractError) {
      console.error('PDF extraction failed:', extractError)
      resumeText = 'Text extraction failed'
    }


    // Upload file to storage
    const { url, path } = await uploadResumeFile(file, user.id, resumeId)

    // Save resume metadata to database (including extracted text)
    const { data: resume, error: dbError } = await supabaseAdmin
      .from('resumes')
      .insert({
        id: resumeId,
        user_id: user.id,
        original_filename: file.name,
        file_url: url,
        file_size: file.size,
        resume_text: resumeText, // Store extracted text
      })
      .select()
      .single()

    if (dbError) {
      // If database insert fails, clean up the uploaded file
      try {
        await supabaseAdmin.storage
          .from('resume-files')
          .remove([path])
      } catch (cleanupError) {
        console.error('Failed to cleanup file after DB error:', cleanupError)
      }
      
      throw dbError
    }

    return NextResponse.json({
      success: true,
      resume
    })

  } catch (error: any) {
    console.error('Resume upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}