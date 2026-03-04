import { gateway } from "@ai-sdk/gateway";
import { google } from "@ai-sdk/google";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

const THINKING_SUFFIX_REGEX = /-thinking$/;

// Use AI Gateway when available, fall back to direct Google provider
const useGateway = Boolean(process.env.AI_GATEWAY_API_KEY);

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : null;

export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  const isReasoningModel =
    modelId.endsWith("-thinking") ||
    (modelId.includes("reasoning") && !modelId.includes("non-reasoning"));

  if (isReasoningModel) {
    const gatewayModelId = modelId.replace(THINKING_SUFFIX_REGEX, "");

    if (useGateway) {
      return wrapLanguageModel({
        model: gateway.languageModel(gatewayModelId),
        middleware: extractReasoningMiddleware({ tagName: "thinking" }),
      });
    }
    return wrapLanguageModel({
      model: google(gatewayModelId),
      middleware: extractReasoningMiddleware({ tagName: "thinking" }),
    });
  }

  if (useGateway) {
    return gateway.languageModel(modelId);
  }
  // Direct Google provider: strip "google/" prefix if present
  const googleModelId = modelId.replace(/^google\//, "");
  return google(googleModelId);
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }
  if (useGateway) {
    return gateway.languageModel("google/gemini-2.5-flash-lite");
  }
  return google("gemini-2.5-flash-lite");
}

export function getArtifactModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("artifact-model");
  }
  if (useGateway) {
    return gateway.languageModel("anthropic/claude-haiku-4.5");
  }
  // Fallback to Gemini when no gateway
  return google("gemini-2.5-flash");
}
