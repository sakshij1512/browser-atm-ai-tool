import OpenAI from 'openai';
import winston from 'winston';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

class AIAnalysisService {
  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      logger.info("OpenAI API key detected and client initialized");
    } else {
      this.openai = null;
      logger.warn("No OpenAI API key found, falling back to basic analysis");
    }
  }

  async analyzeTestResults(results) {
    if (!this.openai) {
      return this.generateBasicAnalysis(results);
    }

    try {
      const analysisPrompt = this.generatePrompt(results);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an expert QA engineer analyzing ecommerce website test results. " +
              "Always respond ONLY with valid JSON matching the required schema."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        max_tokens: 600,
        temperature: 0.2
      });

      const aiResponse = completion.choices[0].message.content.trim();

      return this.parseAIResponse(aiResponse, results);

    } catch (error) {
      logger.error('AI analysis failed, falling back to basic analysis:', error);
      return this.generateBasicAnalysis(results);
    }
  }

  generatePrompt(results) {
    const summary = {
      productPagesTotal: results.productPageTests.length,
      productPagesPassed: results.productPageTests.filter(t => t.passed).length,
      imagesTotal: results.imageValidation.length,
      imagesLoaded: results.imageValidation.filter(i => i.loaded).length,
      jsErrorsCount: results.errorDetection.jsErrors.length,
      networkErrorsCount: results.errorDetection.networkErrors.length,
      warningsCount: results.errorDetection.consoleWarnings.length
    };

    return `
Analyze the following ecommerce website test results and respond ONLY in valid JSON with this schema:

{
  "riskLevel": "low | medium | high | critical",
  "score": number (0-100),
  "recommendations": [ "string", "string", "string" ],
  "summary": "short summary under 50 words"
}

Rules:
- Risk level must be determined as:
  - "critical" if product page pass rate < 50%
  - "high" if pass rate < 70%
  - "medium" if pass rate < 85%
  - "low" otherwise
- Provide exactly 3 recommendations, each under 15 words, actionable.
- Summary must be clear and concise.

Test Results:
Product Page Tests:
- Total pages tested: ${summary.productPagesTotal}
- Pages passed: ${summary.productPagesPassed}
- Critical elements missing: ${this.getCriticalElementIssues(results.productPageTests)}

Image Loading:
- Total images: ${summary.imagesTotal}
- Successfully loaded: ${summary.imagesLoaded}
- Failed to load: ${summary.imagesTotal - summary.imagesLoaded}

Errors Detected:
- JavaScript errors: ${summary.jsErrorsCount}
- Network failures: ${summary.networkErrorsCount}
- Console warnings: ${summary.warningsCount}

Most critical JavaScript errors:
${results.errorDetection.jsErrors.slice(0, 3).map(e => `- ${e.message}`).join('\n')}
`;
  }

  getCriticalElementIssues(productPageTests) {
    const issues = [];
    productPageTests.forEach(test => {
      if (!test.elements.title.present) issues.push('Missing product titles');
      if (!test.elements.price.present) issues.push('Missing price display');
      if (!test.elements.addToCart.present) issues.push('Missing add to cart buttons');
    });
    return [...new Set(issues)].join(', ') || 'None';
  }

  parseAIResponse(response, results) {
    try {
      // Try to parse JSON strictly
      const jsonStart = response.indexOf("{");
      const jsonEnd = response.lastIndexOf("}");
      const cleanJson = response.slice(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(cleanJson);

      return {
        summary: parsed.summary || 'Analysis completed',
        recommendations: parsed.recommendations || [],
        riskLevel: parsed.riskLevel || this.calculateRiskLevel(results),
        score: parsed.score || 75
      };
    } catch (err) {
      logger.warn("⚠️ Failed to parse AI JSON, using fallback parser", err);
      return this.generateBasicAnalysis(results);
    }
  }

  calculateRiskLevel(results) {
    const failureRate = results.productPageTests ?
      1 - (results.productPageTests.filter(t => t.passed).length / results.productPageTests.length) : 0;

    if (failureRate > 0.5) return 'critical';
    if (failureRate > 0.3) return 'high';
    if (failureRate > 0.1) return 'medium';
    return 'low';
  }

  generateBasicAnalysis(results) {
    const productPagesPassed = results.productPageTests.filter(t => t.passed).length;
    const totalProductPages = results.productPageTests.length;
    const imagesLoaded = results.imageValidation.filter(i => i.loaded).length;
    const totalImages = results.imageValidation.length;

    const passRate = totalProductPages > 0 ? (productPagesPassed / totalProductPages) * 100 : 100;
    const imageSuccessRate = totalImages > 0 ? (imagesLoaded / totalImages) * 100 : 100;

    const score = Math.round((passRate + imageSuccessRate) / 2);

    const riskLevel = score > 80 ? 'low' : score > 60 ? 'medium' : score > 40 ? 'high' : 'critical';

    const recommendations = [];
    if (productPagesPassed < totalProductPages) {
      recommendations.push('Fix missing critical elements on product pages');
    }
    if (imagesLoaded < totalImages) {
      recommendations.push('Resolve image loading issues');
    }
    if (results.errorDetection.jsErrors.length > 0) {
      recommendations.push('Address JavaScript errors');
    }

    return {
      summary: `Test completed with ${score}% overall score. ${productPagesPassed}/${totalProductPages} product pages passed validation.`,
      recommendations: recommendations.slice(0, 3),
      riskLevel,
      score
    };
  }
}

export default new AIAnalysisService();
