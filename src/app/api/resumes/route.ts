import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin, uploadResumeFile } from '@/lib/supabase'
import { extractTextFromPDF, cleanResumeText } from '@/lib/pdfUtils'
import { extractTextFromPDFWithTextract } from '@/lib/textractUtils'
import { checkResumeUploadLimit } from '@/lib/subscriptionUtils'

export const runtime = "nodejs";

// GET - Fetch all resumes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: resumes, error } = await supabaseAdmin
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ resumes })
  } catch (error: any) {
    console.error('Fetch resumes error:', error)
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 })
  }
}

// POST - Upload new resume
export async function POST(request: NextRequest) {
  
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

  

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const limitCheck = await checkResumeUploadLimit(user.id);

if (!limitCheck.allowed) {
  return NextResponse.json(
    { 
      error: limitCheck.reason,
      upgrade_required: true 
    },
    { status: 402 }
  );
}

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    const resumeId = crypto.randomUUID()

    
    // Extract text from PDF using Textract
let resumeText = ''
try {
  const extractedText = await extractTextFromPDFWithTextract(file)
  resumeText = cleanResumeText(extractedText)
} catch (extractError) {
  console.error('Textract extraction failed:', extractError)
  resumeText = 'Text extraction failed'
}

    const { url, path } = await uploadResumeFile(file, user.id, resumeId)

    const { data: resume, error: dbError } = await supabaseAdmin
      .from('resumes')
      .insert({
        id: resumeId,
        user_id: user.id,
        original_filename: file.name,
        file_url: url,
        file_size: file.size,
        resume_text: resumeText,
      })
      .select()
      .single()

    if (dbError) {
      try {
        await supabaseAdmin.storage.from('resume-files').remove([path])
      } catch (cleanupError) {
        console.error('Failed to cleanup file after DB error:', cleanupError)
      }
      throw dbError
    }

    return NextResponse.json({ success: true, resume })
  } catch (error: any) {
    console.error('Resume upload error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}