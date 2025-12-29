# 🧘 NAYANTHARA - QUICK START & DEMO FLOW

## ⚡ Start Development Server (30 seconds)

```bash
cd "c:\Users\Admin\New folder\nayantaramic"
npm run dev
```

Then open: **http://localhost:5173**

---

## 🎬 5-Minute Demo Flow

### **Screen 1: Home Page** (15 seconds)
- URL: `http://localhost:5173/`
- See beautiful Ayurvedic landing page
- Read about the 3 Doshas (Vata, Pitta, Kapha)
- See all 4 games described
- Gita wisdom narrative
- **Click**: "Register Now" button → Go to Screen 2

### **Screen 2: Registration** (30 seconds)
- URL: `/register`
- **Step 1**: Select role
  - Click: **"PARENT"** (to create child account)
  - → Goes to Step 2
  
- **Step 2**: Fill form
  ```
  Name: "Arjun" (or your child's name)
  Email: "arjun@family.com" (any email)
  Password: "password123"
  Confirm: "password123"
  
  Child Age: 8
  Disabilities: ✓ ADHD, ✓ Autism, ✓ Dyslexia
  Symptoms: "Difficulty focusing in class, occasional meltdowns"
  ```
  - **Click**: "Create Account"
  - → Auto-redirect to Dashboard (Screen 3)

### **Screen 3: Child Dashboard** ✅ NEW
- URL: `/dashboard`
- **See**:
  - Header: "🧘 Welcome, Arjun"
  - Stats: 0 Karma Points, 0% Progress, 0 Sessions, 0 Stories
  - **4 Game Cards** (colorful):
    1. 🔷 **Mirror Pattern** - Blue card
    2. 🌿 **Hidden Herb** - Green card
    3. 🦁 **Lion's Breath** - Orange card
    4. 🕵️ **Social Detective** - Purple card
  - Daily Routine (Dinacharya) checklist
  - Gita Stories section (locked)

- **Demo Action**: Click the **🔷 Mirror Pattern** blue card
  - → Goes to Screen 4

### **Screen 4: Mirror Pattern Game - Level 1**
- URL: `/game/mirror-pattern?level=1`
- **See**:
  - Grid: 2×2 with 4 colored dots
  - Target path: Connect dots 1 → 2 in a straight LINE
  - Timer: 30 seconds
  
- **Play**:
  1. Click dot #1 (your starting point)
  2. Click dot #2 (your ending point)
  3. **If correct** → Green line appears → "✨ LEVEL COMPLETE"
  4. **If wrong** → Red feedback → "Try again"

- **See Modal**:
  ```
  ✨ LEVEL COMPLETE!
  
  Accuracy: 100%
  Time Taken: 12 seconds
  
  📜 Gita Wisdom:
  "Like Arjuna holding his bow steady in Kurukshetra,
  you held your focus steady. Each connection is a step
  toward mastery. Well done, warrior of clarity!"
  
  [Continue to Level 2]
  ```

### **Screen 5: Back to Dashboard**
- **Click**: "Continue to Level 2" or "Back to Dashboard"
- **See Updated Stats**:
  - ✅ Karma Points: +10 (increased!)
  - ✅ Progress: 9% (1/11 levels completed)
  - ✅ Sessions: 1
  
- **Try Another Game**: Click 🌿 **Hidden Herb**
  - → Green game card launches
  - Find the golden herb among 10 brown stones
  - Click wrong stone → Impulsivity counter increases
  - Click golden herb → WIN

- **Try Lion's Breath**: Click 🦁 card
  - **Browser prompts**: "Allow Nayanthara to access your microphone"
  - **Click**: Allow
  - See real-time volume meter
  - Breathe steadily into microphone
  - After 2 seconds of steady breath (above threshold)
  - Feather 🪶 rises
  - After 3 successful breaths → WIN

