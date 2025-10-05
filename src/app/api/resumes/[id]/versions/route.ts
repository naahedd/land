import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { checkVersionCreationLimit, incrementVersionCounter } from '@/lib/subscriptionUtils'

// Get all versions for a resume
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract the id from params properly
    const resumeId = context.params.id
    // console.log('Resume ID received:', resumeId, typeof resumeId)

    // Validate that it's a proper UUID
    if (!resumeId || typeof resumeId !== 'string') {
      return NextResponse.json({ error: 'Invalid resume ID' }, { status: 400 })
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify resume ownership
    const { data: resume, error: resumeError } = await supabaseAdmin
      .from('resumes')
      .select('id')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single()

    if (resumeError || !resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    // Get versions
    const { data: versions, error: versionsError } = await supabaseAdmin
      .from('resume_versions')
      .select('*')
      .eq('resume_id', resumeId)
      .order('created_at', { ascending: false })

    if (versionsError) {
      console.error('Versions query error:', versionsError)
      throw versionsError
    }

    return NextResponse.json({ versions: versions || [] })

  } catch (error: any) {
    console.error('Fetch versions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    )
  }
}

// Create new version
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resumeId = context.params.id
    const { 
      version_name, 
      company_name, 
      job_title, 
      job_description, 
      custom_requirements,
      emphasis_areas = [] // Add this
    } = await request.json()

    // Validate required fields
    if (!version_name || !company_name || !job_title) {
      return NextResponse.json(
        { error: 'Version name, company name, and job title are required' },
        { status: 400 }
      )
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

    // Check if emphasis areas are being used by non-Pro user
    if (user.subscription_tier !== 'pro' && emphasis_areas.length > 0) {
      return NextResponse.json(
        { 
          error: 'Emphasis areas are a Pro feature',
          upgrade_required: true 
        },
        { status: 402 }
      )
    }

    // CHECK VERSION CREATION LIMIT
    const limitCheck = await checkVersionCreationLimit(user.id)
    
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { 
          error: limitCheck.reason,
          upgrade_required: true 
        },
        { status: 402 }
      )
    }

    // Verify resume ownership
    const { data: resume, error: resumeError } = await supabaseAdmin
      .from('resumes')
      .select('id')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single()

    if (resumeError || !resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    // Create version
    const { data: version, error: versionError } = await supabaseAdmin
      .from('resume_versions')
      .insert({
        resume_id: resumeId,
        version_name,
        company_name,
        job_title,
        job_description,
        custom_requirements,
        emphasis_areas, // Add this
        is_default: false
      })
      .select()
      .single()

    if (versionError) {
      throw versionError
    }

    // INCREMENT VERSION COUNTER (only for free users)
    if (limitCheck.remainingToday !== undefined) {
      await incrementVersionCounter(user.id)
    }

    return NextResponse.json({ version })

  } catch (error: any) {
    console.error('Create version error:', error)
    return NextResponse.json(
      { error: 'Failed to create version' },
      { status: 500 }
    )
  }
}