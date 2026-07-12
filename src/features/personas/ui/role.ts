export interface Role {
  id: string;
  title: string;
  description: string;
  source: "builtin" | "custom";
}
