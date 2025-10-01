# Kenya County Budget Transparency Platform

A comprehensive citizen-focused budget tracking system that transforms traditional government budget data into an accessible, transparent platform for Kenyan citizens to monitor county spending, projects, and accountability.

## 🇰🇪 Features

- **Real-time Budget Tracking** - Live OpenCounty API integration with data from all 47 counties
- **County Comparison** - Compare budget performance across multiple counties
- **Project Evidence** - Track ongoing and completed government projects
- **Citizen Feedback** - Report issues and submit complaints directly
- **Fund Flow Tracking** - Monitor budget disbursements in real-time
- **Budget Education** - Learn about government budgets through interactive courses
- **Open Data Access** - Download datasets and integrate via API
- **Whistleblowing Portal** - Anonymous corruption reporting system
- **Dark/Light Mode** - Professional dashboard with Kenyan flag color scheme

## 🚀 Deployment on Netlify

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Netlify account

### Quick Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

### Manual Deployment

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd kenya-budget-tracker
   npm install
   ```

2. **Build the Project Locally (Optional)**
   ```bash
   npm run build
   ```

3. **Deploy to Netlify**
   
   **Option A: Netlify CLI (Recommended)**
   ```bash
   # Install Netlify CLI globally
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Initialize and deploy
   netlify init
   netlify deploy --prod
   ```

   **Option B: Netlify Dashboard (Easiest)**
   - Push your code to GitHub/GitLab/Bitbucket
   - Log in to [Netlify](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your repository
   - Build settings are auto-detected from `netlify.toml`:
     - **Build command**: `npm ci && npm run build`
     - **Publish directory**: `dist`
     - **Node version**: 18
   - Click "Deploy site"
   
   **Option C: Drag and Drop**
   ```bash
   # Build locally
   npm run build
   
   # Then drag the 'dist' folder to Netlify dashboard
   ```

### Troubleshooting Deployment

If deployment fails:

1. **Clear npm cache and rebuild**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Check Node version**
   ```bash
   node --version  # Should be 18.x or higher
   ```

3. **Verify build output**
   - Build should create a `dist/` folder
   - Check that `dist/index.html` exists after building

4. **Common fixes:**
   - Ensure all dependencies are installed
   - Check that TypeScript compiles without errors
   - Verify Vite config is correct

### Environment Variables (Optional)

If you need to configure API keys or other environment variables:

1. Go to your Netlify site dashboard
2. Navigate to Site settings > Environment variables
3. Add any required variables:
   - `VITE_API_BASE_URL` - Custom API endpoint (if different from default)
   - `VITE_CORS_PROXY` - Custom CORS proxy URL (if needed)

### Build Settings

The `netlify.toml` file configures:
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node Version**: 18
- **SPA Redirects**: All routes redirect to index.html
- **Security Headers**: X-Frame-Options, CSP, etc.
- **Asset Caching**: Optimized cache headers for static assets

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Data Sources

- **OpenCounty API**: Real-time budget data from Kenyan counties
- **CORS Proxy**: AllOrigins proxy for API access
- **Years Available**: 2000-2024
- **Counties**: All 47 Kenyan counties

## 🎨 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **API Integration**: OpenCounty API

## 📱 Features by Page

1. **County Overview** - Budget allocation, spending, and project status
2. **Compare Counties** - Performance rankings and comparisons
3. **Project Evidence** - Documentation and audit reports
4. **Citizen Feedback** - Issue reporting and tracking
5. **Share & Advocate** - Social media tools and campaigns
6. **Fund Flows** - Account balances and disbursements
7. **Budget Education** - Learning courses and glossary
8. **Data & API Access** - Download datasets and API docs
9. **My Profile** - Track counties and save projects
10. **Help & Report** - Support and whistleblowing portal

## 🔒 Security Features

- Anonymous whistleblowing
- Encrypted report submission
- HTTPS enforced
- Security headers configured
- CORS protection
- XSS prevention

## 🤝 Contributing

This is a citizen-focused transparency initiative. Contributions are welcome!

## 📄 License

This project is open source and available for public use to promote government transparency.

## 🆘 Support

For technical support or questions:
- Email: support@countybudget.go.ke
- Help Center: Available in-app
- Emergency Contacts: EACC, Auditor General, CRA

## 🎯 Mission

Empowering Kenyan citizens with transparent access to county budget information, promoting accountability, and enabling effective civic participation in government spending oversight.

---

Built with ❤️ for transparent governance in Kenya 🇰🇪
