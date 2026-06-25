const path = require('path');

/** PM2 — auto-restart aura-backend on crash. Boot persistence: pm2 startup + pm2 save */
module.exports = {
  apps: [
    {
      name: 'aura-backend',
      script: 'server.js',
      cwd: path.join(__dirname),
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 5000,
      max_restarts: 100,
      min_uptime: '10s',
      merge_logs: true,
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      out_file: path.join(__dirname, 'logs', 'pm2-out.log'),
      error_file: path.join(__dirname, 'logs', 'pm2-error.log'),
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
