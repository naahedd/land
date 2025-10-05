import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  context:  { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const versionId = context.params.id

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get resume to check ownership and get file path
    const { data: resume, error: resumeError } = await supabaseAdmin
      .from('resumes')
      .select('*')
      .eq('id', versionId)
      .eq('user_id', user.id)
      .single()

    if (resumeError || !resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    // Delete from storage
    const filePath = `${user.id}/${versionId}/${resume.original_filename}`
    const { error: storageError } = await supabaseAdmin.storage
      .from('resume-files')
      .remove([filePath])

    if (storageError) {
      console.error('Failed to delete file from storage:', storageError)
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database (this will cascade delete versions and feedback)
    const { error: deleteError } = await supabaseAdmin
      .from('resumes')
      .delete()
      .eq('id', versionId)
      .eq('user_id', user.id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Resume deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    )
  }
}