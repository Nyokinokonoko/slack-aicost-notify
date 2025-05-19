const axios = require("axios");
const { OPENROUTER_API_KEY } = require("../config/env");

// Get OpenRouter balance information
async function getOpenRouterBalance() {
  try {
    const response = await axios.get("https://openrouter.ai/api/v1/credits", {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
    });

    const { total_credits, total_usage } = response.data.data;
    const remaining = total_credits - total_usage;

    return {
      total: total_credits,
      used: total_usage,
      remaining: remaining,
    };
  } catch (error) {
    console.error("Error fetching OpenRouter balance:", error.message);
    return {
      balance: "Error fetching data",
      error: error.message,
    };
  }
}

module.exports = {
  getOpenRouterBalance,
};
