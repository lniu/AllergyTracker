# Baby Allergy Tracker

A comprehensive web application for tracking baby food allergen introduction and monitoring reactions. Built with React, TypeScript, and InstantDB for real-time data synchronization.

## Features

### 🥛 Allergen Tracking
- Track the **Big 9 allergens** (Milk, Eggs, Fish, Shellfish, Tree Nuts, Peanuts, Wheat, Soy, Sesame)
- Detailed sub-items for each allergen category
- Custom allergen support
- Visual status indicators (Safe, Testing, Reaction)
- Allergen detail pages with trial history

### 📝 Food Trial Logging
- Log food introductions with date, amount, and notes
- Associate multiple allergens with each trial
- Track trial history per allergen

### ⚠️ Reaction Monitoring
- Record reactions with symptoms, severity, and timing
- Categorize symptoms (Skin, Digestive, Respiratory, Behavioral)
- Track time elapsed after exposure
- Photo attachments support
- Detailed notes for each reaction

### 👶 Baby Activity Tracking
- Log sleep/wake cycles
- Track feeding (breast, bottle, solid food)
- Monitor diaper changes (pee/poop)
- Activity timeline view
- Automatic sleep duration calculation

### 📅 Calendar View
- Visual calendar of all food trials and reactions
- Easy date-based navigation
- Quick overview of allergen introduction timeline

### 📤 Export Functionality
- Export allergy data to PDF
- Comprehensive reports with trial and reaction history

### 🌐 Internationalization
- English and Chinese (中文) language support
- Automatic language detection
- Easy language switching

### 📱 Progressive Web App (PWA)
- Installable on mobile and desktop
- Offline support
- App-like experience

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: Zustand
- **Routing**: React Router v6
- **Backend/Database**: InstantDB
- **Internationalization**: i18next
- **Date Handling**: date-fns
- **PDF Export**: jsPDF
- **Icons**: Lucide React

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- An InstantDB account (free tier available)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd "[MyProject]Allergy tracker"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up InstantDB

1. Create an account at [InstantDB](https://instantdb.com)
2. Create a new app and get your App ID
3. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

4. Add your InstantDB App ID to `.env`:

```env
VITE_INSTANT_APP_ID=your-instant-app-id-here
```

### 4. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in your terminal).

### 5. Build for production

```bash
npm run build
```

The production build will be in the `dist` directory.

### 6. Preview production build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Dialog, etc.)
│   └── ...              # Feature-specific components
├── pages/              # Page components
├── stores/             # Zustand state management
├── lib/                # Utility functions and configurations
├── types/              # TypeScript type definitions
├── i18n/               # Internationalization files
│   └── locales/        # Translation files (en.json, zh.json)
└── App.tsx             # Main app component with routing
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_INSTANT_APP_ID=your-instant-app-id-here
INSTANT_APP_ADMIN_TOKEN=your-admin-token-here  # Optional
```

## Database Schema

The app uses InstantDB with the following main entities:

- **Allergens**: Food allergens with status tracking
- **Food Trials**: Records of food introductions
- **Reactions**: Allergy reaction records linked to trials
- **Baby Activities**: Sleep, feeding, and diaper change logs

## Features in Detail

### Allergen Status

- **Safe** 🟢: No reactions observed
- **Testing** 🟡: Currently being introduced
- **Reaction** 🔴: Allergic reaction detected

### Symptom Categories

- **Skin**: Hives, Rash, Eczema flare, Swelling, Itching
- **Digestive**: Vomiting, Diarrhea, Stomach pain, Nausea, Reflux
- **Respiratory**: Wheezing, Coughing, Runny nose, Sneezing, Difficulty breathing
- **Behavioral**: Fussiness, Poor sleep, Refusing food, Lethargy

### Reaction Severity

- **Mild**: Minor symptoms, no immediate concern
- **Moderate**: Noticeable symptoms requiring attention
- **Severe**: Serious symptoms requiring medical attention

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.

## Support

For issues and questions, please open an issue in the repository.

---

**Note**: This application is designed to help track food allergen introduction in babies. It is not a substitute for professional medical advice. Always consult with a pediatrician or allergist for medical concerns.
