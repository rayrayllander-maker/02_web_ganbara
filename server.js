const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Google Sheets configuration
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Clicks';

// Initialize Google Sheets API client
let sheets = null;

async function initGoogleSheets() {
    try {
        // Check if credentials are provided
        if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
            console.warn('Google Sheets credentials not configured. Click tracking will be logged to console only.');
            return null;
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const authClient = await auth.getClient();
        sheets = google.sheets({ version: 'v4', auth: authClient });
        
        console.log('Google Sheets API initialized successfully');
        return sheets;
    } catch (error) {
        console.error('Error initializing Google Sheets:', error.message);
        return null;
    }
}

// Initialize sheets on startup
initGoogleSheets();

// Track click endpoint
app.post('/api/track-click', async (req, res) => {
    try {
        const { itemId, itemName, category, timestamp } = req.body;

        if (!itemId || !itemName || !category) {
            return res.status(400).json({ 
                error: 'Missing required fields: itemId, itemName, category' 
            });
        }

        const clickData = {
            itemId,
            itemName: itemName.es || itemName,
            category,
            timestamp: timestamp || new Date().toISOString(),
        };

        console.log('Click tracked:', clickData);

        // If Google Sheets is configured, append data
        if (sheets && SPREADSHEET_ID) {
            try {
                await sheets.spreadsheets.values.append({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `${SHEET_NAME}!A:D`,
                    valueInputOption: 'USER_ENTERED',
                    resource: {
                        values: [[
                            clickData.timestamp,
                            clickData.category,
                            clickData.itemId,
                            clickData.itemName,
                        ]],
                    },
                });
                console.log('Data saved to Google Sheets');
            } catch (sheetsError) {
                console.error('Error saving to Google Sheets:', sheetsError.message);
                // Continue even if sheets save fails
            }
        }

        res.json({ 
            success: true, 
            message: 'Click tracked successfully',
            data: clickData 
        });
    } catch (error) {
        console.error('Error tracking click:', error);
        res.status(500).json({ 
            error: 'Failed to track click',
            message: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        sheetsConfigured: sheets !== null && SPREADSHEET_ID !== undefined,
        timestamp: new Date().toISOString()
    });
});

// Get click statistics endpoint (optional)
app.get('/api/stats', async (req, res) => {
    try {
        if (!sheets || !SPREADSHEET_ID) {
            return res.status(503).json({ 
                error: 'Google Sheets not configured' 
            });
        }

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:D`,
        });

        const rows = response.data.values || [];
        
        // Skip header row and count clicks per item
        const stats = {};
        rows.slice(1).forEach(row => {
            const [timestamp, category, itemId, itemName] = row;
            const key = `${category}-${itemId}`;
            if (!stats[key]) {
                stats[key] = {
                    category,
                    itemId,
                    itemName,
                    clicks: 0,
                };
            }
            stats[key].clicks++;
        });

        res.json({ 
            success: true, 
            stats: Object.values(stats),
            totalClicks: rows.length - 1 
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ 
            error: 'Failed to fetch statistics',
            message: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Click tracking API available at http://localhost:${PORT}/api/track-click`);
});
