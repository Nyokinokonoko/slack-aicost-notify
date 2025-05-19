require("dotenv").config();

// Environment variables
const ANTHROPIC_ORGANIZATION_ID = process.env.ANTHROPIC_ORGANIZATION_ID;
const OPENAI_ADMIN_KEY = process.env.OPENAI_ADMIN_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// Check if all required environment variables are set
function checkEnvVars() {
  const requiredVars = [
    "ANTHROPIC_ORGANIZATION_ID",
    "OPENAI_ADMIN_KEY",
    "OPENROUTER_API_KEY",
    "SLACK_WEBHOOK_URL",
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error(
      `Error: Missing required environment variables: ${missingVars.join(", ")}`
    );
    process.exit(1);
  }
}

module.exports = {
  ANTHROPIC_ORGANIZATION_ID,
  OPENAI_ADMIN_KEY,
  OPENROUTER_API_KEY,
  SLACK_WEBHOOK_URL,
  checkEnvVars,
};
