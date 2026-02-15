# Rubik Cube Solver - Rubik's Cube Solver & Learning Platform

A comprehensive web application for solving Rubik's cubes, discovering algorithms, practicing speedcubing techniques, and learning advanced solving methods. Built with modern TypeScript, React, and Supabase.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Node Version](https://img.shields.io/badge/node-%3E%3D16-brightgreen)

## 🎯 Overview

Rubik Cube Solver is an intelligent Rubik's Cube solving platform that combines:
- **Automated Solving**: Fast algorithm-based cube solver that finds optimized solutions
- **Learning System**: Structured lessons and tutorials for mastering cube solving techniques
- **Practice Mode**: Timed solving practice with personal statistics tracking
- **Algorithm Explorer**: Discover new algorithms and research efficient solutions
- **Visual Tools**: Interactive 3D cube visualization and manipulation
- **User Accounts**: Personalized profiles with solve history and performance tracking

Whether you're a beginner learning the basics or an advanced speedcuber researching new algorithms, Rubik Cube Solver provides the tools you need.

## 🚀 Features

### Core Features
- **Intelligent Cube Solver**: Find solutions for any valid Rubik's cube configuration
- **Multiple Input Methods**:
  - Color picker interface for manual cube state entry
  - Scramble notation (standard cube notation)
  - Camera input for real cube analysis
- **Solution Display**: View step-by-step solutions with move-by-move breakdowns
- **3D Visualization**: Interactive 3D cube player with animation controls

### Learning & Practice
- **Lesson Viewer**: Learn solving methods and techniques with guided lessons
- **Practice Mode**: Timed practice sessions with automatic scrambles
- **Statistics Dashboard**: Track your solving times, improvements, and personal records
- **Solve History**: View all your past solves with detailed information

### User Features
- **Authentication**: Secure user registration and login with Supabase
- **Profile Management**: Customize your profile with avatar and personal information
- **Sync Across Devices**: Access your solve history and statistics anywhere
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 📋 Tech Stack

### Frontend
- **React 18**: Modern UI library with hooks
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: High-quality React components
- **React Hook Form**: Efficient form state management
- **Zustand**: Lightweight state management

### Backend & Services
- **Supabase**: PostgreSQL database with built-in authentication
- **PostGIS**: Spatial database for advanced features (if needed)
- **JWT Authentication**: Secure session management

### Cube Solving
- **cubing.js**: Professional Rubik's cube algorithms library
- **Web Workers**: Offload heavy computation to prevent UI blocking

### Development
- **ESLint**: Code quality and style consistency
- **PostCSS**: CSS preprocessing
- **Bun**: Fast JavaScript runtime

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+ (or Bun as an alternative runtime)
- npm or Bun package manager
- Git for version control

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd CubeMind
```

2. **Install dependencies**
```bash
npm install
# or with Bun
bun install
```

3. **Environment Setup**
Create a `.env.local` file in the project root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start Development Server**
```bash
npm run dev
```
The application will be available at `http://localhost:8080`

5. **Build for Production**
```bash
npm run build
```

6. **Preview Production Build**
```bash
npm run preview
```

## 📁 Project Structure

```
main/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── ui/             # Shadcn UI components
│   │   ├── AlgorithmCard.tsx
│   │   ├── CameraInput.tsx
│   │   ├── CubePlayer.tsx
│   │   ├── Header.tsx
│   │   ├── LessonViewer.tsx
│   │   ├── SolutionPanel.tsx
│   │   ├── Statistics.tsx
│   │   ├── Timer.tsx
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── Index.tsx       # Home page
│   │   ├── LearnPage.tsx   # Learning hub
│   │   ├── Practice.tsx    # Practice mode
│   │   ├── Profile.tsx     # User profile
│   │   ├── Login.tsx       # Authentication
│   │   ├── Register.tsx    # Sign up
│   │   └── NotFound.tsx    # 404 page
│   ├── context/            # React Context for state
│   │   └── AuthContext.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/                # Utilities and solvers
│   │   ├── Cube.ts         # Cube state management
│   │   ├── cubeStateConverter.ts
│   │   ├── solver.ts       # Main solving algorithm
│   │   ├── visualSolver.ts
│   │   └── utils.ts
│   ├── store/              # State management
│   │   └── cubeStore.ts    # Zustand store for cube state
│   ├── types/              # TypeScript interfaces
│   │   ├── learning.ts
│   │   └── supabase.ts
│   ├── data/               # Static data
│   │   └── algorithms.ts
│   ├── integrations/       # External service integrations
│   │   └── supabase/
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── public/                 # Static assets
│   └── robots.txt
├── supabase/              # Supabase configuration
│   ├── migrations/        # Database migrations
│   │   └── 001_create_user_tables.sql
│   ├── functions/         # Serverless functions
│   │   └── solve-cube/
│   └── config.toml
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS config
├── package.json
└── README.md
```

