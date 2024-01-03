declare module "@imkylecat/codemirror-mode-zig" {
    import { Mode } from "codemirror";

    interface ZigMode extends Mode<any> {};

    const ZigMode: ZigMode;
    export = ZigMode;
};