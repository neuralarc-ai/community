import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/app/lib/supabaseServerClient';
import { sendEmail } from '@/app/lib/mail';

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  const now = new Date();

  // Fetch workshops starting in the next 20 minutes
  const { data: upcomingWorkshops, error: workshopsError } = await supabase
    .from('workshops')
    .select('id, title, description, start_time')
    .gt('start_time', now.toISOString())
    .lt('start_time', new Date(now.getTime() + 20 * 60 * 1000).toISOString()); // within next 20 minutes

  if (workshopsError) {
    console.error('Error fetching upcoming workshops:', workshopsError);
    return NextResponse.json({ error: 'Failed to fetch workshops' }, { status: 500 });
  }

  for (const workshop of upcomingWorkshops) {
    const workshopStartTime = new Date(workshop.start_time);
    const timeUntilWorkshop = workshopStartTime.getTime() - now.getTime(); // in milliseconds
    const minutesUntilWorkshop = Math.round(timeUntilWorkshop / (1000 * 60));


  }

  return NextResponse.json({ message: 'Workshop notification check completed.' }, { status: 200 });
}
