# Tax-Trail Application

<div align="center">

![Tax Trail Logo](./my-app/src/assets/logo.png)

**Empowering Public Budget Transparency Through Mobile Technology**

[![SDG](https://img.shields.io/badge/SDG-Reduced%20Inequalities-blue.svg)](https://sdgs.un.org/goals/goal10)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.4-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0.12-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

</div>

---

## About

**Tax-Trail** is a modern mobile application designed to promote **Public Budget Transparency** in alignment with the United Nations Sustainable Development Goal (SDG) 10: **Reduced Inequalities**.

The application empowers citizens to:
- Convert and track tax-related currency transactions
- Monitor live exchange rates for better financial planning
- Detect anomalies in financial data using AI-powered insights
- Visualize budget trends and make informed decisions
- Get intelligent predictions and recommendations from AI analysis

---

## Key Features

###  **Core Features**

| Feature | Description |
|---------|-------------|
| ** Secure Authentication** | Email/password authentication with Google OAuth integration powered by Appwrite |
| ** Currency Converter** | Real-time multi-currency conversion with support for 150+ currencies |
| ** Live Exchange Rates** | Track live rate changes and trends with visual charts |
| ** AI-Powered Anomaly Detection** | Intelligent anomaly detection using LangChain + Groq (Llama 3.3-70B) |
| ** Executive Summaries** | Generate professional AI-powered financial reports |
| ** Profile Management** | Personalized user profiles with image upload support |
| ** Modern UI/UX** | Beautiful, intuitive interface with smooth animations |

###  **AI-Powered Intelligence**

- **Anomaly Analysis**: Automatically detects unusual patterns in financial data
- **Predictive Insights**: Forecasts future trends with confidence levels
- **Business Context**: Explains *why* anomalies occurred, not just *what* happened
- **Action Recommendations**: Suggests specific steps to address issues
- **Risk & Opportunity Detection**: Identifies potential risks and opportunities

---

##  Technology Stack

### **Frontend (Mobile App)**
```
├── React Native 0.81.4
├── Expo 54.0.12
├── TypeScript 5.9.2
├── React Navigation 6.x (Bottom Tabs + Native Stack)
├── Zustand 4.5.2 (State Management)
├── React Native Chart Kit (Data Visualization)
├── Appwrite SDK 13.0.0 (Authentication & Backend)
└── Axios (HTTP Client)
```

### **Backend (Server)**
```
├── Node.js 18+
├── Express 5.1.0
├── TypeScript 5.4.5
├── LangChain 0.3.35
├── Groq AI (Llama 3.3-70B)
├── Appwrite (Database & Auth)
├── Axios (API Calls)
└── SerpAPI (Optional - for Google-based rates)
```

---

##  Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0.0 or higher)
- **npm** or **yarn** package manager
- **Expo CLI** (for mobile development)
- **Git** (for version control)
- **Android Studio** or **Xcode** (for device emulation)
- **Groq API Key** (required for AI features - [Get it here](https://console.groq.com/))
- **Appwrite Account** (for backend services)

---

##  Installation

### **1️⃣ Clone the Repository**

```bash
git clone https://github.com/yourusername/Tax-Trail-Application.git
cd Tax-Trail-Application
```

### **2️⃣ Install Mobile App Dependencies**

```bash
cd my-app
npm install
```

### **3️⃣ Install Server Dependencies**

```bash
cd my-app/server
npm install
```

---

##  Configuration

### ** Backend Configuration**

1. **Create Environment File**

   Navigate to `my-app/server/` and create a `.env` file:

   ```bash
   cd my-app/server
   # Windows
   type nul > .env
   
   # Mac/Linux
   touch .env
   ```

2. **Add Configuration Variables**

   Open `my-app/server/.env` and add:

   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development

   #  REQUIRED: Groq API Key for AI Features
   GROQ_API_KEY=gsk_your_actual_api_key_here

   # Appwrite Configuration
   APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=68dcab440025ead1fabe
   APPWRITE_PROJECT_NAME=TaxTrail
   APPWRITE_API_KEY=your_appwrite_api_key
   APPWRITE_DB_ID=taxdb
   APPWRITE_TAXES_COLLECTION_ID=taxes

   # Optional: SerpAPI for Exchange Rates
   SERPAPI_API_KEY=your_serpapi_key_here
   ```

3. **Get Your API Keys**

   - **Groq API Key**: [Sign up at console.groq.com](https://console.groq.com/)
   - **Appwrite**: [Create project at appwrite.io](https://appwrite.io/)
   - **SerpAPI** (Optional): [Get key at serpapi.com](https://serpapi.com/)

### ** Frontend Configuration**

1. Update the API endpoint in `my-app/src/lib/api.ts`:

   ```typescript
   // For development on physical device, use your computer's IP
   export const SERVER = "http://YOUR_IP_ADDRESS:3001";
   
   // For emulator, use localhost
   export const SERVER = "http://localhost:3001";
   ```

2. Find your IP address:
   - **Windows**: Run `ipconfig` in Command Prompt
   - **Mac/Linux**: Run `ifconfig` in Terminal

---

##  Running the Application

### ** Start the Backend Server**

```bash
cd my-app/server

# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

You should see:
```
Server running on :3001
```

### ** Start the Mobile App**

In a new terminal:

```bash
cd my-app

# Start Expo development server
npm start

# Or run directly on Android
npm run android

# Or run directly on iOS
npm run ios
```

**Scan the QR code** with:
- **Android**: Expo Go app
- **iOS**: Camera app (iOS 11+)

---

##  Project Structure

```
Tax-Trail-Application/
├── my-app/                          # Mobile application root
│   ├── src/
│   │   ├── screens/                 # Application screens
│   │   │   ├── OnBoarding.tsx       # Onboarding flow
│   │   │   ├── Login.tsx            # Login screen
│   │   │   ├── Signup.tsx           # Sign up screen
│   │   │   ├── Home.tsx             # Home dashboard
│   │   │   ├── Converter.tsx        # Currency converter
│   │   │   ├── LiveRates.tsx        # Live exchange rates
│   │   │   ├── Anomaly.tsx          # AI anomaly detection
│   │   │   └── Profile.tsx          # User profile
│   │   ├── lib/
│   │   │   ├── api.ts               # API client
│   │   │   ├── appwrite.ts          # Appwrite configuration
│   │   │   ├── currency.ts          # Currency utilities
│   │   │   └── storage.ts           # Local storage
│   │   ├── store/
│   │   │   └── useAuth.ts           # Authentication state (Zustand)
│   │   ├── assets/                  # Images and icons
│   │   └── types/                   # TypeScript types
│   ├── components/
│   │   ├── ui/                      # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Chip.tsx
│   │   │   ├── RatePill.tsx
│   │   │   ├── SkeletonRow.tsx
│   │   │   └── StatRow.tsx
│   │   └── QuickCurrencyPicker.tsx
│   ├── server/                      # Backend server
│   │   ├── src/
│   │   │   ├── agents/
│   │   │   │   ├── agent.ts         # LangChain AI agent
│   │   │   │   └── tools.ts         # AI tools and prompts
│   │   │   ├── routes/
│   │   │   │   ├── taxes.ts         # Tax endpoints with AI
│   │   │   │   └── fx.ts            # Exchange rate endpoints
│   │   │   ├── config/
│   │   │   │   ├── appwrite.ts      # Appwrite setup
│   │   │   │   └── env.ts           # Environment variables
│   │   │   ├── llm/
│   │   │   │   └── langchain.ts     # LangChain configuration
│   │   │   ├── middleware/
│   │   │   │   └── admin.ts         # Admin middleware
│   │   │   ├── utils/
│   │   │   │   ├── concurrency.ts   # Rate limiting
│   │   │   │   └── fx.ts            # FX utilities
│   │   │   └── index.ts             # Server entry point
│   │   └── package.json
│   ├── App.tsx                      # App entry point
│   ├── app.json                     # Expo configuration
│   └── package.json
├── README.md                        # This file
└── LICENSE                          # License information
```

---

##  Testing

### **Testing AI Features**

1. Navigate to **Anomaly Viewer** tab in the app
2. Load or create tax data
3. Tap **"AI Insights"** (pink card with brain icon )
4. Wait 5-10 seconds for AI analysis
5. Review comprehensive insights and recommendations

### **Testing Currency Converter**

1. Navigate to **Converter** tab
2. Select source and target currencies
3. Enter amount
4. View real-time conversion
5. Check live rate changes

---

##  Troubleshooting

### **Common Issues**

| Issue | Solution |
|-------|----------|
| **"AI Analysis Failed - 400"** | Missing or invalid Groq API key. Check `.env` file and restart server |
| **"Network Error"** | Backend not running or wrong IP address in `api.ts` |
| **"Port 3001 already in use"** | Kill the process or change PORT in `.env` |
| **App won't connect to server** | Use your computer's IP address instead of localhost for physical devices |
| **"GROQ_API_KEY is not configured"** | Add API key to `my-app/server/.env` and restart |

### **Detailed Troubleshooting**

For comprehensive AI setup and troubleshooting, see: [`my-app/server/AI_SETUP_GUIDE.md`](./my-app/server/AI_SETUP_GUIDE.md)

---

##  Features in Detail

### **Currency Converter**
- Support for 150+ global currencies
- Real-time exchange rates via API
- Historical rate tracking
- Quick currency picker for favorites
- Visual rate change indicators

### **Anomaly Detection**
- Statistical anomaly detection (mean + deviation threshold)
- AI-powered contextual analysis
- Visual highlighting of outliers
- Yearly data comparison
- Category-based filtering

### **AI Insights**
- **WHY Analysis**: Understand causes of anomalies
- **Predictions**: Forecast next year with confidence
- **Recommendations**: Actionable steps to address issues
- **Risk Assessment**: Identify potential problems
- **Opportunity Detection**: Spot favorable trends

### **Executive Summaries**
- Professional, C-level appropriate language
- 3-4 paragraph comprehensive reports
- Business impact focus
- Strategic recommendations
- Native share functionality

---

##  API Endpoints

### **Tax Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/taxes/anomaly/ai-insights` | Get AI analysis of anomalies |
| `POST` | `/api/taxes/anomaly/summary` | Generate executive summary |

### **Exchange Rate Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/fx/rates` | Get current exchange rates |
| `POST` | `/api/fx/convert` | Convert currency amounts |

---

##  Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create your feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### **Development Guidelines**

- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

##  License

This project is licensed under the terms specified in the MIT License Copyright (c) 2025 TaxTrail Team.

---

##  Acknowledgments

- **United Nations SDGs** for inspiring this project's mission
- **Appwrite** for backend infrastructure
- **Groq** for lightning-fast AI inference
- **LangChain** for AI orchestration
- **Expo** for making React Native development seamless
- **React Navigation** for smooth navigation experience

---

##  Support

For issues, questions, or suggestions:

-  Email: pandukawijesinghe@gmail.com 
-  Issues: [GitHub Issues](https://github.com/yourusername/Tax-Trail-Application/issues)


---

##  Roadmap

### **Coming Soon**
- [ ] Budget breakdown visualization
- [ ] Prediction dashboard
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Export reports to PDF
- [ ] Push notifications for rate changes
- [ ] Offline mode support
- [ ] Advanced filtering and search

### **Future Enhancements**
- [ ] Machine learning model training on user data
- [ ] Integration with government budget APIs
- [ ] Social sharing of insights
- [ ] Community forums and discussions
- [ ] Gamification and achievements

---

##  SDG Alignment

This project directly contributes to **SDG 10: Reduced Inequalities** by:

✅ **Promoting Transparency**: Making budget data accessible to all citizens  
✅ **Empowering Citizens**: Providing tools to understand public finances  
✅ **Democratizing Information**: Free access to financial insights  
✅ **AI for Good**: Using AI to simplify complex financial data  
✅ **Mobile First**: Reaching users where they are, on their devices

---

<div align="center">

**Built with for a more transparent and equitable world**

⭐ Star this repo if you found it helpful!

</div>
