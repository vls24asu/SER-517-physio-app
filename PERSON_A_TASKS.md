# Person A - Exercise Library Backend Tasks

## What's Been Done

I've created all the backend infrastructure for the exercise library feature:

### Files Created

1. **Database Schema**: `database/migrations/003_create_exercise_tables.sql`
   - Creates `Exercise`, `Muscle_Group`, and `Exercise_Muscle_Group` tables
   - Includes indexes for performance

2. **Seed Data**: `database/seeds/exercise_seed.sql`
   - 25 muscle groups
   - 30 exercises converted from old app with emojis, difficulty levels, etc.

3. **DAO Layer**: `dao/ExerciseDAO.js`
   - `findAll(filters)` - get exercises with optional filters
   - `findById(id)` - get single exercise
   - `searchByName(query)` - search exercises
   - `findByMuscleGroup(muscleGroupId)` - filter by muscle group
   - `incrementSessionCount(id)` - track exercise usage
   - `getAllMuscleGroups()` - get all muscle groups

4. **Service Layer**: `services/ExerciseService.js`
   - Business logic wrapper around DAO

5. **Controller**: `controllers/exerciseController.js`
   - `getLibrary()` - display library with filters
   - `getExerciseDetail()` - show single exercise
   - `searchExercises()` - handle search

6. **Routes**: `routes/exerciseRoutes.js`
   - `GET /library` - library page
   - `GET /library/search` - search results
   - `GET /library/:id` - exercise detail
   - All routes are authenticated

7. **Route Registration**: Updated `routes/index.js` to include exercise routes

8. **Layout Update**: Updated `views/layouts/main.ejs` to include `/library` in fullWidthPage

---

## Your Tasks (Person A)

### Step 1: Run Database Migrations

```bash
# Connect to your MySQL database
mysql -u root -p physio

# Run the migration
source database/migrations/003_create_exercise_tables.sql

# Seed the data
source database/seeds/exercise_seed.sql
```

### Step 2: Test the Backend

Create a simple test file to verify everything works:

```javascript
// test-exercises.js
const ExerciseService = require('./services/ExerciseService');

async function test() {
  const service = new ExerciseService();

  // Test 1: Get all exercises
  console.log('Test 1: Get all exercises');
  const all = await service.getAllExercises();
  console.log(`Found ${all.length} exercises`);

  // Test 2: Filter by category
  console.log('\nTest 2: Filter by category (strengthen)');
  const strengthen = await service.getAllExercises({ category: 'strengthen' });
  console.log(`Found ${strengthen.length} strengthen exercises`);

  // Test 3: Search
  console.log('\nTest 3: Search for "bridge"');
  const search = await service.searchExercises('bridge');
  console.log(`Found ${search.length} exercises matching "bridge"`);

  // Test 4: Get by ID
  console.log('\nTest 4: Get exercise by ID (1)');
  const exercise = await service.getExerciseById(1);
  console.log(`Exercise: ${exercise.name} (${exercise.category})`);

  process.exit(0);
}

test().catch(console.error);
```

Run it:
```bash
node test-exercises.js
```

### Step 3: Coordinate with Person B

**Data structure Person B needs to know:**

Exercise object has these fields:
```javascript
{
  id: 1,
  name: "Step Downs",
  category: "strengthen",  // 'strengthen', 'stretch', 'avoid'
  description: "...",
  tips: "Engage core, squeeze glutes at top",
  common_mistakes: "Arching the back, pushing with feet",
  position: "Supine",
  equipment_needed: "Mat",
  skill_level: "Beginner",  // 'Beginner', 'Intermediate', 'Advanced'
  difficulty: "easy",  // 'easy', 'medium', 'hard'
  tempo: "2–1–2 / 5 sec hold at top",
  sets: 3.0,
  reps: "12",
  duration_seconds: 90,
  is_gym_only: 0,  // 0 or 1
  emoji: "💪",  // 💪 for strengthen, 🧘 for stretch, ⚠️ for avoid
  sessions_count: 12,
  image_url: null,
  video_url: null
}
```

**Routes available:**
- `GET /library` - Main library page (Person B will create view)
- `GET /library/:id` - Exercise detail page (Person B will create view)
- `GET /library/search?q=bridge` - Search results (Person B will create view)

**Query parameters for filtering:**
- `category` - 'strengthen', 'stretch', 'avoid', or 'all'
- `difficulty` - 'easy', 'medium', 'hard'
- `search` - search query string

---

## What Person B Needs to Build

Person B should create these view files:
1. `views/library/index.ejs` - Library grid with search/filters
2. `views/library/detail.ejs` - Exercise detail page
3. `views/library/search.ejs` - Search results page

And update:
4. `views/partials/bottomNav.ejs` - Link "Library" to `/library`
5. `public/css/custom.css` - Add exercise card styling

---

## Testing Integration (Day 3)

Once Person B has the views ready:

1. Start the server: `npm start`
2. Navigate to http://localhost:3000/library
3. Test:
   - Search functionality
   - Filter tabs (All, Strengthen, Stretch)
   - Click on exercise cards → detail page
   - Navigation back to library

---

## Optional: Add More Exercises

If you want to add all 200+ exercises from the old app, you can modify the seed generation script to include all exercises instead of just 30.

The full DML.sql file is at:
`C:\Users\mohta\Downloads\CST8319_Team7_PhysioApp_Summer2025\cst8319-25s-320-team-7-main\DML.sql`

---

## Questions?

If you encounter any issues:
1. Check database connection in `.env`
2. Verify tables were created: `SHOW TABLES;`
3. Check exercise count: `SELECT COUNT(*) FROM Exercise;`
4. Test routes with Postman or browser

Good luck! 🚀