## 🔧 Key Components

### Cube Solver (`lib/solver.ts`)
The core solving algorithm that takes a scrambled cube state and returns an optimal solution path.

### State Management (`store/cubeStore.ts`)
Zustand-based state management for:
- Current cube configuration
- Solving history
- Algorithm library
- User preferences

### Authentication (`context/AuthContext.tsx`)
Manages user authentication with Supabase, handling login, registration, and session persistence.

### Visualization (`lib/visualSolver.ts`)
Handles 3D cube rendering and animation using the cubing.js library.

## 🎮 Usage Guide

### Solving a Cube
1. Navigate to the home page
2. Input your cube state using:
   - **Color Picker**: Click each face and select colors
   - **Scramble Notation**: Enter standard cube notation (e.g., "R U R' U'")
   - **Camera**: Use your device camera to scan a cube
3. Click "Solve" to get the solution
4. View step-by-step moves in the solution panel
5. Optionally save your solve to your history

### Learning
1. Visit the **Learn** page
2. Select a lesson topic
3. Follow along with interactive tutorials
4. Practice the concepts with guided exercises

### Practice Mode
1. Go to **Practice** page
2. Select scramble options and time format
3. Start timer and solve your cube
4. Submit your time to track statistics
5. View personal records and improvement trends

## 🔗 Integration Details

### Supabase Database

**Tables:**
- `profiles`: User information (name, avatar, created_at)
- `solves`: Individual cube solutions (scramble, time, image, timestamp)

**Authentication:**
- Email/password authentication
- JWT tokens for session management

### API Endpoints

The application connects to Supabase Edge Functions for serverless operations like advanced solving queries.

## 📊 State Management

Uses **Zustand** for lightweight, efficient global state:
```typescript
// Example - Cube state store
{
  cubeState: ICubeState,
  setCubeState: (state: ICubeState) => void,
  solution: Move[],
  setSolution: (moves: Move[]) => void,
  // ... other actions
}
```

## 🔐 Security

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Row-level security (RLS) on database tables
- **HTTPS**: All data transmitted securely
- **Environment Variables**: Sensitive keys in `.env.local` (not committed)

## 🧪 Testing

Run linting to check code quality:
```bash
npm run lint
```

## 🌐 Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Responsive Design

The application uses Tailwind CSS with responsive breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

Custom hook `use-mobile.tsx` helps manage responsive behavior.

## 🚀 Deployment

### Production Build
```bash
npm run build
```

This creates an optimized build in the `dist/` directory ready for deployment.

### Deployment Platforms Supported
- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**
- **Any static host** with Node.js backend

### Environment Configuration
Set these environment variables in your deployment platform:
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## 📝 Development Workflow

### Code Quality
- **Linting**: ESLint with strict rules
- **Type Safety**: Full TypeScript coverage
- **Component Structure**: Consistent patterns using React Hooks

### Best Practices
- **Hooks Over Classes**: Modern React with functional components
- **Custom Hooks**: Reusable logic in dedicated hook files
- **Component Composition**: Small, focused components
- **Context for Auth**: Centralized authentication state

## 🐛 Known Limitations

- Camera input requires HTTPS in production
- Cube solving optimized for standard 3x3 Rubik's cubes
- Some advanced puzzle types not yet supported


## 📚 Learning Resources

- [Rubik's Cube Notation Guide](https://ruwix.com/the-rubiks-cube/notation/)
- [cubing.js Documentation](https://js.cubing.net/)
- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

This project is open source. Check the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev)
- UI components from [Shadcn/ui](https://ui.shadcn.com)
- Cube algorithms powered by [cubing.js](https://js.cubing.net/)
- Database by [Supabase](https://supabase.com)
- Styling with [Tailwind CSS](https://tailwindcss.com)

## 📞 Support & Contact

For issues or feature requests, please open an issue in the repository.

---

**Last Updated:** February 2026
**Version:** 1.0.0
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
