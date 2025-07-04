# Saletoru Mobile CRM

A powerful, AI-driven mobile CRM application built with React Native and Expo, designed to help sales professionals manage contacts, deals, tasks, and email communications with intelligent insights from Saletoru Guru.

## 🚀 Features

### Core CRM Features
- **Contacts Management**: View, search, and manage your CRM contacts
- **Deals Pipeline**: Track deals through various stages with value and probability
- **Task Management**: Create and track tasks with priorities and due dates
- **Email Integration**: Unified inbox with Gmail, Outlook, and Apple Mail support
- **Lead Scoring**: AI-powered lead scoring and recommendations

### AI-Powered Features
- **Saletoru Guru**: AI assistant providing sales tips, insights, and automation suggestions
- **Smart Insights**: Real-time analytics and recommendations
- **Lead Analysis**: Automated lead scoring and next-step suggestions
- **Automation Suggestions**: AI-recommended workflow automations

### Modern UI/UX
- **Dark Theme**: Beautiful dark interface with gradient accents
- **Responsive Design**: Optimized for all mobile devices
- **Smooth Animations**: Fluid transitions and micro-interactions
- **Brand Consistency**: Matches Saletoru web app and landing page design

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Authentication**: Supabase Auth
- **UI Components**: Custom components with Expo Linear Gradient
- **Icons**: Expo Vector Icons (Ionicons)
- **State Management**: React Context API
- **TypeScript**: Full TypeScript support

## 📱 Screenshots

*Screenshots will be added once the app is running*

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS) or Android Studio (for Android)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Janar2510/Saletoru-mobile-version.git
   cd Saletoru-mobile-version
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your phone

## 🔧 Configuration

### Environment Variables
The app is configured to use the Saletoru Supabase backend. No additional configuration is required for development.

### Supabase Setup
The app connects to the Saletoru Supabase instance with the following configuration:
- URL: `https://bsgqtbiyhqwzwzzsadkg.supabase.co`
- Database tables: `profiles`, `contacts`, `deals`, `tasks`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
│   ├── AuthContext.tsx # Authentication state
│   └── GuruContext.tsx # AI assistant context
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx
├── screens/           # App screens
│   ├── DashboardScreen.tsx
│   ├── ContactsScreen.tsx
│   ├── DealsScreen.tsx
│   ├── TasksScreen.tsx
│   ├── EmailScreen.tsx
│   ├── SettingsScreen.tsx
│   └── GuruScreen.tsx
├── services/          # API and external services
│   └── supabase.ts
├── constants/         # App constants and theme
│   └── theme.ts
├── utils/            # Utility functions
└── types/            # TypeScript type definitions
```

## 🎨 Theme & Branding

The app uses a consistent dark theme with Saletoru brand colors:
- **Primary**: Indigo (#6366f1)
- **Secondary**: Cyan (#06b6d4)
- **Background**: Dark blue (#0f0f23)
- **Surface**: Darker blue (#1a1a2e)

## 📊 Features in Detail

### Dashboard
- Key metrics overview
- Recent activity feed
- AI-powered insights
- Quick action buttons

### Contacts
- Contact list with search
- Contact details view
- Lead scoring display
- Activity history

### Deals
- Pipeline view
- Deal details
- Value tracking
- Stage management

### Tasks
- Task list with filters
- Priority management
- Due date tracking
- Status updates

### Email
- Unified inbox
- Email composition
- Open tracking
- Integration with CRM data

### Saletoru Guru
- AI-powered insights
- Sales tips and recommendations
- Lead analysis
- Automation suggestions

## 🔒 Security

- Secure authentication with Supabase
- Encrypted data transmission
- Role-based access control
- Secure API endpoints

## 📱 Platform Support

- **iOS**: 13.0+
- **Android**: API level 21+
- **Web**: Modern browsers (Chrome, Firefox, Safari, Edge)

## 🚀 Deployment

### Expo Build
```bash
# Build for iOS
npx expo build:ios

# Build for Android
npx expo build:android
```

### App Store Deployment
1. Configure app.json with your app details
2. Build the app using EAS Build
3. Submit to App Store Connect / Google Play Console

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software owned by Saletoru. All rights reserved.

## 🆘 Support

For support and questions:
- Email: support@saletoru.com
- Documentation: [Coming soon]
- Issues: GitHub Issues

## 🔮 Roadmap

### v1.1 (Next Release)
- [ ] Push notifications
- [ ] Offline support
- [ ] Advanced email templates
- [ ] Team collaboration features

### v1.2 (Future)
- [ ] Advanced analytics
- [ ] Custom automation workflows
- [ ] Integration marketplace
- [ ] Mobile-specific features

---

**Built with ❤️ by the Saletoru Team**