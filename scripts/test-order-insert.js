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

async function testInsert() {
  console.log('Testing insert WITHOUT select...');
  const res1 = await supabase.from('orders').insert({
    restaurant_id: '00000000-0000-0000-0000-000000000010',
    table_number: 'Table 1',
    status: 'pending',
    total_amount: 100
  });
  console.log('Insert without select:', res1.error ? res1.error : 'Success!');
}

testInsert();
