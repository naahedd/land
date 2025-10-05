import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string; versionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const versionId = context.params.versionId
    const body = await request.json()
    
    // Add debug logging
    // console.log('Received emphasis update request')
    // console.log('Version ID:', versionId)
    // console.log('Request body:', JSON.stringify(body, null, 2))
    
    const { emphasis_areas } = body

    // Validate emphasis areas
    if (!Array.isArray(emphasis_areas)) {
      console.log('Validation failed: emphasis_areas is not an array')
      return NextResponse.json(
        { error: 'emphasis_areas must be an array' },
        { status: 400 }
      )
    }

    if (emphasis_areas.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 emphasis areas allowed' },
        { status: 400 }
      )
    }

    // Validate each emphasis area
    for (const area of emphasis_areas) {
      if (!area.name || typeof area.name !== 'string') {
        return NextResponse.json(
          { error: 'Each emphasis area must have a name' },
          { status: 400 }
        )
      }
      if (typeof area.level !== 'number' || area.level < 1 || area.level > 5) {
        return NextResponse.json(
          { error: 'Emphasis level must be between 1 and 5' },
          { status: 400 }
        )
      }
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, subscription_tier')
      .eq('email', session.user.email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is Pro (emphasis is Pro-only feature)
    if (user.subscription_tier !== 'pro' && emphasis_areas.length > 0) {
      return NextResponse.json(
        { 
          error: 'Emphasis areas are a Pro feature',
          upgrade_required: true 
        },
        { status: 402 }
      )
    }

    // Verify version ownership
    const { data: version, error: versionError } = await supabaseAdmin
      .from('resume_versions')
      .select(`
        id,
        resume_id,
        resumes!inner(user_id)
      `)
      .eq('id', versionId)
      .eq('resumes.user_id', user.id)
      .single()

    if (versionError || !version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    // Update emphasis areas
    const { data: updatedVersion, error: updateError } = await supabaseAdmin
      .from('resume_versions')
      .update({ emphasis_areas })
      .eq('id', versionId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ version: updatedVersion })

  } catch (error: any) {
    console.error('Update emphasis error:', error)
    return NextResponse.json(
      { error: 'Failed to update emphasis areas' },
      { status: 500 }
    )
  }
}