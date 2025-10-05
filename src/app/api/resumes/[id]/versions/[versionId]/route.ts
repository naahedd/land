import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string; versionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resumeId = context.params.id
    const versionId = context.params.versionId
    
    // console.log('Resume ID:', resumeId)
    // console.log('Version ID:', versionId)

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // First verify resume ownership
    const { data: resume, error: resumeError } = await supabaseAdmin
      .from('resumes')
      .select('id')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single()

    if (resumeError || !resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    // Then verify version exists and belongs to this resume
    const { data: version, error: versionError } = await supabaseAdmin
      .from('resume_versions')
      .select('id')
      .eq('id', versionId)
      .eq('resume_id', resumeId)
      .single()

    if (versionError || !version) {
      // console.log('Version lookup error:', versionError)
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    // Delete version
    const { error: deleteError } = await supabaseAdmin
      .from('resume_versions')
      .delete()
      .eq('id', versionId)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Delete version error:', error)
    return NextResponse.json(
      { error: 'Failed to delete version' },
      { status: 500 }
    )
  }
}