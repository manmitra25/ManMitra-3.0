# ManMitra 3.0 🌿
### Your Mind's True Friend - Comprehensive Digital Mental Health Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.6-green.svg)](https://vitejs.dev/)

## 🎯 Overview

ManMitra 3.0 is a comprehensive digital mental health platform specifically designed for higher education students in Jammu & Kashmir, India. The platform combines AI-powered chat support, professional counseling services, mental health assessments, and peer support features to create a holistic mental wellness ecosystem.

## 🌟 Key Features

### 💬 Bestie AI Chat
- **Multilingual Support**: English, Hindi, and Urdu
- **Topic-Based Conversations**: Academic stress, anxiety, relationships, and more
- **Crisis Detection**: Real-time AI-powered crisis intervention
- **Anonymous Messaging**: Privacy-first approach with optional user identification

### 🧠 Mental Health Assessments
- **PHQ-9 Depression Screening**: Validated depression assessment tool
- **GAD-7 Anxiety Screening**: Generalized anxiety disorder assessment
- **Mood Tracking**: Daily mood check-ins with trend analysis
- **Personalized Insights**: AI-generated recommendations based on assessment results

### 👥 Professional Counseling
- **Counselor Directory**: Culturally sensitive mental health professionals
- **Flexible Booking**: Video, audio, and chat session options
- **Regional Expertise**: Counselors trained for J&K cultural context
- **Crisis Escalation**: Seamless handoff from AI to human counselors

### 🤝 Peer Support Forum
- **Safe Community**: Moderated peer-to-peer support
- **Anonymous Posting**: Optional anonymity for sensitive discussions
- **Topic Categories**: Academic, mental health, social, and general support
- **Real-time Interactions**: Live reactions and comments

### 📚 Resource Hub
- **CBT Exercises**: Cognitive Behavioral Therapy techniques
- **Mindfulness Content**: Guided meditations and breathing exercises
- **Educational Materials**: Mental health awareness resources
- **Offline Access**: Critical resources available without internet

### 🚨 Crisis Management
- **24/7 Crisis Detection**: AI-powered risk assessment
- **Emergency Contacts**: Direct integration with Tele-MANAS (104)
- **Escalation Protocols**: Automated alerts to counselors and emergency services
- **Cultural Sensitivity**: J&K-specific crisis intervention approaches

## 🏗️ Architecture

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.3.6
- **UI Library**: Custom component library built on Radix UI
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API
- **Animation**: Framer Motion
- **Charts**: Recharts for analytics visualization

### Backend Requirements
- **Database**: MongoDB with replica sets
- **Authentication**: JWT with refresh tokens
- **Real-time**: WebSocket connections
- **File Storage**: Cloud-based file management
- **External APIs**: Tele-MANAS integration, video calling services
- **Analytics**: Privacy-preserving user analytics

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/manmitra25/ManMitra.git
cd ManMitra
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
```

3. **Start the development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:3000`

### Environment Configuration

Create a `.env.local` file in the frontend directory:
```env
VITE_APP_NAME=ManMitra
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WEBSOCKET_URL=ws://localhost:5000
VITE_ENVIRONMENT=development
```

## 🌍 Multilingual Support

ManMitra supports three languages with full RTL support:
- **English** (en) - Default
- **Hindi** (hi) - Devanagari script
- **Urdu** (ur) - Arabic script with RTL layout

### Adding New Languages
1. Add translations to component translation objects
2. Update language selector options
3. Add RTL support if required
4. Test cultural appropriateness of mental health content

## 🔒 Privacy & Security

### Data Protection
- **End-to-End Encryption**: All sensitive communications
- **Anonymization**: User data anonymized for analytics
- **K-Anonymity**: Minimum 5 users per analytics group
- **GDPR Compliant**: European data protection standards
- **Local Data Storage**: Critical data stored locally when offline

### Crisis Safety
- **Mandatory Reporting**: Severe crisis cases reported to authorities
- **Emergency Contacts**: Integration with local emergency services
- **Professional Oversight**: Licensed counselors monitor AI interactions
- **Cultural Sensitivity**: J&K-specific crisis intervention protocols

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🏗️ Building for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

## 📊 Analytics & Monitoring

### Privacy-Preserving Analytics
- User interaction tracking (anonymized)
- Crisis detection accuracy metrics
- Platform usage statistics
- Mental health trend analysis

### Performance Monitoring
- Real-time error tracking
- API response time monitoring
- User session analytics
- Offline functionality metrics

## 🌏 Cultural Adaptation

### Jammu & Kashmir Specific Features
- **Regional Counselors**: Local mental health professionals
- **Cultural Context**: Content adapted for J&K cultural norms
- **Local Resources**: Region-specific crisis support resources
- **Language Support**: Kashmiri language integration (planned)

### Mental Health Considerations
- Stigma-sensitive design
- Family-inclusive approaches
- Religious and cultural accommodation
- Trauma-informed design principles

## 🤝 Contributing

We welcome contributions from mental health professionals, developers, and community members.

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make changes and test thoroughly
4. Commit changes (`git commit -m 'Add AmazingFeature'`)
5. Push to branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

### Contribution Guidelines
- Follow TypeScript and React best practices
- Ensure cultural sensitivity in all content
- Add appropriate tests for new features
- Update documentation as needed
- Respect user privacy and security requirements

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Crisis Support

If you or someone you know is experiencing a mental health crisis:

### Immediate Help
- **Tele-MANAS**: 104 (24/7 Mental Health Helpline)
- **Emergency Services**: 112
- **KIRAN**: 1800-599-0019 (24/7 Toll-free Mental Health Support)

### J&K Specific Resources
- **J&K Mental Health Helpline**: Available through Tele-MANAS
- **Local Emergency Services**: 112 or local police stations
- **District Hospitals**: Mental health services available

## 👥 Team & Acknowledgments

### Core Team
- **Development Team**: Full-stack developers specializing in mental health technology
- **Mental Health Advisors**: Licensed psychologists and counselors
- **Cultural Consultants**: J&K cultural and linguistic experts
- **Security Specialists**: Data privacy and security experts

### Special Thanks
- Tele-MANAS initiative for crisis support infrastructure
- Mental health professionals in Jammu & Kashmir
- Students who provided feedback during development
- Open source contributors and maintainers

## 📞 Contact & Support

### Technical Support
- **Email**: tech-support@manmitra.app
- **GitHub Issues**: [Create an issue](https://github.com/manmitra25/ManMitra/issues)
- **Documentation**: [Wiki](https://github.com/manmitra25/ManMitra/wiki)

### Mental Health Support
- **Crisis Helpline**: 104 (Tele-MANAS)
- **Platform Support**: support@manmitra.app
- **Counselor Network**: Available through the platform

## 📈 Roadmap

### Version 3.1 (Q2 2024)
- [ ] Advanced AI conversation capabilities
- [ ] Group therapy session support
- [ ] Enhanced mobile app experience
- [ ] Kashmiri language support

### Version 3.2 (Q3 2024)
- [ ] Wearable device integration
- [ ] Predictive mental health analytics
- [ ] Expanded counselor network
- [ ] Family involvement features

### Version 4.0 (Q4 2024)
- [ ] VR therapy experiences
- [ ] Advanced crisis prediction
- [ ] Institution-wide deployment tools
- [ ] Comprehensive API ecosystem

---

**ManMitra 3.0** - Empowering mental wellness through technology, culture, and compassion. 💙

*"In the pursuit of mental wellness, every conversation matters, every connection counts, and every person deserves support."*
