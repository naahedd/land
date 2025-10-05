import { supabaseAdmin } from './supabase';

export async function checkResumeUploadLimit(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  currentCount?: number;
}> {
  try {
    // Get user subscription info
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return { allowed: false, reason: 'User not found' };
    }

    // Pro users have unlimited uploads
    if (user.subscription_tier === 'pro') {
      return { allowed: true };
    }

    // Free users: check if they already have a resume
    const { count, error: countError } = await supabaseAdmin
      .from('resumes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('Error counting resumes:', countError);
      return { allowed: false, reason: 'Failed to check limit' };
    }

    const currentCount = count || 0;

    if (currentCount >= 1) {
      return { 
        allowed: false, 
        reason: 'Free tier limit reached. Upgrade to Pro for unlimited resumes.',
        currentCount 
      };
    }

    return { allowed: true, currentCount };
  } catch (error) {
    console.error('Resume limit check error:', error);
    return { allowed: false, reason: 'Failed to check limit' };
  }
}

export async function checkVersionCreationLimit(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  remainingToday?: number;
}> {
  try {
    // Get user subscription info
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('subscription_tier, daily_versions_created, last_version_reset')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return { allowed: false, reason: 'User not found' };
    }

    // Pro users have unlimited versions
    if (user.subscription_tier === 'pro') {
      return { allowed: true };
    }

    // Check if we need to reset the counter (new day in UTC)
    const lastReset = new Date(user.last_version_reset);
    const now = new Date();
    const isNewDay = lastReset.toDateString() !== now.toDateString();

    let currentCount = user.daily_versions_created;

    if (isNewDay) {
      // Reset counter for new day
      await supabaseAdmin
        .from('users')
        .update({
          daily_versions_created: 0,
          last_version_reset: now.toISOString()
        })
        .eq('id', userId);
      
      currentCount = 0;
    }

    // Free users: 3 versions per day limit
    if (currentCount >= 3) {
      return { 
        allowed: false, 
        reason: 'Daily limit of 3 versions reached. Upgrade to Pro for unlimited versions.',
        remainingToday: 0
      };
    }

    return { 
      allowed: true, 
      remainingToday: 3 - currentCount 
    };
  } catch (error) {
    console.error('Version limit check error:', error);
    return { allowed: false, reason: 'Failed to check limit' };
  }
}

export async function incrementVersionCounter(userId: string): Promise<void> {
  try {
    await supabaseAdmin.rpc('increment_version_count', { user_id: userId });
  } catch (error) {
    // Fallback to manual increment
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('daily_versions_created')
      .eq('id', userId)
      .single();

    if (user) {
      await supabaseAdmin
        .from('users')
        .update({ daily_versions_created: user.daily_versions_created + 1 })
        .eq('id', userId);
    }
  }
}