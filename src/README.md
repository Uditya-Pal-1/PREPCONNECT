# Technoscien PrepConnect MVP

An interview mentorship platform connecting students with mentors (2-5 years experience) for guidance.

## Features

- **Separate Authentication**: Distinct signup/login flows for students and mentors
- **Profile Management**: Role-specific profile creation and editing
- **Mentor Discovery**: Browse and search mentor profiles
- **Real-time Messaging**: 1:1 chat functionality with file uploads
- **Connection Requests**: Send and manage connection requests between users
- **Responsive Design**: Mobile-first UI with desktop support
- **File Upload System**: Share documents and resources

## Tech Stack

- **Frontend**: React.js + TypeScript + Tailwind CSS v4
- **Backend**: Supabase (Authentication, Database, Real-time, Storage)
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── App.tsx                 # Main application component
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── Mobile*.tsx       # Mobile-specific components
│   ├── Desktop*.tsx      # Desktop-specific components
│   └── ...               # Other components
├── utils/                # Utility functions
│   ├── supabase/        # Supabase client configuration
│   └── ...              # Other utilities  
├── supabase/            # Supabase edge functions
└── styles/              # CSS styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Environment Setup

The application uses Supabase for backend services. Make sure to:

1. Create a Supabase project
2. Set up the database schema (handled by the application)
3. Configure authentication providers if needed
4. Add your Supabase URL and anon key to environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.