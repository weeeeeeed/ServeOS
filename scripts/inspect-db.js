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

async function inspect() {
  console.log('1. Trying to sign in with demo credentials...');
  const signInRes = await supabase.auth.signInWithPassword({
    email: 'demo.owner@serveos.app',
    password: 'password123'
  });
  console.log('Demo sign in:', signInRes.error ? signInRes.error.message : 'SUCCESS! User: ' + signInRes.data.user.id);

  console.log('\n2. Testing restaurants table select:');
  const rRes = await supabase.from('restaurants').select('*');
  console.log('Restaurants:', rRes.data);

  console.log('\n3. Testing if public can insert a restaurant anonymously:');
  const rInsert = await supabase.from('restaurants').insert({
    name: 'La Piazza',
    slug: 'la-piazza',
    address: '123 Via Roma',
    phone: '+1 (555) 0199',
    subscription_status: 'trialing'
  }).select();
  console.log('Restaurant insert without owner_id:', rInsert.error ? rInsert.error.message : rInsert.data);
}

inspect();
