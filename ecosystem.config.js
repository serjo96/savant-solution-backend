module.exports = {
  apps : [{
    name: "kryber-backend",
    script: "./dist/src/main.js",
    restart_delay: 3000,
    // Delay between restart
    env: {
      NODE_ENV: "production",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
};
