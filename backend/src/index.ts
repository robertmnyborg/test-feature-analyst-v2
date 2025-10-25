/**
 * Feature Analyst V2 - Backend API Server
 *
 * Express + TypeScript backend serving REST API for
 * multifamily unit feature comparison and analysis.
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import communitiesRouter from './routes/communities';
import unitsRouter from './routes/units';
import featuresRouter from './routes/features';
import msaRouter from './routes/msa';
import exportRouter from './routes/export';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app: Application = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================================================
// Middleware
// ============================================================================

// Security headers
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// Request compression
app.use(compression() as any);

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
const morganFormat = NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(morgan(morganFormat));

// ============================================================================
// Routes
// ============================================================================

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: '2.0.0',
  });
});

// API routes
app.use('/api/communities', communitiesRouter);
app.use('/api/units', unitsRouter);
app.use('/api/features', featuresRouter);
app.use('/api/msa', msaRouter);
app.use('/api/export', exportRouter);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================================================
// Server Startup
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 Feature Analyst V2 Backend Server`);
  console.log(`📡 Environment: ${NODE_ENV}`);
  console.log(`🌍 Server running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API base: http://localhost:${PORT}/api`);
});

export default app;
