import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const INTERNAL_API_URL = process.env.INTERNAL_API_BASE_URL || 'http://bracket-backend:8400';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { path, ...query } = req.query;
    const apiPath = Array.isArray(path) ? path.join('/') : path || '';
    
    // Build internal backend URL
    const url = `${INTERNAL_API_URL}/${apiPath}`;
    
    // Build query string only for valid parameters
    const validQuery: Record<string, string> = {};
    Object.entries(query).forEach(([key, value]) => {
      if (typeof value === 'string') {
        validQuery[key] = value;
      }
    });
    
    const queryString = new URLSearchParams(validQuery).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    // Configure headers, copying relevant ones from original request
    const headers: Record<string, string> = {};
    
    // Copy Content-Type if exists
    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type'];
    }

    // Pass Authorization header if exists
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    // Pass other relevant headers
    if (req.headers.accept) {
      headers.Accept = req.headers.accept;
    }

    console.log(`[API Proxy] ${req.method} ${fullUrl}`);

    // Make request to internal backend
    const response = await axios({
      method: req.method as any,
      url: fullUrl,
      data: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      headers,
      timeout: 30000,
      validateStatus: () => true, // Don't throw error on 4xx/5xx codes
    });

    // Copy important response headers
    if (response.headers['content-type']) {
      res.setHeader('Content-Type', response.headers['content-type']);
    }

    // Return response
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('[API Proxy] Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({ error: 'Backend service unavailable' });
    } else if (error.code === 'ETIMEDOUT') {
      res.status(504).json({ error: 'Backend timeout' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}