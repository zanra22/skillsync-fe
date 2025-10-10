# SkillSync Onboarding System - Deployment Guide

This guide covers the complete setup and deployment of the AI-powered onboarding system for SkillSync.

## 🎯 Overview

The onboarding system provides a comprehensive 7-step personalization flow:

1. **Welcome** - Introduction to SkillSync features
2. **Role Selection** - Learner/Professional/Mentor with benefit explanations
3. **Basic Info** - Name and bio collection
4. **Industry Selection** - Industry and career stage targeting
5. **Goals Setup** - Learning goals with skill levels (subscription-aware limits)
6. **Preferences** - Learning style and notification settings
7. **AI Roadmap Generation** - Personalized learning paths via Gemini AI

## 🛠️ Prerequisites

### Backend Requirements
- Python 3.8+
- Django 4.2+
- PostgreSQL or compatible database
- Google Gemini API key (for AI roadmap generation)

### Frontend Requirements
- Node.js 18+
- Next.js 14+
- React 18+
- TypeScript

## 🚀 Installation Steps

### 1. Database Setup

Run the new migrations for onboarding models:

```bash
cd skillsync-be
python manage.py makemigrations users
python manage.py migrate
```

### 2. Environment Configuration

Add to your `.env` file:

```env
# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Backend URL (for Next.js API routes)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### 3. Install Dependencies

**Backend:**
```bash
cd skillsync-be
pip install requests  # For Gemini API calls
```

**Frontend:**
```bash
cd skillsync-fe
npm install  # All dependencies should already be in package.json
```

## 🔧 Configuration

### 1. Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your environment variables as `GEMINI_API_KEY`

### 2. Database Models

The following models are now available:

- **User** - Extended with nullable role field for onboarding detection
- **UserIndustry** - Industry and career stage information
- **UserLearningGoal** - Learning goals with skill levels and priorities

### 3. Authentication Flow Update

The `AuthContext` now checks if users need onboarding after OTP verification:
- Users with missing `role`, `firstName`, or `lastName` are redirected to `/onboarding`
- Completed users go to their respective dashboards

## 📱 Frontend Components

### New Components Created:
- `components/onboarding/WelcomeStep.tsx`
- `components/onboarding/RoleSelectionStep.tsx`
- `components/onboarding/BasicInfoStep.tsx`
- `components/onboarding/IndustrySelectionStep.tsx`
- `components/onboarding/GoalsSetupStep.tsx`
- `components/onboarding/PreferencesStep.tsx`

### Main Onboarding Page:
- `app/onboarding/page.tsx` - Orchestrates the entire flow

## 🔗 API Endpoints

### Frontend API Route:
- `POST /api/onboarding/complete` - Processes onboarding data and forwards to Django

### Backend API Route:
- `POST /api/onboarding/complete/` - Saves profile data and generates AI roadmaps

## 🤖 AI Integration

### Gemini AI Service Features:
- Personalized roadmap generation based on user profile
- Fallback roadmaps when AI is unavailable
- Industry-specific and learning-style-aware recommendations
- Structured output with progressive learning steps

### Roadmap Structure:
```json
{
  "skill_name": "Python Programming",
  "description": "Complete Python learning journey",
  "total_duration": "8-12 weeks",
  "difficulty_level": "intermediate",
  "steps": [
    {
      "title": "Foundation & Basics",
      "description": "Learn Python fundamentals",
      "estimated_duration": "2 weeks",
      "difficulty": "beginner",
      "resources": ["Official docs", "Tutorials"],
      "skills_covered": ["Variables", "Functions"]
    }
  ]
}
```

## 🔒 Security Considerations

### Authentication:
- All onboarding endpoints require authentication
- JWT tokens passed via HTTP-only cookies
- CSRF protection enabled

### Data Validation:
- Required field validation on both frontend and backend
- Type safety with TypeScript interfaces
- Input sanitization for AI prompts

## 🎨 UI/UX Features

### Progressive Enhancement:
- Step-by-step progress indicators
- Form validation with real-time feedback
- Responsive design for all screen sizes
- Loading states for AI generation

### Accessibility:
- Keyboard navigation support
- Screen reader friendly
- High contrast color schemes
- Clear error messaging

## 📊 Subscription Integration

### Goal Limits by Tier:
- **FREE**: Up to 3 learning goals
- **PREMIUM**: Up to 5 learning goals
- **ENTERPRISE**: Unlimited goals

### Feature Gating:
- Advanced AI features for premium users
- Priority support for enterprise users
- Enhanced roadmap details for paid tiers

## 🐛 Troubleshooting

### Common Issues:

1. **AI Roadmaps Not Generating:**
   - Check `GEMINI_API_KEY` environment variable
   - Verify API quota and limits
   - Review server logs for AI service errors

2. **Onboarding Redirect Not Working:**
   - Ensure user has missing required fields (role, firstName, lastName)
   - Check AuthContext implementation
   - Verify middleware configuration

3. **Database Errors:**
   - Run migrations: `python manage.py migrate`
   - Check database permissions
   - Verify model relationships

### Debug Commands:

```bash
# Check migrations status
python manage.py showmigrations

# Test API endpoints
curl -X POST http://localhost:3000/api/onboarding/complete \
  -H "Content-Type: application/json" \
  -d '{"role":"learner","firstName":"Test","lastName":"User"}'

# View Django logs
python manage.py runserver --settings=core.settings.development
```

## 🚢 Deployment

### Production Checklist:

1. **Environment Variables:**
   - Set `GEMINI_API_KEY` in production
   - Configure `NEXT_PUBLIC_BACKEND_URL`
   - Update database credentials

2. **Database:**
   - Run production migrations
   - Set up database backups
   - Configure connection pooling

3. **Frontend:**
   - Build production assets: `npm run build`
   - Configure CDN for static files
   - Set up error monitoring

4. **Backend:**
   - Collect static files: `python manage.py collectstatic`
   - Configure production settings
   - Set up logging and monitoring

### Health Checks:

- `/api/onboarding/complete/` endpoint responds
- Gemini AI service connectivity
- Database migration status
- Frontend build successful

## 📈 Monitoring & Analytics

### Key Metrics to Track:
- Onboarding completion rate
- Step abandonment points
- AI roadmap generation success rate
- User satisfaction scores

### Logging:
- User onboarding progress
- AI API call status
- Error rates and patterns
- Performance metrics

## 🔄 Future Enhancements

### Planned Features:
- Onboarding analytics dashboard
- A/B testing for flow optimization
- Multi-language support
- Advanced AI personalization
- Integration with learning platforms

### Technical Improvements:
- Caching for AI responses
- Offline capability for basic flow
- Real-time progress sync
- Enhanced error recovery

## 📚 Documentation Links

- [Django Documentation](https://docs.djangoproject.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Google Gemini AI Documentation](https://ai.google.dev/docs)
- [React TypeScript Documentation](https://react-typescript-cheatsheet.netlify.app/)

---

## 🎉 Congratulations!

Your AI-powered onboarding system is now ready to provide personalized learning experiences for your users. The system scales from basic profile collection to advanced AI-driven roadmap generation, ensuring every user gets a tailored journey into SkillSync.

For support or questions, refer to the troubleshooting section or check the application logs for detailed error information.