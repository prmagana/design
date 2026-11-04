// Shape of data/system.json, written by scripts/scan.mjs before every build.
export type Use = { repo: string; count: number };

export type System = {
  scannedAt: string;
  repos: { name: string; sha: string; files: number }[];
  icons: {
    lucide: { name: string; uses: Use[] }[];
    inline: { repo: string; file: string }[];
  };
  colors: {
    tokens: { name: string; repos: { repo: string; light: string; dark: string | null; count: number }[] }[];
    palette: { class: string; value: string; uses: Use[] }[];
    literals: { value: string; uses: Use[] }[];
  };
};
