// Format currency values
function formatCurrency(value, decimals = 2) {
  return `$${parseFloat(value).toFixed(decimals)}`;
}

// Format OpenAI cost data for Slack message
function formatOpenAICosts(openaiData) {
  if (openaiData.error) {
    return `*OpenAI Weekly API Cost:* Error fetching data - ${openaiData.error}`;
  }

  let message = `*OpenAI Weekly API Cost* (${openaiData.startDate} to ${openaiData.endDate}):\n`;

  // Handle the new response format
  if (
    openaiData.costs &&
    openaiData.costs.data &&
    openaiData.costs.data.length > 0
  ) {
    let totalCost = 0;

    // Process each bucket (day)
    openaiData.costs.data.forEach((bucket) => {
      if (bucket.results && bucket.results.length > 0) {
        bucket.results.forEach((result) => {
          if (result.amount && result.amount.value) {
            totalCost += result.amount.value;
          }
        });
      }
    });

    // Add total cost
    message += `• *Total:* ${formatCurrency(totalCost)}`;
  } else {
    message += "No usage data available for this period.";
  }

  return message;
}

module.exports = {
  formatCurrency,
  formatOpenAICosts,
};
