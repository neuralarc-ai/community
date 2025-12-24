import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/app/lib/supabaseServerClient';
import { sendEmail } from '@/app/lib/mail';
import { get15MinReminderEmailHtml, get5MinReminderEmailHtml } from '@/app/lib/emailTemplates';

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

    // 15-minute notification
    if (minutesUntilWorkshop >= 14 && minutesUntilWorkshop <= 16) {
      const { data: waitlistEntries, error: waitlistError } = await supabase
        .from('workshop_waitlist')
        .select('id, user_email')
        .eq('workshop_id', workshop.id)
        .eq('notified_15_min', false);

      if (waitlistError) {
        console.error(`Error fetching 15-min waitlist for workshop ${workshop.id}:`, waitlistError);
        continue;
      }

      for (const entry of waitlistEntries) {
        const subject = `Reminder: Your workshop "${workshop.title}" starts in 15 minutes!`;
        const html = get15MinReminderEmailHtml(workshop); // Implement this function
        await sendEmail({ to: entry.user_email, subject, html });

        await supabase
          .from('workshop_waitlist')
          .update({ notified_15_min: true })
          .eq('id', entry.id);
      }
    }

    // 5-minute notification
    if (minutesUntilWorkshop >= 4 && minutesUntilWorkshop <= 6) {
      const { data: waitlistEntries, error: waitlistError } = await supabase
        .from('workshop_waitlist')
        .select('id, user_email')
        .eq('workshop_id', workshop.id)
        .eq('notified_15_min', true) // Ensure 15-min was sent
        .eq('notified_5_min', false);

      if (waitlistError) {
        console.error(`Error fetching 5-min waitlist for workshop ${workshop.id}:`, waitlistError);
        continue;
      }

      for (const entry of waitlistEntries) {
        const subject = `Reminder: Your workshop "${workshop.title}" starts in 5 minutes!`;
        const html = get5MinReminderEmailHtml(workshop); // Implement this function
        await sendEmail({ to: entry.user_email, subject, html });

        await supabase
          .from('workshop_waitlist')
          .update({ notified_5_min: true })
          .eq('id', entry.id);
      }
    }
  }

  return NextResponse.json({ message: 'Workshop notification check completed.' }, { status: 200 });
}
