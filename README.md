# Slack AI Cost Notification Bot

A Node.js application that sends daily notifications to a Slack channel with information about AI service costs:

- Claude (Anthropic) account remaining balance
- Weekly OpenAI API cost breakdown
- OpenRouter balance information (total, used, remaining)

The application is designed to be run as a GitHub Action on a daily schedule (8:00 AM JST).

## Features

- Fetches cost data from multiple AI service providers
- Formats the data into a readable Slack message
- Runs automatically via GitHub Actions
- Provides detailed logging

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm
- A Slack workspace with permissions to create webhooks
- API keys for the services you want to monitor

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/nyokinokonoko/slack-aicost-notify.git
   cd slack-aicost-notify
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on the example:

   ```bash
   cp .env.example .env
   ```

4. Fill in your API keys and configuration in the `.env` file:
   ```ANTHROPIC_ORGANIZATION_ID=your_organization_id_here # NOT IN USE
   OPENAI_ADMIN_KEY=your_openai_admin_key_here
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url
   ```

### Setting up GitHub Actions

1. In your GitHub repository, go to Settings > Secrets and variables > Actions
2. Add the following repository secrets:
   - `ANTHROPIC_ORGANIZATION_ID`: Your Anthropic organization ID (NOT IN USE)
   - `OPENAI_ADMIN_KEY`: Your OpenAI admin key (not regular API key)
   - `OPENROUTER_API_KEY`: Your OpenRouter API key
   - `SLACK_WEBHOOK_URL`: Your Slack webhook URL

The GitHub Action is configured to run daily at 8:00 AM JST.

## Manual Execution

To run the script manually:

```bash
npm start
```

Make sure you have set up the `.env` file with all required environment variables before running the script.

## Testing

The project includes a comprehensive test suite to verify API connections and message formatting:

```bash
# Run all tests (does NOT send Slack messages)
npm test

# Test specific APIs (does NOT send Slack messages)
npm run test:claude
npm run test:openai
npm run test:openrouter

# Test sending to Slack (WILL send an actual message)
npm run test:slack
```

The test script will:

1. Verify connections to each API
2. Check that data is properly formatted
3. Only sends a test message to Slack when explicitly requested with the `--send-to-slack` flag

This is useful to ensure your API keys are correctly configured and that the Slack webhook is working properly. By default, running `npm test` will NOT send any messages to Slack to avoid accidental notifications.

## API References

### Claude (Anthropic)

- Endpoint: `https://console.anthropic.com/api/organizations/%ORGANIZATION_ID%/prepaid/credits`
- Response format: `{"amount":495}` (amount is in cents, so 495 = $4.95 USD)

* This is an unofficial API and requires a session token. Currently not implemented in this script.
  Unauthorized usage of this endpoint may be against Anthropic's TOS, please refer to official API references.

### OpenAI

- Endpoint: `https://api.openai.com/v1/organization/costs`
- Documentation: [OpenAI API Reference](https://platform.openai.com/docs/api-reference/usage/costs)

### OpenRouter

- Endpoint: `https://openrouter.ai/api/v1/credits`
- Authorization: Bearer token
- Response format:
  ```json
  {
    "data": {
      "total_credits": 5,
      "total_usage": 2.6891028
    }
  }
  ```

## Slack Message Format

The notification is formatted using Slack's Block Kit to create a readable and visually appealing message with:

- A header with the report title
- Timestamp of when the report was generated
- Claude account balance
- OpenAI weekly cost breakdown by model
- OpenRouter balance information (total, used, remaining)

## License

MIT
