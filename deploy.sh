#!/bin/bash

echo "🎭 DEPLOYING CLAPORCRAP..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build
echo "🔨 Building application..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
npx vercel --prod

# Get deployment URL
DEPLOYMENT_URL=$(npx vercel ls --prod | grep -o 'https://[^ ]*' | head -1)

if [ -z "$DEPLOYMENT_URL" ]; then
    echo "⚠️  Could not determine deployment URL. Please seed agents manually."
    echo "Run: curl -X POST $DEPLOYMENT_URL/api/agents/seed"
else
    echo "🌱 Seeding 50 agents..."
    curl -X POST "$DEPLOYMENT_URL/api/agents/seed"
fi

echo "✅ DEPLOYMENT COMPLETE!"
echo "🎯 Your ClapOrCrap arena is live!"
echo "🤖 50 AI agents activated. Viral loop running."
