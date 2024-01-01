import CodeMirror from "codemirror";

CodeMirror.defineMode("zig", function () {
    var keywords = {
        const: true,
        var: true,
        extern: true,
        packed: true,
        export: true,
        pub: true,
        noalias: true,
        inline: true,
        comptime: true,
        test: true,
        fn: true,
        usingnamespace: true,
        struct: true,
        enum: true,
        union: true,
        if: true,
        else: true,
        switch: true,
        while: true,
        for: true,
        break: true,
        continue: true,
        return: true,
        defer: true,
        errdefer: true,
        as: true,
        null: true,
    };

    var isOperatorChar = /[+\-*&%=<>!?|]/;

    function tokenBase(stream, state) {
        var ch = stream.next();
        if (ch == '"') {
            state.tokenize = tokenString(ch);
            return state.tokenize(stream, state);
        }
        if (/[\d]/.test(ch)) {
            stream.eatWhile(/[\w\.]/);
            return "number";
        }
        if (/[\w_]/.test(ch)) {
            stream.eatWhile(/[\w_]/);
            var cur = stream.current();
            if (keywords.propertyIsEnumerable(cur)) {
                return "keyword";
            }
            return "variable";
        }
        if (isOperatorChar.test(ch)) {
            stream.eatWhile(isOperatorChar);
            return "operator";
        }
        if (ch == "/" && stream.eat("/")) {
            stream.skipToEnd();
            return "comment";
        }
        return null;
    }

    function tokenString(quote) {
        return function (stream, state) {
            var escaped = false,
                next,
                end = false;
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
            if (stream.eatSpace()) {
                return null;
            }
            var style = state.tokenize(stream, state);
            return style;
        },
    };
});

CodeMirror.defineMIME("text/x-zig", "zig");