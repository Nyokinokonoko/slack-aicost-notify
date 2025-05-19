const axios = require("axios");
const { OPENAI_ADMIN_KEY } = require("../config/env");

// Get OpenAI weekly API cost
async function getOpenAIWeeklyCost() {
  try {
    // Calculate date range for the past week
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Convert to Unix timestamp (seconds)
    const startTime = Math.floor(startDate.getTime() / 1000);
    const endTime = Math.floor(endDate.getTime() / 1000);

    // Format dates for display
    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    const response = await axios.get(
      `https://api.openai.com/v1/organization/costs?start_time=${startTime}&end_time=${endTime}`,
      {
        headers: {
          Authorization: `Bearer ${OPENAI_ADMIN_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      startDate: startDateStr,
      endDate: endDateStr,
      costs: response.data,
    };
  } catch (error) {
    console.error("Error fetching OpenAI costs:", error.message);
    return {
      costs: "Error fetching data",
      error: error.message,
    };
  }
}

module.exports = {
  getOpenAIWeeklyCost,
};
