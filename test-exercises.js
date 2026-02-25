require('dotenv').config();
const ExerciseService = require('./services/ExerciseService');

async function test() {
  const service = new ExerciseService();

  console.log('=== Testing Exercise Service ===\n');

  try {
    // Test 1: Get all exercises
    const all = await service.getAllExercises();
    console.log(`✓ Found ${all.length} exercises total`);

    // Test 2: Filter by category
    const strengthen = await service.getAllExercises({ category: 'strengthen' });
    console.log(`✓ Found ${strengthen.length} strengthen exercises`);

    // Test 3: Search
    const search = await service.searchExercises('bridge');
    console.log(`✓ Found ${search.length} exercises matching "bridge"`);

    // Test 4: Get by ID
    const exercise = await service.getExerciseById(1);
    if (exercise) {
      console.log(`✓ Exercise #1: ${exercise.name} ${exercise.emoji}`);
    } else {
      console.log('✗ Exercise #1 not found');
    }

    // Test 5: Get muscle groups
    const muscleGroups = await service.getAllMuscleGroups();
    console.log(`✓ Found ${muscleGroups.length} muscle groups`);

    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    console.error('\nTip: Make sure you ran the database migrations first:');
    console.error('  mysql -u root -p physio < database/migrations/003_create_exercise_tables.sql');
    console.error('  mysql -u root -p physio < database/seeds/exercise_seed.sql');
    process.exit(1);
  }
}

test();
