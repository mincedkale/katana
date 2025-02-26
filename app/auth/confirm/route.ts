import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // redirect user to specified redirect URL or root of app
      redirect(next)
    }
    // Get the user after successful verification
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // Insert the user's UUID into the profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({ 
                id: user.id,
                // All other fields will be null/empty by default
            });
        
        if (profileError) {
            console.error('Error creating profile:', profileError);
        }
    }
  }

  // redirect the user to an error page with some instructions
  redirect('/error')
}