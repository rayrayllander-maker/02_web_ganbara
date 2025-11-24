const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const { buildSite } = require('./build');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression()); // Enable gzip compression
app.use(cors());
app.use(express.json());

// Cache control middleware for static assets
app.use((req, res, next) => {
    // Set cache headers based on file type
    if (req.url.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/)) {
        // Images: cache for 1 year (they're immutable with versioning)
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (req.url.match(/\.(css|js)$/)) {
        // CSS/JS: cache for 1 week
        res.setHeader('Cache-Control', 'public, max-age=604800');
    } else if (req.url.match(/\.(json)$/)) {
        // JSON data: cache for 5 minutes
        res.setHeader('Cache-Control', 'public, max-age=300');
    } else if (req.url === '/' || req.url === '/index.html') {
        // HTML: no cache (always fetch fresh)
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }
    next();
});

// Serve static files from public directory only
app.use(express.static('public', {
    index: 'index.html',
    maxAge: 0, // Let our middleware handle caching
    etag: true,
    lastModified: true
}));

let isPublishing = false;
const publishState = {
    status: 'idle',
    startedAt: null,
    finishedAt: null,
    error: null,
    exportedCount: 0
};

// Menu data endpoint
    const menuDataPath = path.join(__dirname, 'menu-data.json');
    fs.writeFileSync(menuDataPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`Menú sincronizado desde Firestore: ${snapshot.size} documentos exportados.`);

    return { total: snapshot.size, menuDataPath };
}

app.get('/api/publish/status', (req, res) => {
    res.json(publishState);
});

app.post('/api/publish', async (req, res) => {
    if (isPublishing) {
        return res.status(409).json({
            error: 'Ya hay una publicación en curso.',
            status: publishState.status,
            startedAt: publishState.startedAt,
            finishedAt: publishState.finishedAt
        });
    }

    isPublishing = true;
    const startedAt = new Date();
    publishState.status = 'running';
    publishState.startedAt = startedAt.toISOString();
    publishState.finishedAt = null;
    publishState.error = null;
    publishState.exportedCount = 0;

    try {
        await buildSite();
        publishState.status = 'success';
        publishState.finishedAt = new Date().toISOString();
        res.json({
            status: publishState.status,
            startedAt: publishState.startedAt,
            finishedAt: publishState.finishedAt,
            exportedCount: 0
        });
    } catch (error) {
        publishState.status = 'error';
        publishState.finishedAt = new Date().toISOString();
        publishState.error = error?.message || 'No se pudo completar la publicación.';
        console.error('Error durante la publicación:', error);
        res.status(500).json({
            error: publishState.error,
            status: publishState.status,
            startedAt: publishState.startedAt,
            finishedAt: publishState.finishedAt
        });
    } finally {
        isPublishing = false;
    }
});

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