- **Try Social Detective**: Click 🕵️ card
  - See scenario: "Arjun's friend is crying. What emotion is she feeling?"
  - Options: Happy, Sad, Angry, Excited
  - **Click**: "Sad" ✅ CORRECT
  - Green highlight + explanation
  - Then goes to level 2 scenario

### **Screen 6: Logout**
- **Click**: "Logout" button (top right)
- Modal: "Are you sure you want to logout?"
- **Click**: "Yes"
- → Redirected to `/login`

### **Screen 7: Doctor Login** (Optional)
- URL: `/login`
- **Enter**:
  ```
  Email: doctor@demo.com
  Password: password
  ```
- **Click**: "Login"
- → Routes to `/dashboard/doctor` (under construction)
- See: "Doctor Dashboard (Coming Soon)"

---

## 🔑 Demo Credentials

### Parents/Guardians
```
Email: parent@demo.com
Password: password
Role: PARENT
```

### Doctors
```
Email: doctor@demo.com
Password: password
Role: DOCTOR
```

### Admins
```
Email: admin@demo.com
Password: password
Role: ADMIN
```

### Child (Created via Parent Registration)
```
Auto-created on parent registration
Age: 8
Disabilities: ADHD, Autism, Dyslexia
```

---

## 🎮 Game Details for Demo

### **Game 1: Mirror Pattern** (2-5 min)
- **Level 1**: Connect 2 dots → LINE shape
- **Level 2**: Connect 3 dots → TRIANGLE
- **Level 3**: Connect 4 dots → SQUARE
- **Level 4**: Connect 5 dots → PENTAGON (timed 30s)
- **Level 5**: Grid 4×4 (harder, 25s timer)
- **Higher Levels**: 5×5, 6×6, 7×7, 8×8 grid with 15-second timer
- **Hardest (Level 11)**: 8×8 grid, 15 dots, memory mode (pattern disappears after 1s), MANDALA shape

**Success**: 80%+ accuracy AND correct sequence in time limit

---

### **Game 2: Hidden Herb** (2-5 min)
- **Level 1**: 5 brown stones + 1 golden herb (LARGE, static)
- **Level 2**: 8 distractors, medium target
- **Level 3**: 12 distractors, small target
- **Level 4**: 20 distractors, target ROTATES
- **Level 5**: 30 distractors, target BLINKS
- **Higher Levels**: Up to 150 distractors, TINY target, fast movement, camouflage

**Success**: Click the golden herb (not brown stones)
**Fails**: Click wrong stones increase "impulsivity" counter

---

### **Game 3: Lion's Breath** (2-5 min)
- **Level 1**: Breathe steadily for 2 seconds (volume > 20 dB)
- **Level 2**: 3 seconds, volume > 25 dB
- **Level 3**: 4 seconds, volume > 30 dB
- **Level 4-7**: 5-8 second durations, increasing volume
- **Level 8-11**: 8-10 second durations, specific breath patterns (STEADY, PULSE, HOLD)

**Success**: 3 successful sustained breaths
**Metrics**: Breath duration, breath volume, tremor index (variance)

**Visual**: Feather 🪶 rises as you breathe, wind animation, real-time meter

---

### **Game 4: Social Detective** (1-2 min)
- **Level 1**: "Person is smiling 😊" → Emotion: Happy/Sad/Angry?
  - Answer: Happy ✅
- **Level 2**: "Person is frowning 😞" → Emotion?
  - Answer: Sad ✅
- **Level 3**: "Person is yelling with red face 🤬" → Emotion?
  - Answer: Angry ✅
- **Levels 4-7**: Complex scenarios (cursing = angry, looking at watch = bored, etc.)
- **Levels 8-11**: Multi-layered cues (person seems happy but eyes look sad = confused/conflicted)

**Success**: Multiple choice, instant feedback (green or red)
**Explanation**: "That's correct! When someone is smiling, they usually feel happy..."

---

## 📊 Metrics That Get Recorded

Every game records:

