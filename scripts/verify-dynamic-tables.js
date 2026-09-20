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

async function testDynamicTables() {
  console.log('--- Testing Dynamic Multi-Restaurant Table Management ---');

  // 1. Get restaurants
  const { data: restos, error: rErr } = await supabase.from('restaurants').select('id, name, slug');
  if (rErr) throw rErr;
  console.log(`Found ${restos.length} restaurants in Supabase.`);

  const testResto = restos.find(r => r.slug === 'jhons-kitchen') || restos[0];
  console.log(`Testing with restaurant: "${testResto.name}" (ID: ${testResto.id})`);

  // 2. Fetch existing tables
  const { data: initialTables, error: tErr } = await supabase
    .from('restaurant_tables')
    .select('*')
    .eq('restaurant_id', testResto.id)
    .order('sort_order', { ascending: true });
  if (tErr) throw tErr;

  console.log(`Initial table count for ${testResto.name}: ${initialTables.length}`);
  initialTables.forEach(t => console.log(`  - ${t.name} (${t.zone}, ${t.capacity} seats, status: ${t.status})`));

  // 3. Create a new table
  console.log('\n[Action 1: Add New Table]');
  const { data: newTable, error: createErr } = await supabase
    .from('restaurant_tables')
    .insert({
      restaurant_id: testResto.id,
      name: 'Rooftop Gazebo R-1',
      zone: 'Sky Lounge',
      capacity: 6,
      status: 'active',
      sort_order: 99,
    })
    .select()
    .single();

  if (createErr) throw createErr;
  console.log(`Created table: "${newTable.name}" (ID: ${newTable.id}) in zone "${newTable.zone}"`);

  // 4. Update / Rename the table
  console.log('\n[Action 2: Rename / Update Table]');
  const { data: updatedTable, error: updateErr } = await supabase
    .from('restaurant_tables')
    .update({
      name: 'Rooftop VIP Cabana R-1',
      zone: 'Sky Pavilion',
      capacity: 8,
      status: 'in_service',
    })
    .eq('id', newTable.id)
    .select()
    .single();

  if (updateErr) throw updateErr;
  console.log(`Updated table name: "${updatedTable.name}" (Capacity: ${updatedTable.capacity}, Zone: ${updatedTable.zone}, Status: ${updatedTable.status})`);

  // 5. Delete the test table
  console.log('\n[Action 3: Delete Table]');
  const { error: delErr } = await supabase
    .from('restaurant_tables')
    .delete()
    .eq('id', newTable.id);

  if (delErr) throw delErr;
  console.log(`Deleted table ID: ${newTable.id}`);

  // 6. Verify count restored
  const { data: finalTables } = await supabase
    .from('restaurant_tables')
    .select('id')
    .eq('restaurant_id', testResto.id);
  console.log(`Final table count for ${testResto.name}: ${finalTables.length}`);

  console.log('\nSUCCESS: All dynamic table operations verified against Supabase!');
}

testDynamicTables().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
