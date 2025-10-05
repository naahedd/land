import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { generateResumeFeedback } from '@/lib/openai'



export async function GET(
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

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify ownership
    const { data: resume, error: resumeError } = await supabaseAdmin
      .from('resumes')
      .select('id')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single()

    if (resumeError || !resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    // Get feedback
    const { data: feedback, error: feedbackError } = await supabaseAdmin
      .from('resume_feedback')
      .select('*')
      .eq('version_id', versionId)
      .order('generated_at', { ascending: true })

    if (feedbackError) {
      throw feedbackError
    }

    return NextResponse.json({ feedback: feedback || [] })

  } catch (error: any) {
    console.error('Get feedback error:', error)
    return NextResponse.json(
      { error: 'Failed to get feedback' },
      { status: 500 }
    )
  }
}


export async function POST(
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
    
    // Get sections to regenerate from request body (optional)
    const body = await request.json().catch(() => ({}))
    const sectionsToRegenerate = body.sections_to_regenerate || ['recruiter_letter', 'project_suggestions', 'experience_tweaks', 'company_matches']

    // Get user, resume, and version data
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: resume, error: resumeError } = await supabaseAdmin
      .from('resumes')
      .select('id, resume_text')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single()

    if (resumeError || !resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    if (!resume.resume_text || resume.resume_text.includes('Text extraction requires additional setup')) {
      return NextResponse.json(
        { error: 'Resume text not available. Please re-upload your resume.' },
        { status: 400 }
      )
    }

    const { data: versionData, error: versionError } = await supabaseAdmin
      .from('resume_versions')
      .select('*')
      .eq('id', versionId)
      .eq('resume_id', resumeId)
      .single()

    if (versionError || !versionData) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    // console.log('Generating AI feedback for sections:', sectionsToRegenerate)

    // Filter emphasis areas based on sections
    const emphasisAreas = (versionData.emphasis_areas || []).filter((area: any) => {
      if (area.level === 0) return false
      if (!area.name.trim()) return false

      // console.log('Checking emphasis area:', area.name, 'applies to:', area.apply_to);

      // Check if this area applies to any of the sections being regenerated
      // Handle both short names ('projects', 'experience') and full names ('project_suggestions', 'experience_tweaks')
      const appliesToProjects = area.apply_to.includes('projects') && 
        (sectionsToRegenerate.includes('projects') || sectionsToRegenerate.includes('project_suggestions'))
      
      const appliesToExperience = area.apply_to.includes('experience') && 
        (sectionsToRegenerate.includes('experience') || sectionsToRegenerate.includes('experience_tweaks'))
      
      return appliesToProjects || appliesToExperience
    })

    // console.log('Using emphasis areas:', emphasisAreas)

    // Determine which sections are actually being generated
    const sectionsForOpenAI = sectionsToRegenerate.map((section: string) => {
      if (section === 'projects') return 'project_suggestions'
      if (section === 'experience') return 'experience_tweaks'
      return section
    })

    // Generate feedback
    const aiResponse = await generateResumeFeedback(
      resume.resume_text,
      versionData.job_title,
      versionData.company_name,
      versionData.job_description || '',
      versionData.custom_requirements,
      emphasisAreas,
      sectionsForOpenAI  // Pass the normalized section names
    )

    // Determine which feedback to save
    const feedbackTypes = sectionsForOpenAI.filter((s: string) => 
      ['project_suggestions', 'experience_tweaks', 'company_matches'].includes(s)
    )

    // Build feedback data array
    const feedbackData = []

    if (feedbackTypes.includes('project_suggestions') && aiResponse.project_suggestions) {
      feedbackData.push({ feedback_type: 'project_suggestions', content: aiResponse.project_suggestions })
    }
    if (feedbackTypes.includes('experience_tweaks') && aiResponse.experience_tweaks) {
      feedbackData.push({ feedback_type: 'experience_tweaks', content: aiResponse.experience_tweaks })
    }
    if (feedbackTypes.includes('company_matches') && aiResponse.company_matches) {
      feedbackData.push({ feedback_type: 'company_matches', content: aiResponse.company_matches })
    }

    // Delete only the feedback types being regenerated
    await supabaseAdmin
      .from('resume_feedback')
      .delete()
      .eq('version_id', versionId)
      .in('feedback_type', feedbackTypes)

    // Insert new feedback
    const { data: feedback, error: feedbackError } = await supabaseAdmin
      .from('resume_feedback')
      .insert(
        feedbackData.map(item => ({
          version_id: versionId,
          feedback_type: item.feedback_type,
          content: item.content
        }))
      )
      .select()

    if (feedbackError) {
      throw feedbackError
    }

    // console.log('Feedback generated successfully for sections:', feedbackTypes)

    return NextResponse.json({ feedback })

  } catch (error: any) {
    console.error('Generate feedback error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate feedback' },
      { status: 500 }
    )
  }
}