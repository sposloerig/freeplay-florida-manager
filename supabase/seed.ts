import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verify environment variables are loaded
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

interface GameRow {
  name: string;
  type: string;
  type_other: string | null;
  location: string;
  location_other: string | null;
  status: string;
  condition_notes: string | null;
  last_shopped: string | null;
  image_url: string | null;
}

async function seedDatabase() {
  console.log('Starting database seeding...');
  console.log('Reading CSV file from:', path.join(__dirname, 'games.csv'));
  
  const records: GameRow[] = [];
  
  // Read and parse the CSV file
  fs.createReadStream(path.join(__dirname, 'games.csv'))
    .pipe(parse({
      columns: true,
      skip_empty_lines: true,
      cast: (value, context) => {
        // Convert empty strings to null
        if (value === '') return null;
        return value;
      }
    }))
    .on('data', (data: any) => {
      console.log('Processing row:', data.name);
      // Only include the fields we want, excluding id and timestamps
      const gameData: GameRow = {
        name: data.name.trim(),
        type: data.type.trim(),
        type_other: data.type_other ? data.type_other.trim() : null,
        location: data.location.trim(),
        location_other: data.location_other ? data.location_other.trim() : null,
        status: data.status.trim(),
        condition_notes: data.condition_notes ? data.condition_notes.trim() : null,
        last_shopped: data.last_shopped ? data.last_shopped.trim() : null,
        image_url: data.image_url ? data.image_url.trim() : null
      };
      records.push(gameData);
    })
    .on('end', async () => {
      console.log(`Found ${records.length} games to import`);

      // Process records in batches of 50
      const batchSize = 50;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        
        try {
          console.log(`Processing batch ${Math.floor(i / batchSize) + 1}...`);
          const { data, error } = await supabase
            .from('games')
            .insert(batch);

          if (error) {
            console.error('Error inserting batch:', error);
            throw error;
          }

          console.log(`Inserted batch of ${batch.length} games (${i + batch.length}/${records.length})`);
        } catch (err) {
          console.error('Failed to insert batch:', err);
          process.exit(1);
        }
      }

      console.log('Database seeding completed successfully!');
      process.exit(0);
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
      process.exit(1);
    });
}

seedDatabase().catch(err => {
  console.error('Failed to seed database:', err);
  process.exit(1);
});