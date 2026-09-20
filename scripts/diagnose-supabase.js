const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const env = fs.readFileSync(envPath, 'utf8');
let url = '';
let anonKey = '';
for (const line of env.split('\n')) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) anonKey = line.split('=')[1].trim();
}

const supabase = createClient(url, anonKey);

async function run() {
  console.log('Testing Announcements table:');
  const aRes = await supabase.from('announcements').select('*').limit(1);
  console.log('Announcements:', aRes.error ? aRes.error.message : 'OK (' + aRes.data.length + ')');

  console.log('\nTesting Restaurant Notifications table:');
  const rnRes = await supabase.from('restaurant_notifications').select('*').limit(1);
  console.log('Restaurant Notifications:', rnRes.error ? rnRes.error.message : 'OK (' + rnRes.data.length + ')');

  console.log('\nTesting Subscription Plans:');
  const spRes = await supabase.from('subscription_plans').select('*');
  console.log('Plans count:', spRes.data?.length, 'data:', spRes.data);

  console.log('\nTesting Restaurants:');
  const rRes = await supabase.from('restaurants').select('*');
  console.log('Restaurants count:', rRes.data?.length, 'error:', rRes.error?.message);

  console.log('\nTesting inserting an order without existing restaurant:');
  const ordTest1 = await supabase.from('orders').insert({
    restaurant_id: '00000000-0000-0000-0000-000000000010',
    table_number: 'Table 1',
    status: 'pending',
    total_amount: 100
  }).select();
  console.log('Insert dummy UUID order result:', ordTest1.error ? ordTest1.error.message : ordTest1.data);

  console.log('\nTesting inserting order with "rst-1":');
  const ordTest2 = await supabase.from('orders').insert({
    restaurant_id: 'rst-1',
    table_number: 'Table 1',
    status: 'pending',
    total_amount: 100
  }).select();
  console.log('Insert "rst-1" order result:', ordTest2.error ? ordTest2.error.message : ordTest2.data);
}

run();
