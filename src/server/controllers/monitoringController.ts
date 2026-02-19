import type { Request, Response } from 'express';
import os from 'os';

export const monitoringEndpoint = (req: Request, res: Response) => {
  const serverInfo = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    process: {
      pid: process.pid,
      version: process.version,
      platform: process.platform,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      env: process.env.NODE_ENV,
    },
    system: {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      totalmem: os.totalmem(),
      freemem: os.freemem(),
      loadavg: os.loadavg(),
      cpus: os.cpus().length,
    },
    app: {
      name: process.env.npm_package_name || 'PayFlow API',
      version: process.env.npm_package_version || '1.0.0',
    }
  };

  res.status(200).json(serverInfo);
};