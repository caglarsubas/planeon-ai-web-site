import { z } from 'zod';
import { turnSchema } from '../../../lib/studio/contract';

/** The deployed sampler rejected the full bounds/regex-rich Zod grammar.
 * Use a structural subset for constrained generation; enforce every original bound afterwards.
 * This projection is a wire format, never a replacement for the application contract.
 */
export function inferenceSchema(clarify: boolean): Record<string, unknown> {
  const schema = z.toJSONSchema(
    clarify ? turnSchema.extend({ recipe: z.null() }) : turnSchema,
  );
  const project = (node: Record<string, unknown>): Record<string, unknown> => {
    const output: Record<string, unknown> = {};
    for (const key of [
      'type',
      'enum',
      'const',
      'required',
      'additionalProperties',
    ])
      if (key in node) output[key] = node[key];
    if (node.properties && typeof node.properties === 'object')
      output.properties = Object.fromEntries(
        Object.entries(node.properties).map(([key, value]) => [
          key,
          project(value as Record<string, unknown>),
        ]),
      );
    if (node.items && typeof node.items === 'object')
      output.items = project(node.items as Record<string, unknown>);
    if (Array.isArray(node.anyOf))
      output.anyOf = node.anyOf.map((value) => project(value));
    return output;
  };
  return project(schema);
}
