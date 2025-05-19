require("dotenv").config();

// Import functions from their respective modules
const { checkEnvVars } = require("./src/config/env");
const { getClaudeBalance } = require("./src/services/claude");
const { getOpenAIWeeklyCost } = require("./src/services/openai");
const { getOpenRouterBalance } = require("./src/services/openrouter");
const { formatCurrency, formatOpenAICosts } = require("./src/utils/formatter");
const { sendSlackNotification } = require("./src/slack/notification");

// Parse command line arguments
const args = process.argv.slice(2);
const sendToSlack = args.includes("--send-to-slack");
const testSpecific = args.find((arg) => arg.startsWith("--test="));
const specificTest = testSpecific ? testSpecific.split("=")[1] : null;

// Helper function to log test results
function logTestResult(testName, success, data, error = null) {
  console.log("\n" + "=".repeat(50));
  if (success) {
    console.log(`✅ ${testName}: SUCCESS`);
    console.log("-".repeat(50));
    console.log("Data:", JSON.stringify(data, null, 2));
  } else {
    console.log(`❌ ${testName}: FAILED`);
    console.log("-".repeat(50));
    if (error) {
      console.log("Error:", error);
    }
    if (data) {
      console.log("Data:", JSON.stringify(data, null, 2));
    }
  }
  console.log("=".repeat(50) + "\n");
}

// Test Claude API
async function testClaudeAPI() {
  console.log("Testing Claude API...");
  // NOTE: Claude API test is temporarily disabled due to authentication issues
  // Returning mock result for now - implementation is kept in index.js for future use
  const result = {
    balance: "API temporarily unavailable",
    error: "Claude API integration temporarily disabled",
  };
  logTestResult("Claude API Test", false, result);
  return result;
}

// Test OpenAI API
async function testOpenAIAPI() {
  console.log("Testing OpenAI API...");
  try {
    const result = await getOpenAIWeeklyCost();
    const success =
      !result.error && result.costs && result.startDate && result.endDate;
    logTestResult("OpenAI API Test", success, result);
    return result;
  } catch (error) {
    logTestResult("OpenAI API Test", false, null, error.message);
    return { error: error.message };
  }
}

// Test OpenRouter API
async function testOpenRouterAPI() {
  console.log("Testing OpenRouter API...");
  try {
    const result = await getOpenRouterBalance();
    const success =
      !result.error &&
      typeof result.total === "number" &&
      typeof result.used === "number" &&
      typeof result.remaining === "number";
    logTestResult("OpenRouter API Test", success, result);
    return result;
  } catch (error) {
    logTestResult("OpenRouter API Test", false, null, error.message);
    return { error: error.message };
  }
}

// Test message formatting
function testMessageFormatting(claudeData, openaiData, openrouterData) {
  console.log("Testing message formatting...");
  try {
    // Test Claude data formatting
    const claudeFormatted = claudeData.error
      ? `Error fetching data - ${claudeData.error}`
      : formatCurrency(claudeData.balance);

    // Test OpenAI data formatting
    const openaiFormatted = formatOpenAICosts(openaiData);

    // Create a sample message object (without actually sending it)
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
            text: `*Claude Account Balance:* ${claudeFormatted}`,
          },
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: openaiFormatted,
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

    logTestResult("Message Formatting Test", true, {
      message: "Message formatted successfully",
      preview: message.blocks.map((block) =>
        block.type === "section" && block.text.type === "mrkdwn"
          ? block.text.text
          : block.type === "header"
          ? block.text.text
          : block.type
      ),
    });

    return message;
  } catch (error) {
    logTestResult("Message Formatting Test", false, null, error.message);
    return null;
  }
}

// Test sending to Slack
async function testSlackSending(claudeData, openaiData, openrouterData) {
  if (!sendToSlack) {
    console.log(
      "Skipping Slack sending test (use --send-to-slack flag to test)"
    );
    return;
  }

  console.log("Testing Slack message sending...");
  try {
    const result = await sendSlackNotification(
      claudeData,
      openaiData,
      openrouterData
    );
    logTestResult("Slack Sending Test", result, { sent: result });
    return result;
  } catch (error) {
    logTestResult("Slack Sending Test", false, null, error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  try {
    console.log("Starting API tests...");
    console.log(
      "Note: Use --test=claude|openai|openrouter to test specific APIs"
    );
    console.log("      Use --send-to-slack to test sending to Slack");

    // Check environment variables
    try {
      checkEnvVars();
    } catch (error) {
      console.error("Environment variable check failed:", error.message);
      process.exit(1);
    }

    let claudeData, openaiData, openrouterData;

    // Claude API test is skipped - API temporarily unavailable
    // Using mock data regardless of command line arguments
    claudeData = {
      balance: "API temporarily unavailable",
      error: "Claude API integration temporarily disabled",
    };

    if (!specificTest || specificTest === "openai") {
      openaiData = await testOpenAIAPI();
    } else {
      openaiData = {
        startDate: "2023-01-01",
        endDate: "2023-01-07",
        costs: {
          data: [
            { name: "gpt-4", cost: 5.25 },
            { name: "gpt-3.5-turbo", cost: 1.75 },
          ],
        },
      }; // Mock data
    }

    if (!specificTest || specificTest === "openrouter") {
      openrouterData = await testOpenRouterAPI();
    } else {
      openrouterData = { total: 10.0, used: 3.5, remaining: 6.5 }; // Mock data
    }

    // Test message formatting
    const formattedMessage = testMessageFormatting(
      claudeData,
      openaiData,
      openrouterData
    );

    // Test sending to Slack if flag is provided
    if (formattedMessage && sendToSlack) {
      await testSlackSending(claudeData, openaiData, openrouterData);
    }

    console.log("\nAll tests completed!");
  } catch (error) {
    console.error("Error running tests:", error.message);
    process.exit(1);
  }
}

// Run the tests
runTests();
