import NextAuth, { NextAuthOptions } from "next-auth"
import Google from "next-auth/providers/google"
import { supabaseAdmin } from "@/lib/supabase"

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET!,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth users - automatically create/update user in Supabase
      if (account?.provider === 'google') {
        try {
          const { error } = await supabaseAdmin
            .from('users')
            .upsert({
              email: user.email,
              name: user.name,
              image: user.image,
            }, { 
              onConflict: 'email',
              ignoreDuplicates: false 
            })
          
          if (error) {
            console.error('Error syncing Google user:', error)
            return false
          }
        } catch (error) {
          console.error('Database error:', error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        (session.user as any).id = token.sub
        
        // Optionally fetch additional user data from Supabase
        try {
          const { data: userData } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single()
          
          if (userData) {
            (session.user as any).supabaseId = userData.id
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

// Export the configured NextAuth instance
export const { auth, signIn, signOut } = NextAuth(authOptions)