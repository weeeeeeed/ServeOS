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

async function verify() {
  console.log('==================================================');
  console.log('   SERVEOS SUPABASE DATA INGESTION VERIFIER');
  console.log('==================================================');

  // 1. Check Restaurants
  const { data: restos, error: rError } = await supabase.from('restaurants').select('*');
  if (rError) {
    console.error('Error fetching restaurants:', rError.message);
    return;
  }

  console.log(`Found ${restos.length} restaurant(s) in Supabase.`);
  if (restos.length === 0) {
    console.log('\n[!] ATTENTION: The "restaurants" table has 0 rows.');
    console.log('Please run "supabase/seed.sql" in your Supabase SQL Editor.');
    console.log('Instructions:');
    console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/ufyysovxuvirreiyprzu');
    console.log('2. Click on "SQL Editor" in the left sidebar');
    console.log('3. Click "New Query", paste the contents of "supabase/seed.sql", and click "Run"');
    console.log('4. Once run, rerun this script to verify data ingestion!\n');
    return;
  }

  const targetResto = restos.find(r => r.slug === 'la-piazza') || restos[0];
  console.log(`\nTarget Restaurant: "${targetResto.name}" (ID: ${targetResto.id})`);

  // 2. Check Categories & Menu Items
  const { data: cats } = await supabase.from('categories').select('*').eq('restaurant_id', targetResto.id);
  console.log(`Categories count for restaurant: ${cats ? cats.length : 0}`);

  const { data: dishes } = await supabase.from('menu_items').select('*').eq('restaurant_id', targetResto.id);
  console.log(`Menu Items count for restaurant: ${dishes ? dishes.length : 0}`);

  // 3. Test Inserting a Real Order into Supabase
  console.log('\nTesting placing a live customer order into Supabase...');
  const sampleDish = (dishes && dishes.length > 0) ? dishes[0] : null;

  const { data: orderData, error: oError } = await supabase
    .from('orders')
    .insert({
      restaurant_id: targetResto.id,
      table_number: 'Table 9 (Verification Test)',
      customer_notes: 'Supabase integration test order',
      status: 'pending',
      total_amount: sampleDish ? sampleDish.price : 290.00,
    })
    .select()
    .single();

  if (oError) {
    console.error('❌ Order insertion failed:', oError.message);
  } else {
    console.log('✅ Order inserted into public.orders! Order ID:', orderData.id);

    // Insert line item
    const { data: itemData, error: iError } = await supabase
      .from('order_items')
      .insert({
        order_id: orderData.id,
        menu_item_id: sampleDish ? sampleDish.id : null,
        name: sampleDish ? sampleDish.name : 'Test Pizza',
        quantity: 1,
        price: sampleDish ? sampleDish.price : 290.00,
      })
      .select();

    if (iError) {
      console.error('❌ Order item insertion failed:', iError.message);
    } else {
      console.log('✅ Line item inserted into public.order_items! Item ID:', itemData[0].id);
    }
  }

  // 4. Test Inserting Customer Feedback
  console.log('\nTesting submitting diner feedback into Supabase...');
  const { data: fbData, error: fbError } = await supabase
    .from('feedback')
    .insert({
      restaurant_id: targetResto.id,
      order_id: orderData ? orderData.id : null,
      customer_name: 'Diner Test Reviewer',
      rating: 5,
      comment: 'Data flow verified! Food was exceptional.',
    })
    .select()
    .single();

  if (fbError) {
    console.error('❌ Feedback submission failed:', fbError.message);
  } else {
    console.log('✅ Feedback inserted into public.feedback! Feedback ID:', fbData.id);
  }

  // 5. Final Table Counts
  console.log('\n--------------------------------------------------');
  console.log('Live Database Counts:');
  const [ordersRes, feedbackRes] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('feedback').select('*', { count: 'exact', head: true }),
  ]);
  console.log(`Orders in Supabase: ${ordersRes.count ?? 0}`);
  console.log(`Feedback in Supabase: ${feedbackRes.count ?? 0}`);
  console.log('--------------------------------------------------');
}

verify();