```
{
  game_type: "MIRROR_PATTERN" | "HIDDEN_HERB" | "LIONS_BREATH" | "SOCIAL_DETECTIVE",
  level_played: 1-11,
  timestamp: "2024-01-15T14:30:00Z",
  metrics: {
    accuracy: 0-100,           // % correct
    time_taken: 45,            // seconds
    impulsivity_count: 2,      // wrong clicks/attempts
    tremor_index: 15,          // 0-100 stability measure
    completion_status: "WON"   // or "FAILED" or "ABANDONED"
  },
  ai_insight: "High tremor suggests Vata imbalance",
  recommended_action: "Try wall pushes for grounding"
}
```

---

## 🧘 Ayurvedic AI Analysis (Automatic)

After playing games, system analyzes:

### Vata (Wind) Score
- High = Shaky hands, rapid clicking, ADHD patterns
- Low = Steady, focused, controlled

### Pitta (Fire) Score
- High = Rushing, making mistakes, frustrated
- Low = Calm, methodical, patient

### Kapha (Earth) Score
- High = Slow response, lethargy, sluggish
- Low = Energetic, active, quick

**Then recommends**:
- VATA high → Wall pushes, deep pressure breathing, warm foods
- PITTA high → Cold water, cooling breath (Shitali), meditation
- KAPHA high → Brisk walk, energizing breath (Kapalabhati), light foods

---

## 🔧 Technical Notes for Developers

### Ports & URLs
- **Dev Server**: http://localhost:5173
- **API**: (Mock database, no external calls yet)
- **Build Output**: `dist/` folder

### Hot Reload
- Edit any file in `src/`
- Changes auto-reload in browser (Vite)
- No manual build needed during development

### Build for Production
```bash
npm run build
# Creates dist/ folder (471 KB JS, 36 KB CSS)
# Deploy dist/ to any static host (Azure App Service, Vercel, etc.)
```

### Lint Check
```bash
npm run lint
# Shows any code quality issues
```

---

## 🎯 Success Criteria (What to Look For)

✅ **Home Page**
- Ayurvedic design visible
- 4 game cards shown
- Register/Login buttons work

✅ **Registration**
- Role selection works
- Form submits without errors
- Auto-redirects to dashboard

✅ **Dashboard**
- Shows child name in header
- Logout button visible
- 4 game cards clickable

✅ **Games**
- Mirror Pattern: Can click dots, get win/lose feedback
- Hidden Herb: Can click target/stones, metrics displayed
- Lion's Breath: Microphone works, feather animates
- Social Detective: Multiple choice works, feedback instant

✅ **Metrics**
- Game logs recorded in mock database
- Stats update on dashboard
- Karma points increase

✅ **Build**
- No errors in console
- No TypeScript errors
- Bundle size < 500 KB

---

## 📝 Common Issues & Solutions

**Issue**: Browser asks for microphone permission (Lion's Breath)
- **Solution**: Click "Allow" - it's safe, only runs locally

**Issue**: Game doesn't start after clicking card
- **Solution**: Check browser console (F12) for errors

**Issue**: Dashboard shows "Loading..." forever
- **Solution**: Check localStorage - might need to re-register

**Issue**: Logout doesn't work
- **Solution**: Clear browser cache/localStorage manually

---

## 🚀 What's Next (After Demo)

1. **Wire Games to Dashboard** - Pass level numbers via URL
2. **Build Doctor Dashboard** - Show patient progress charts
3. **Build Admin Dashboard** - Doctor verification & allocation
4. **Connect Real Database** - MongoDB or Azure Cosmos DB
5. **Add Azure OpenAI** - Generate Gita stories dynamically
6. **Deploy to Azure** - Make it live for testing with parents/doctors

---

## 💡 Tips for Best Experience

1. **Use Chrome/Edge** for best compatibility
2. **Allow microphone permission** for Lion's Breath game
3. **Take your time** with each game (no time pressure in demo)
4. **Try both success and failure** to see different Gita stories
5. **Logout and re-login** to test session persistence

---

**Ready to see magic happen? Start the dev server and enjoy Nayanthara! 🌟**
