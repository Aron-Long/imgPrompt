# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Start Development Server
```bash
npm run dev
```

### Start Production Server
```bash
npm start
```

### Install Dependencies
```bash
npm install
```

### Test API Functionality
```bash
node test-api.js
```

## Architecture Overview

This is an image-to-prompt generation tool that integrates with the Coze AI workflow API. The application consists of:

### Backend (Node.js + Express)
- **Main Server**: `server/index.js` - Express server with CORS, static file serving, and error handling
- **API Routes**: `server/routes/api.js` - Handles image upload, processing, and Coze API integration
- **Key Dependencies**: express, multer (file upload), sharp (image processing), node-fetch (API calls)

### Frontend (Vanilla JavaScript)
- **Static Files**: Located in `public/` directory
- **Main Interface**: `public/index.html`
- **Styling**: `public/css/style.css`
- **Client Logic**: `public/js/app.js`

### Key API Endpoints
- `POST /api/generate-prompt` - Main endpoint for image analysis and prompt generation
- `POST /api/fetch-image` - Fetches images from URLs for processing
- `GET /api/health` - Health check endpoint

## Configuration Requirements

### Environment Variables (.env)
Required environment variables must be configured before running:

```env
COZE_API_TOKEN=your_coze_api_token_here
COZE_WORKFLOW_ID=7569042190087159859
COZE_API_URL=https://api.coze.cn/v1/workflow/run
PORT=3000
```

### Coze API Integration
- Uses Coze workflow API for AI-powered prompt generation
- Supports multiple prompt types: midjourney, stableDiffusion, flux, normal
- Implements file upload to Coze platform with fallback mechanisms
- Default workflow ID: 7569042190087159859

## Image Processing Pipeline

1. **Upload Methods**: Supports both local file upload and URL-based image fetching
2. **Validation**: Accepts only JPG/PNG formats with 5MB size limit
3. **Processing**: Uses Sharp library for automatic compression and optimization
4. **Integration**: Uploads processed images to Coze platform for analysis

## Development Notes

- Server runs on port 3000 by default
- Image uploads are stored temporarily in memory using multer
- CORS is enabled for cross-origin requests
- The application uses ES6 modules (`"type": "module"` in package.json)
- Error handling includes specific messages for different failure scenarios

## Coze API Workflow

The core functionality relies on a specific Coze workflow that:
- Accepts image data (file_id or URL)
- Takes a userQuery parameter (fixed as "请描述一下这个图片")
- Processes promptType selection (midjourney/stableDiffusion/flux/normal)
- Returns generated prompts in JSON format with data.output field