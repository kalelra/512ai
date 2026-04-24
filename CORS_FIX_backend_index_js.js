// CORS FIX — Replace the existing CORS middleware in src/index.js
// 
// FIND the current CORS setup (likely something like):
//   app.use(cors());
//   -- OR --
//   app.use(cors({ origin: true }));
//   -- OR --
//   app.use(cors({ origin: process.env.ALLOWED_ORIGINS }));
//
// REPLACE WITH:

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// Fallback if env var is empty or missing
if (allowedOrigins.length === 0) {
  allowedOrigins.push('https://512ai.co', 'https://www.512ai.co');
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, server-to-server, health checks)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, origin);
    }
    
    // Reject unknown origins
    return callback(new Error('CORS: origin not allowed'), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Tenant-ID'],
  credentials: true,
  maxAge: 86400
}));

// ──────────────────────────────────────────────────
// ALSO UPDATE the ALLOWED_ORIGINS env var in Railway to:
// https://512ai.co,https://www.512ai.co,https://bighatlawn.com,https://www.bighatlawn.com,http://localhost:3512,http://localhost:8888
// ──────────────────────────────────────────────────
