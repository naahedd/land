import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import ResumeVersionManager from "@/components/ResumeVersionManager";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ResumeDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }

  // Get user from database
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', session.user.email)
    .single();

  if (userError || !user) {
    redirect("/dashboard");
  }

  // Get resume details
  const { data: resume, error: resumeError } = await supabaseAdmin
    .from('resumes')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (resumeError || !resume) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#f6feea]">
      <ResumeVersionManager resume={resume} />
    </div>
  );
}