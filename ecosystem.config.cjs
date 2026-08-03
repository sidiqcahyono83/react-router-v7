module.exports = {
  apps: [
    {
      name: "frontend",
      script: "bun",
      args: "run start",
      cwd: "/var/www/react-router-v7",
      env: {
        NODE_ENV: "production",
        PORT: 8081,
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
    },
  ],
};
// pm2 start ecosystem.config.js
