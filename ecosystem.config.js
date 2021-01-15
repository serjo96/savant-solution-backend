module.exports = {
  apps : [{
    name: "kryber-backend",
    script: "./src/main.js",
    env: {
      NODE_ENV: "production",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
};
