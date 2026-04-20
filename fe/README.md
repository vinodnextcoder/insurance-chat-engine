# Insurance Chat Engine - Frontend

React + Vite frontend for the insurance chat and quote management system.

## Features
- Real-time chat interface with the insurance bot
- Quote calculation and management
- Responsive design
- API integration with Express backend

## Setup

### Installation
```bash
npm install
```

### Environment Configuration
Copy `.env.example` to `.env` and update the API URL:
```bash
cp .env.example .env
```

### Development
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

**Note:** The backend must be running on `http://localhost:3000`

### Production Build
```bash
npm run build
```

Output will be in the `dist` folder.

## Project Structure
```
src/
├── components/       # React components
├── services/         # API service layer
├── App.jsx          # Main app component
└── main.jsx         # Entry point
```

## API Integration
All backend API calls go through `src/services/api.js`. Configure the base URL in `.env`:
- `VITE_API_URL` - Backend API base URL (default: `http://localhost:3000/api`)

## Available Endpoints
- `POST /api/conversation/start` - Start a new conversation
- `POST /api/conversation/:id/message` - Send a message
- `GET /api/conversation/:id` - Get conversation details
- `POST /api/quote/calculate` - Calculate insurance quote
- `POST /api/quote/save` - Save a quote
- `GET /api/quote/list` - Get all quotes

## Troubleshooting

### CORS Issues
If you see CORS errors, ensure your backend has CORS enabled and the proxy in `vite.config.js` is properly configured.

### Backend Connection Failed
1. Check that the backend is running on port 3000
2. Verify the `VITE_API_URL` environment variable
3. Check network connectivity and firewall rules
