import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  const { dealId } = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // 1. Get deal info
  const { data: deal, error } = await supabase
    .from('deals')
    .select('id, owner_id, value, status')
    .eq('id', dealId)
    .single();
  if (error || !deal) return new Response('Deal not found', { status: 404 });

  // Only award points if status is 'closed_won'
  if (deal.status !== 'closed_won') {
    return new Response('Deal not closed won', { status: 400 });
  }

  // 2. Calculate points
  let pointsAwarded = 50;
  if (deal.value > 10000) pointsAwarded += 20;

  // 3. Update user's points (atomic increment)
  const { error: updateError } = await supabase.rpc('increment_user_points', {
    user_id: deal.owner_id,
    points_to_add: pointsAwarded,
  });
  if (updateError) return new Response('Failed to update points', { status: 500 });

  // 4. Badge logic: Award 'Closer Level 1' for 10 closed deals
  const { count, error: countError } = await supabase
    .from('deals')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', deal.owner_id)
    .eq('status', 'closed_won');
  if (!countError && count === 10) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('badges')
      .eq('id', deal.owner_id)
      .single();
    if (!userError && (!user.badges || !user.badges.includes('Closer Level 1'))) {
      const newBadges = user.badges ? [...user.badges, 'Closer Level 1'] : ['Closer Level 1'];
      await supabase
        .from('users')
        .update({ badges: newBadges })
        .eq('id', deal.owner_id);
    }
  }

  return new Response(JSON.stringify({ success: true, pointsAwarded }), { status: 200 });
}); 