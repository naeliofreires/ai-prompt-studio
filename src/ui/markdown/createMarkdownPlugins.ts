import type { PluggableList } from "unified";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

export const remarkPlugins: PluggableList = [remarkGfm];

const sanitizeSchema = {
  ...defaultSchema,
  protocols: {
    ...defaultSchema.protocols,
    href: [...(defaultSchema.protocols?.href ?? []), "tel"],
  },
};

export const rehypePlugins: PluggableList = [[rehypeSanitize, sanitizeSchema]];
