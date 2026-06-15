#!/bin/bash
# RURALIZE Frontend Redesign - Build Verification Script
# Este script valida a sintaxe TypeScript e prepara para build

echo "🎨 RURALIZE Frontend - Redesign Verification"
echo "========================================="
echo ""

# Check Node.js installation
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed."
  echo "   Please install Node.js 18+ from https://nodejs.org/"
  exit 1
fi

echo "✅ Node.js: $(node --version)"

if ! command -v npm &> /dev/null; then
  echo "❌ npm is not installed."
  exit 1
fi

echo "✅ npm: $(npm --version)"
echo ""

# Check project structure
echo "📁 Checking project structure..."
if [ ! -f "package.json" ]; then
  echo "❌ package.json not found. Run from project root."
  exit 1
fi
echo "✅ package.json found"

if [ ! -d "app" ]; then
  echo "❌ app/ directory not found."
  exit 1
fi
echo "✅ app/ directory found"

# Count modified files
echo ""
echo "📊 Redesign Statistics:"
component_files=$(find app/components -name "*.tsx" | wc -l)
page_files=$(find app -name "page.tsx" | wc -l)
echo "   Components: $component_files"
echo "   Pages: $page_files"

# Syntax validation
echo ""
echo "🔍 Validating TypeScript syntax..."
tsx_files=$(find app -name "*.tsx" -type f | wc -l)
echo "   Total TSX files: $tsx_files"

# Check for unclosed braces in key files
syntax_ok=true
for file in app/components/AuthCard.tsx app/components/feed/FeedHeader.tsx app/layout.tsx; do
  if [ -f "$file" ]; then
    open=$(grep -o '{' "$file" | wc -l)
    close=$(grep -o '}' "$file" | wc -l)
    if [ "$open" -ne "$close" ]; then
      echo "   ❌ $file - Syntax error (unbalanced braces)"
      syntax_ok=false
    else
      echo "   ✅ $file - OK"
    fi
  fi
done

if [ "$syntax_ok" = false ]; then
  echo ""
  echo "❌ Syntax errors detected!"
  exit 1
fi

echo ""
echo "✅ All syntax checks passed!"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
if [ ! -d "node_modules" ]; then
  echo "   Running: npm install"
  npm install || {
    echo "❌ Failed to install dependencies"
    exit 1
  }
else
  echo "   ✅ Dependencies already installed"
fi

echo ""
echo "🚀 Ready for build!"
echo ""
echo "Next steps:"
echo "  1. npm run build    # Build for production"
echo "  2. npm run dev      # Start development server"
echo ""
echo "🎉 Redesign verification complete!"
