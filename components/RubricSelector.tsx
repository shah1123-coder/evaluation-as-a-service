'use client';

import { useState } from 'react';
import { RubricConfig } from '@/lib/supabase/types';

interface RubricSelectorProps {
  onRubricChange: (rubric: RubricConfig) => void;
}

const RUBRIC_TEMPLATES = [
  {
    id: 'llm-accuracy',
    name: 'LLM-based Accuracy',
    description: 'Uses GPT-4 to judge correctness on a 0-1 scale',
    config: {
      type: 'llm' as const,
      scale: '0-1' as const,
      prompt_template: `You are a strict evaluator. Rate the correctness of the model output.

Prompt: {prompt}
Expected Output: {expected_output}
Model Output: {model_output}

Score the model output on a scale of 0 to 1, where:
- 0 = Completely incorrect
- 0.5 = Partially correct
- 1 = Completely correct

Respond in JSON format: {"score": <number>, "explanation": "<text>"}`,
    },
  },
  {
    id: 'llm-quality',
    name: 'LLM-based Quality (1-5)',
    description: 'Uses GPT-4 to rate overall quality on a 1-5 scale',
    config: {
      type: 'llm' as const,
      scale: '1-5' as const,
      prompt_template: `You are an evaluator assessing the quality of model outputs.

Prompt: {prompt}
Model Output: {model_output}

Rate the quality on a scale of 1 to 5, where:
- 1 = Very poor quality
- 2 = Poor quality
- 3 = Acceptable quality
- 4 = Good quality
- 5 = Excellent quality

Respond in JSON format: {"score": <number>, "explanation": "<text>"}`,
    },
  },
  {
    id: 'bleu',
    name: 'BLEU Score',
    description: 'Automated BLEU metric (requires expected output)',
    config: {
      type: 'bleu' as const,
      metric_name: 'bleu',
    },
  },
  {
    id: 'rouge',
    name: 'ROUGE Score',
    description: 'Automated ROUGE metric (requires expected output)',
    config: {
      type: 'rouge' as const,
      metric_name: 'rouge-l',
    },
  },
  {
    id: 'similarity',
    name: 'Semantic Similarity',
    description: 'Cosine similarity using embeddings (requires expected output)',
    config: {
      type: 'similarity' as const,
    },
  },
];

export default function RubricSelector({ onRubricChange }: RubricSelectorProps) {
  const [selectedRubric, setSelectedRubric] = useState(RUBRIC_TEMPLATES[0].id);
  const [customPrompt, setCustomPrompt] = useState(RUBRIC_TEMPLATES[0].config.prompt_template || '');

  const handleRubricChange = (rubricId: string) => {
    setSelectedRubric(rubricId);
    const template = RUBRIC_TEMPLATES.find((r) => r.id === rubricId);
    if (template) {
      setCustomPrompt(template.config.prompt_template || '');
      onRubricChange(template.config);
    }
  };

  const handleCustomPromptChange = (prompt: string) => {
    setCustomPrompt(prompt);
    const template = RUBRIC_TEMPLATES.find((r) => r.id === selectedRubric);
    if (template && template.config.type === 'llm') {
      onRubricChange({
        ...template.config,
        prompt_template: prompt,
      });
    }
  };

  const selectedTemplate = RUBRIC_TEMPLATES.find((r) => r.id === selectedRubric);
  const isLLMRubric = selectedTemplate?.config.type === 'llm';

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Evaluation Rubric
        </label>
        <select
          value={selectedRubric}
          onChange={(e) => handleRubricChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {RUBRIC_TEMPLATES.map((rubric) => (
            <option key={rubric.id} value={rubric.id}>
              {rubric.name}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-gray-500">{selectedTemplate?.description}</p>
      </div>

      {isLLMRubric && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Prompt Template
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => handleCustomPromptChange(e.target.value)}
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="Enter your custom evaluation prompt..."
          />
          <p className="mt-2 text-xs text-gray-500">
            Use {'{prompt}'}, {'{expected_output}'}, and {'{model_output}'} as placeholders
          </p>
        </div>
      )}
    </div>
  );
}

