const axios = require("axios");
const { SLACK_WEBHOOK_URL } = require("../config/env");
const { formatCurrency, formatOpenAICosts } = require("../utils/formatter");

// Create and send Slack message
async function sendSlackNotification(claudeData, openaiData, openrouterData) {
  // Format timestamp in JST (Japan Standard Time)
  const date = new Date();
  const timestamp = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/, "$3-$1-$2 $4:$5:$6");

  let message = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🤖 AI Services Cost Report",
          emoji: true,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "plain_text",
            text: `Report generated at ${timestamp}`,
            emoji: true,
          },
        ],
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Claude Account Balance:* ${
            claudeData.error
              ? `Error fetching data - ${claudeData.error}`
              : formatCurrency(claudeData.balance)
          }`,
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: formatOpenAICosts(openaiData),
        },
      },
      {
        type: "divider",
      },
    ],
  };

  // Add OpenRouter data
  if (openrouterData.error) {
    message.blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*OpenRouter Balance:* Error fetching data - ${openrouterData.error}`,
      },
    });
  } else {
    message.blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*OpenRouter Balance:*\n• Total Credits: ${formatCurrency(
          openrouterData.total
        )}\n• Used: ${formatCurrency(
          openrouterData.used
        )}\n• Remaining: ${formatCurrency(openrouterData.remaining)}`,
      },
    });
  }

  try {
    await axios.post(SLACK_WEBHOOK_URL, message);
    console.log("Slack notification sent successfully!");
    return true;
  } catch (error) {
    console.error("Error sending Slack notification:", error.message);
    return false;
  }
}

module.exports = {
  sendSlackNotification,
};
