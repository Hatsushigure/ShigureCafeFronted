declare module 'marked-katex-extension' {
  import { MarkedExtension } from 'marked';
  interface KatexOptions {
    throwOnError?: boolean;
    displayMode?: boolean;
    [key: string]: any;
  }
  export default function markedKatex(options?: KatexOptions): MarkedExtension;
}
