export const buildCodeReviewPrompt = (code, language) => {
    return `
You are an expert senior software engineer and code reviewer.

Review the following ${language} code carefully.

Your task is to analyze the code for:

1. Bugs
2. Security vulnerabilities
3. Performance problems
4. Code quality
5. Maintainability
6. Best practices

Return the result ONLY as valid JSON.

The JSON must follow this structure:

{
  "score": 0,
  "summary": "",

  "categories": {
    "security": 0,
    "performance": 0,
    "quality": 0,
    "maintainability": 0,
    "readability": 0,
    "bestPractices": 0
  },

  "bugs": [
    {
      "title": "",
      "file": "",
      "line": 0,
      "severity": "low",
      "message": "",
      "suggestion": "",
      "originalCode": "",
      "suggestedCode": ""
    }
  ],

  "securityIssues": [
    {
      "title": "",
      "file": "",
      "line": 0,
      "severity": "low",
      "message": "",
      "suggestion": "",
      "originalCode": "",
      "suggestedCode": ""
    }
  ],

  "performanceIssues": [
    {
      "title": "",
      "file": "",
      "line": 0,
      "severity": "low",
      "message": "",
      "suggestion": "",
      "originalCode": "",
      "suggestedCode": ""
    }
  ],

  "suggestions": [],

  "improvedCode": ""
}

Severity must be one of:

"low"
"medium"
"high"
"critical"

Each category score and the overall score must be between 0 and 100. For every issue, provide a concise title and an exact code replacement when one is safe. Return a complete improvedCode version only when a safe, focused full-file improvement is possible; otherwise return the original code unchanged.

Do not include markdown.
Do not include \`\`\`json.
Return only JSON.

Language:
${language}

Code:
${code}
`;
};
