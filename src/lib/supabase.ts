import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side supabase (for your app)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client (for server-side operations)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// File upload utility
export const uploadResumeFile = async (file: File, userId: string, resumeId: string) => {
  const fileName = `${resumeId}/${file.name}`
  const filePath = `${userId}/${fileName}`

  const { data, error } = await supabase.storage
    .from('resume-files')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw error
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from('resume-files')
    .getPublicUrl(filePath)

  return {
    path: data.path,
    url: urlData.publicUrl
  }
}

// Delete file utility
export const deleteResumeFile = async (filePath: string) => {
  const { error } = await supabase.storage
    .from('resume-files')
    .remove([filePath])

  if (error) {
    throw error
  }
}