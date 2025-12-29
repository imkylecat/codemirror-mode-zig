import CodeMirror from "codemirror";

CodeMirror.defineMode("zig", function () {
    var keywords = {
        const: true, var: true, fn: true, pub: true, extern: true, export: true,
        packed: true, inline: true, noinline: true, comptime: true, noalias: true,
        struct: true, enum: true, union: true, opaque: true, error: true,
        if: true, else: true, switch: true, and: true, or: true, orelse: true,
        while: true, for: true, break: true, continue: true, return: true,
        defer: true, errdefer: true, async: true, await: true, suspend: true,
        resume: true, nosuspend: true, try: true, catch: true, test: true,
        usingnamespace: true, threadlocal: true, allowzero: true, volatile: true,
        align: true, callconv: true, linksection: true, addrspace: true,
        anyframe: true, asm: true, unreachable: true
    };

    var atoms = {
        true: true, false: true, null: true, undefined: true
    };

    var types = {
        i8: true, i16: true, i32: true, i64: true, i128: true, isize: true,
        u8: true, u16: true, u32: true, u64: true, u128: true, usize: true,
        f16: true, f32: true, f64: true, f80: true, f128: true,
        c_char: true, c_short: true, c_int: true, c_long: true, c_longlong: true,
        c_ushort: true, c_uint: true, c_ulong: true, c_ulonglong: true,
        c_longdouble: true, bool: true, void: true, noreturn: true, type: true,
        anyerror: true, comptime_int: true, comptime_float: true, anyopaque: true,
        anytype: true
    };

    var isOperatorChar = /[+\-*&^%=<>!|\/]/;

    function tokenBase(stream, state) {
        var ch = stream.next();

        if (ch == '"' || ch == "'") {
            state.tokenize = tokenString(ch);
            return state.tokenize(stream, state);
        }

        if (ch == "/" && stream.eat("/")) {
            stream.skipToEnd();
            return "comment";
        }

        if (ch == "@") {
            stream.eatWhile(/[\w]/);
            return "builtin";
        }

        if (/\d/.test(ch) || (ch == "." && /\d/.test(stream.peek()))) {
            if (ch == "0") {
                if (stream.eat(/[xX]/)) {
                    stream.eatWhile(/[\da-fA-F_]/);
                } else if (stream.eat(/[oO]/)) {
                    stream.eatWhile(/[0-7_]/);
                } else if (stream.eat(/[bB]/)) {
                    stream.eatWhile(/[01_]/);
                } else {
                    stream.eatWhile(/[\d_]/);
                }
            } else {
                stream.eatWhile(/[\d_]/);
            }
            if (stream.eat(".")) {
                stream.eatWhile(/[\d_]/);
            }
            if (stream.eat(/[eE]/)) {
                stream.eat(/[+\-]/);
                stream.eatWhile(/[\d_]/);
            }
            return "number";
        }

        if (/[a-zA-Z_]/.test(ch)) {
            stream.eatWhile(/[\w]/);
            var word = stream.current();
            if (keywords.hasOwnProperty(word)) return "keyword";
            if (atoms.hasOwnProperty(word)) return "atom";
            if (types.hasOwnProperty(word)) return "type";
            return "variable";
        }

        if (isOperatorChar.test(ch)) {
            stream.eatWhile(isOperatorChar);
            return "operator";
        }

        if (/[\(\)\[\]\{\}]/.test(ch)) {
            return "bracket";
        }

        return null;
    }

    function tokenString(quote) {
        return function (stream, state) {
            var escaped = false, next, end = false;
            while ((next = stream.next()) != null) {
                if (next == quote && !escaped) {
                    end = true;
                    break;
                }
                escaped = !escaped && next == "\\";
            }
            if (end || !escaped) {
                state.tokenize = tokenBase;
            }
            return "string";
        };
    }

    return {
        startState: function () {
            return { tokenize: tokenBase };
        },
        token: function (stream, state) {
            if (stream.eatSpace()) return null;
            return state.tokenize(stream, state);
        }
    };
});

CodeMirror.defineMIME("text/x-zig", "zig");