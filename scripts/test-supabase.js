// Script to test Supabase connection and verify tables
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.resolve(__dirname, '../.env.local');
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (fs.existsSync(envPath)) {
  const fileContent = fs.readFileSync(envPath, 'utf8');
  for (const line of fileContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = trimmed.split('=')[1]?.trim();
    }
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = trimmed.split('=')[1]?.trim();
    }
  }
}

console.log('==================================================');
console.log('   SERVEOS SUPABASE CONNECTION TESTER');
console.log('==================================================');
console.log('Target URL:', supabaseUrl || '(not configured)');
console.log('Anon Key  :', supabaseAnonKey ? (supabaseAnonKey.slice(0, 16) + '...') : '(not configured)');

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.log('\n[!] Supabase is not yet configured in .env.local.');
  console.log('Please provide your Supabase Project URL and Anon Key in .env.local.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  const tables = [
    'users',
    'restaurants',
    'categories',
    'menu_items',
    'orders',
    'order_items',
    'feedback',
    'subscriptions',
    'subscription_plans',
    'notification_subscriptions',
    'marketing_campaigns',
    'announcements',
    'restaurant_notifications'
  ];

  console.log('\nTesting connection to database tables...');
  let successCount = 0;

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log('  [WARN] Table "' + table + '": ' + error.message);
      } else {
        console.log('  [OK] Table "' + table + '": OK (' + (data ? data.length : 0) + ' sample row(s) accessible)');
        successCount++;
      }
    } catch (err) {
      console.log('  [ERR] Table "' + table + '": ' + err.message);
    }
  }

  console.log('\n--------------------------------------------------');
  console.log('Summary: ' + successCount + '/' + tables.length + ' tables verified successfully!');
  if (successCount === tables.length) {
    console.log('SUCCESS: Supabase is fully connected and ready for ServeOS production!');
  } else {
    console.log('NOTE: Run supabase/complete_setup.sql in your Supabase SQL Editor to initialize all tables.');
  }
}

testConnection();
