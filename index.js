// Import environment configuration
const { checkEnvVars } = require("./src/config/env");

// Import service modules
const { getClaudeBalance } = require("./src/services/claude");
const { getOpenAIWeeklyCost } = require("./src/services/openai");
const { getOpenRouterBalance } = require("./src/services/openrouter");

// Import utility modules
const { formatCurrency, formatOpenAICosts } = require("./src/utils/formatter");

// Import Slack notification module
const { sendSlackNotification } = require("./src/slack/notification");

// Main function
async function main() {
  try {
    // Check environment variables
    checkEnvVars();

    console.log("Fetching AI service cost data...");

    // Fetch data from all services in parallel
    const [claudeData, openaiData, openrouterData] = await Promise.all([
      getClaudeBalance(),
      getOpenAIWeeklyCost(),
      getOpenRouterBalance(),
    ]);

    // Send notification to Slack
    await sendSlackNotification(claudeData, openaiData, openrouterData);

    console.log("Process completed successfully!");
  } catch (error) {
    console.error("Error in main process:", error.message);
    process.exit(1);
  }
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main();
}

// Export functions for testing
module.exports = {
  getClaudeBalance,
  getOpenAIWeeklyCost,
  getOpenRouterBalance,
  formatOpenAICosts,
  sendSlackNotification,
  formatCurrency,
  checkEnvVars,
};
