import type { PluggableList } from "unified";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

export const remarkPlugins: PluggableList = [remarkGfm];

export const rehypePlugins: PluggableList = [rehypeSanitize];
