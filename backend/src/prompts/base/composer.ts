/**
 * Sistema de composición de prompts
 * Permite combinar prompts base con personalizaciones específicas
 */

export interface PromptComponents {
  role?: string;
  instructions?: string;
  feedbackStructure?: string;
  guidelines?: string;
  context?: string;
  userContent?: string;
}

export const composePrompt = (components: PromptComponents): string => {
  const parts: string[] = [];

  if (components.role) {
    parts.push(components.role);
    parts.push('');
  }

  if (components.instructions) {
    parts.push(components.instructions);
    parts.push('');
  }

  if (components.feedbackStructure) {
    parts.push(components.feedbackStructure);
    parts.push('');
  }

  if (components.guidelines) {
    parts.push(components.guidelines);
    parts.push('');
  }

  if (components.context) {
    parts.push(components.context);
    parts.push('');
  }

  if (components.userContent) {
    parts.push(components.userContent);
  }

  return parts.join('\n').trim();
};

export const composeSystemPrompt = (
  role: string,
  instructions: string,
  feedbackStructure?: string,
  guidelines?: string,
): string => {
  return composePrompt({
    role,
    instructions,
    feedbackStructure,
    guidelines,
  });
};

export const composeUserPrompt = (
  context: string,
  userContent: string,
): string => {
  return composePrompt({
    context,
    userContent,
  });
};

