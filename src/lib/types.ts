export interface FileEntry {
  name: string;
  path: string;
  is_directory: boolean;
  children: FileEntry[];
  modified?: number;
}

export type LayoutMode = "centered" | "columns";
