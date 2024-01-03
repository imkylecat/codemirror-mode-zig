declare module "@imkylecat/codemirror/mode/zig/zig" {
    import { Mode } from "codemirror";

  interface ZigMode extends Mode<any> {};

  const ZigMode: ZigMode;
  export = ZigMode;
};