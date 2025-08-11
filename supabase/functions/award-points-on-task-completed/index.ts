// Supabase Edge Function to award points and badges when a task is completed
import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  const { taskId } = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // 1. Get task info
  const { data: task, error } = await supabase
    .from('tasks')
    .select('id, owner_id, status')
    .eq('id', taskId)
    .single();
  if (error || !task) return new Response('Task not found', { status: 404 });

  // Only award points if status is 'completed'
  if (task.status !== 'completed') {
    return new Response('Task not completed', { status: 400 });
  }

  // 2. Award points
  const pointsAwarded = 10;
  await supabase.rpc('increment_user_points', {
    user_id: task.owner_id,
    points_to_add: pointsAwarded,
  });

  // 3. Badge logic: Award 'Follow-up Hero' for 20 completed tasks
  const { count, error: countError } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', task.owner_id)
    .eq('status', 'completed');
  if (!countError && count === 20) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('badges')
      .eq('id', task.owner_id)
      .single();
    if (!userError && (!user.badges || !user.badges.includes('Follow-up Hero'))) {
      const newBadges = user.badges ? [...user.badges, 'Follow-up Hero'] : ['Follow-up Hero'];
      await supabase
        .from('users')
        .update({ badges: newBadges })
        .eq('id', task.owner_id);
    }
  }

  return new Response(JSON.stringify({ success: true, pointsAwarded }), { status: 200 });
}); 