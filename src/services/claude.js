const axios = require("axios");
const { ANTHROPIC_ORGANIZATION_ID } = require("../config/env");
const { formatCurrency } = require("../utils/formatter");

// Get Claude (Anthropic) account balance
async function getClaudeBalance() {
  try {
    // NOTE: This endpoint is currently unusable due to authentication issues
    // Keeping implementation for future reference when auth method is determined
    // const response = await axios.get(
    //   `https://console.anthropic.com/api/organizations/${ANTHROPIC_ORGANIZATION_ID}/prepaid/credits`
    // );
    // const balanceUSD = response.data.amount / 100;

    // For now, return a placeholder message
    return {
      balance: "API temporarily unavailable",
      error: "Claude API integration temporarily disabled",
    };
  } catch (error) {
    console.error("Error fetching Claude balance:", error.message);
    return {
      balance: "Error fetching data",
      error: error.message,
    };
  }
}

module.exports = {
  getClaudeBalance,
};
