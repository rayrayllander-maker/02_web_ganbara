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
        publishState.exportedCount = 0;
        await buildSite();
        publishState.status = 'success';
        publishState.finishedAt = new Date().toISOString();
        res.json({
            status: publishState.status,
            startedAt: publishState.startedAt,
            finishedAt: publishState.finishedAt,
            exportedCount: publishState.exportedCount
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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
