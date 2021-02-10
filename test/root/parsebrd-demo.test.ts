import ParsebrdDemo from "../../src/concrete/parsebrd-demo";

describe("ParsebrdSimple text parsing", () => {
    it("should properly split normal text", () => {
        const parsebrd = new ParsebrdDemo("some command text");

        expect(parsebrd.originalText).toBe("some command text");
        expect(parsebrd.originalArguments.length).toBe(3);

        expect(parsebrd.originalArguments[0].text).toBe("some");
        expect(parsebrd.originalArguments[1].text).toBe("command");
        expect(parsebrd.originalArguments[2].text).toBe("text");
    });

    it("should properly split quoted text", () => {
        let parsebrd = new ParsebrdDemo(`"extremely quoted" text with "lots" of "" abnormalities" and words "!`);
        expect(parsebrd.originalArguments.length).toBe(9);
        expect(parsebrd.originalArguments[0].text).toBe("extremely quoted");
        expect(parsebrd.originalArguments[1].text).toBe("text");
        expect(parsebrd.originalArguments[2].text).toBe("with");
        expect(parsebrd.originalArguments[3].text).toBe("lots");
        expect(parsebrd.originalArguments[4].text).toBe("of");
        expect(parsebrd.originalArguments[5].text).toBe("");
        expect(parsebrd.originalArguments[6].text).toBe("abnormalities");
        expect(parsebrd.originalArguments[7].text).toBe("and words");
        expect(parsebrd.originalArguments[8].text).toBe("!");

        parsebrd = new ParsebrdDemo(`this one "starts without quoted text" but "ends with some"`);
        expect(parsebrd.originalArguments.length).toBe(5);
        expect(parsebrd.originalArguments[0].text).toBe("this");
        expect(parsebrd.originalArguments[1].text).toBe("one");
        expect(parsebrd.originalArguments[2].text).toBe("starts without quoted text");
        expect(parsebrd.originalArguments[3].text).toBe("but");
        expect(parsebrd.originalArguments[4].text).toBe("ends with some");

        parsebrd = new ParsebrdDemo(`"just one big quote argument"`);
        expect(parsebrd.originalArguments.length).toBe(1);
        expect(parsebrd.originalArguments[0].text).toBe("just one big quote argument");

        parsebrd = new ParsebrdDemo(`just one "quote in a weird spot`);
        expect(parsebrd.originalArguments.length).toBe(3);
        expect(parsebrd.originalArguments[0].text).toBe("just");
        expect(parsebrd.originalArguments[1].text).toBe("one");
        expect(parsebrd.originalArguments[2].text).toBe("quote in a weird spot");

        parsebrd = new ParsebrdDemo(`"at the beginning`);
        expect(parsebrd.originalArguments.length).toBe(1);
        expect(parsebrd.originalArguments[0].text).toBe("at the beginning");

        parsebrd = new ParsebrdDemo("");
        expect(parsebrd.originalArguments.length).toBe(0);

        parsebrd = new ParsebrdDemo(`""`);
        expect(parsebrd.originalArguments.length).toBe(1);
        expect(parsebrd.originalArguments[0].text).toBe("");
    });
});

describe("ParsebrdSimple prefix treatment", () => {
    it("should properly remove prefixes", () => {
        let parsebrd = new ParsebrdDemo("b/hello, beasiary command!", { prefix: "b/" });
        expect(parsebrd.originalArguments[0].text.startsWith("b/")).toBe(false);

        expect(() => {
            new ParsebrdDemo("hello, not a command!", { prefix: "b/" });
        }).toThrow();

        parsebrd = new ParsebrdDemo(" command with prefix of a space", { prefix: " "});
        expect(parsebrd.originalArguments[0].text.startsWith(" ")).toBe(false);
    });
});

describe("ParsebrdSimple iteration behavior", () => {
    it("should properly iterate arguments", () => {
        const parsebrd = new ParsebrdDemo("a few arguments");

        expect(parsebrd.argumentsRemaining).toBe(3);
        expect(parsebrd.hasNextArgument).toBe(true);

        expect(parsebrd.nextArgument().text).toBe("a");
        expect(parsebrd.nextArgument().text).toBe("few");
        expect(parsebrd.nextArgument().text).toBe("arguments");

        expect(parsebrd.hasNextArgument).toBe(false);
        expect(() => parsebrd.nextArgument()).toThrow();
    });
});

describe("ParsebrdSimple load behavior", () => {
    it("should load all arguments", async () => {
        const parsebrd = new ParsebrdDemo("one two three");

        expect(parsebrd.originalArguments.some(argument => argument.loaded)).toBe(false);

        await parsebrd.load();

        expect(parsebrd.originalArguments.every(argument => argument.loaded)).toBe(true);
    });

    it("should throw errors when necessary", async () => {
        let parsebrd = new ParsebrdDemo("one two throw");
        await expect(parsebrd.load()).rejects.toThrow();
        expect(parsebrd.originalArguments[0].loaded).toBe(true);
        expect(parsebrd.originalArguments[2].loaded).toBe(false);

        parsebrd = new ParsebrdDemo("one two three");
        await expect(parsebrd.load()).resolves.not.toThrow();
        expect(parsebrd.originalArguments.every(argument => argument.loaded)).toBe(true);
    });
});