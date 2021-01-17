module.exports = {
  apps : [{
    name: "kryber-backend",
    script: "./dist/src/main.js",
    restart_delay: 3000,
    watch: ["./dist"],
    // Delay between restart
    watch_delay: 1000,
    env: {
      NODE_ENV: "production",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
};
