#!/bin/bash

# Export script for AI-Powered SaleGuru CRM
# This script helps prepare the project for different deployment methods

set -e

echo "🚀 AI-Powered SaleGuru CRM Export Script"
echo "========================================"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to create production build
create_build() {
    echo "📦 Creating production build..."
    
    # Clean previous build
    if [ -d "dist" ]; then
        rm -rf dist
        echo "🧹 Cleaned previous build"
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "📥 Installing dependencies..."
        npm install
    fi
    
    # Create production build
    npm run build
    
    if [ -d "dist" ]; then
        echo "✅ Production build created successfully!"
        echo "📁 Build location: ./dist"
    else
        echo "❌ Build failed!"
        exit 1
    fi
}

# Function to create deployment package
create_deployment_package() {
    echo "📦 Creating deployment package..."
    
    PACKAGE_NAME="saleguru-crm-$(date +%Y%m%d-%H%M%S)"
    
    # Create package directory
    mkdir -p "$PACKAGE_NAME"
    
    # Copy essential files
    cp -r dist "$PACKAGE_NAME/"
    cp package.json "$PACKAGE_NAME/"
    cp package-lock.json "$PACKAGE_NAME/"
    cp README.md "$PACKAGE_NAME/"
    cp DEPLOYMENT.md "$PACKAGE_NAME/"
    cp DEPLOYMENT_CHECKLIST.md "$PACKAGE_NAME/"
    cp .env.example "$PACKAGE_NAME/"
    
    # Copy deployment configs
    if [ -f "vercel.json" ]; then
        cp vercel.json "$PACKAGE_NAME/"
    fi
    if [ -f "netlify.toml" ]; then
        cp netlify.toml "$PACKAGE_NAME/"
    fi
    if [ -f "Dockerfile" ]; then
        cp Dockerfile "$PACKAGE_NAME/"
    fi
    if [ -f "docker-compose.yml" ]; then
        cp docker-compose.yml "$PACKAGE_NAME/"
    fi
    if [ -f "nginx.conf" ]; then
        cp nginx.conf "$PACKAGE_NAME/"
    fi
    
    # Create zip file
    zip -r "$PACKAGE_NAME.zip" "$PACKAGE_NAME"
    
    # Clean up
    rm -rf "$PACKAGE_NAME"
    
    echo "✅ Deployment package created: $PACKAGE_NAME.zip"
}

# Function to create Docker image
create_docker_image() {
    if ! command_exists docker; then
        echo "❌ Docker is not installed. Please install Docker first."
        return 1
    fi
    
    echo "🐳 Creating Docker image..."
    
    # Build Docker image
    docker build -t saleguru-crm:latest .
    
    echo "✅ Docker image created: saleguru-crm:latest"
    echo "📋 To run the container:"
    echo "   docker run -p 80:80 saleguru-crm:latest"
}

# Function to prepare for Vercel
prepare_vercel() {
    echo "⚡ Preparing for Vercel deployment..."
    
    if ! command_exists vercel; then
        echo "📥 Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    echo "✅ Vercel CLI ready!"
    echo "📋 To deploy:"
    echo "   vercel"
}

# Function to prepare for Netlify
prepare_netlify() {
    echo "🌐 Preparing for Netlify deployment..."
    
    if ! command_exists netlify; then
        echo "📥 Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    echo "✅ Netlify CLI ready!"
    echo "📋 To deploy:"
    echo "   netlify deploy --prod --dir=dist"
}

# Function to create source code archive
create_source_archive() {
    echo "📦 Creating source code archive..."
    
    SOURCE_NAME="saleguru-crm-source-$(date +%Y%m%d-%H%M%S)"
    
    # Create archive excluding unnecessary files
    tar --exclude='node_modules' \
        --exclude='dist' \
        --exclude='.git' \
        --exclude='.env' \
        --exclude='*.log' \
        --exclude='.DS_Store' \
        -czf "$SOURCE_NAME.tar.gz" .
    
    echo "✅ Source code archive created: $SOURCE_NAME.tar.gz"
}

# Main menu
show_menu() {
    echo ""
    echo "Choose an export option:"
    echo "1) Create production build only"
    echo "2) Create deployment package (ZIP)"
    echo "3) Create Docker image"
    echo "4) Prepare for Vercel deployment"
    echo "5) Prepare for Netlify deployment"
    echo "6) Create source code archive"
    echo "7) Export everything"
    echo "8) Exit"
    echo ""
    read -p "Enter your choice (1-8): " choice
}

# Main execution
main() {
    case $choice in
        1)
            create_build
            ;;
        2)
            create_build
            create_deployment_package
            ;;
        3)
            create_build
            create_docker_image
            ;;
        4)
            create_build
            prepare_vercel
            ;;
        5)
            create_build
            prepare_netlify
            ;;
        6)
            create_source_archive
            ;;
        7)
            create_build
            create_deployment_package
            create_docker_image
            prepare_vercel
            prepare_netlify
            create_source_archive
            ;;
        8)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid choice. Please try again."
            show_menu
            ;;
    esac
}

# Check if Node.js is installed
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Show menu and execute
show_menu
main

echo ""
echo "🎉 Export completed successfully!"
echo "📋 Next steps:"
echo "   1. Configure your environment variables"
echo "   2. Set up your Supabase project"
echo "   3. Deploy using your chosen method"
echo "   4. Follow the deployment checklist" 