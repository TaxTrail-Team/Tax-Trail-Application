# 🤖 AI Features Setup Guide

Your AI-powered anomaly analysis features are not working because they require proper configuration. Follow these steps to fix them:

---

## 🔧 **Step 1: Get Groq API Key** (Required)

The AI features use **Groq** (Llama 3.3-70B) for analysis. You need a free API key:

1. Go to: https://console.groq.com/
2. Sign up for a free account
3. Navigate to **API Keys** section
4. Click "Create API Key"
5. Copy your API key (starts with `gsk_...`)

---

## 📝 **Step 2: Create .env File**

In the `my-app/server/` directory, create a file named `.env`:

```bash
# Navigate to server directory
cd my-app/server

# Create .env file (Windows)
type nul > .env

# Or on Mac/Linux
touch .env
```

---

## ⚙️ **Step 3: Add Configuration**

Open `my-app/server/.env` and add these variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# ⭐ REQUIRED: Groq API Key for AI Features
GROQ_API_KEY=gsk_your_actual_api_key_here

# Appwrite Configuration (Already configured)
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=68dcab440025ead1fabe
APPWRITE_PROJECT_NAME=TaxTrail
APPWRITE_API_KEY=your_appwrite_api_key
APPWRITE_DB_ID=taxdb
APPWRITE_TAXES_COLLECTION_ID=taxes

# Optional: SerpAPI (for Google-based exchange rates)
SERPAPI_API_KEY=your_serpapi_key_here
```

**Important:** Replace `gsk_your_actual_api_key_here` with your real Groq API key!

---

## 🔄 **Step 4: Restart Server**

After adding the API key, restart your backend server:

```bash
# Stop the current server (Ctrl+C)

# Restart it
cd my-app/server
npm run dev
```

You should see:
```
Server running on :3001
```

---

## ✅ **Step 5: Test AI Features**

1. Open your mobile app
2. Navigate to "Anomaly Viewer" tab
3. Ensure you have data loaded
4. Tap the **"AI Insights"** button (pink card with brain icon)
5. Wait 5-10 seconds for AI analysis
6. You should see comprehensive insights!

---

## 🐛 **Troubleshooting**

### Error: "AI Analysis Failed - Request failed with status code 400"

**Cause:** Missing or invalid API key

**Fix:**
1. Check your `.env` file has `GROQ_API_KEY=gsk_...`
2. Verify the key is valid (login to https://console.groq.com/)
3. Restart the server after adding the key

---

### Error: "Request failed with status code 404"

**Cause:** Backend server not running or routes not loaded

**Fix:**
1. Make sure server is running: `cd my-app/server && npm run dev`
2. Check server logs for errors
3. Verify the API endpoint is correct in `my-app/src/lib/api.ts`

---

### Error: "Network Error" or "timeout"

**Cause:** Frontend can't reach backend

**Fix:**
1. Check `my-app/src/lib/api.ts` has correct SERVER URL
2. If testing on physical device, use your machine's IP address:
   ```typescript
   export const SERVER = "http://YOUR_IP_ADDRESS:3001";
   ```
3. Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac)

---

### Server Console Shows Errors

**Check these common issues:**

1. **"GROQ_API_KEY is not configured"**
   - Add the key to `.env` file
   - Restart server

2. **"Cannot find module"**
   - Run `npm install` in server directory

3. **"Port 3001 already in use"**
   - Kill the process using port 3001
   - Or change PORT in `.env` to 3002

---

## 📊 **What the AI Features Do**

Once configured, you'll get:

### **AI Insights** (Pink button - Brain icon)
- **WHY** anomalies occurred (business context)
- **Predictions** for next year with confidence levels
- **Recommended actions** for each anomaly
- **Key findings** from the data
- **Risk identification**
- **Opportunity detection**

### **Executive Summary** (Orange button - Document icon)
- Professional 3-4 paragraph report
- C-level appropriate language
- Business impact focus
- Strategic recommendations
- Shareable via native share dialog

---

## 🔑 **API Key Limits**

**Groq Free Tier:**
- ✅ 30 requests per minute
- ✅ 6,000 tokens per minute
- ✅ More than enough for development

If you exceed limits, you'll see "Rate limit exceeded" errors. Just wait a minute and try again.

---

## 🎯 **Quick Test**

To verify everything is working:

```bash
# In my-app/server directory
npm run dev

# You should see:
# Server running on :3001

# In another terminal, test the health endpoint:
curl http://localhost:3001/health

# Should return:
# {"ok":true,"time":"2024-..."}
```

---

## 💡 **Still Not Working?**

Check the server console logs when you tap the AI buttons. You'll see detailed error messages like:

```
[/anomaly/ai-insights] Request received
Body keys: yearlyData, mean, deviationThreshold, category
[analyzeAnomaliesWithAI] Starting analysis...
[analyzeAnomaliesWithAI] Data points: 4
[analyzeAnomaliesWithAI] Invoking LLM chain...
```

Share these logs if you need help debugging!

---

## 🎉 **Success!**

Once configured, your AI features will:
- Transform raw statistics into business insights
- Provide actionable recommendations
- Predict future trends
- Identify risks and opportunities

**Your Anomaly Viewer is now a true AI financial advisor!** 🚀

