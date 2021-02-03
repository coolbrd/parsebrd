import Parsebrd from "../../src/parsebrd";

describe("parsebrd initialization", () => {
    it("should properly split normal text", () => {
        const parsebrd = new Parsebrd("some command text");

        expect(parsebrd.originalText).toBe("some command text");
        expect(parsebrd.originalArguments.length).toBe(3);

        expect(parsebrd.originalArguments[0].text).toBe("some");
        expect(parsebrd.originalArguments[1].text).toBe("command");
        expect(parsebrd.originalArguments[2].text).toBe("text");
    });

    it("should properly split quoted text", () => {
        let parsebrd = new Parsebrd(`"extremely quoted" text with "lots" of "" abnormalities" and words "!`);
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

        parsebrd = new Parsebrd(`this one "starts without quoted text" but "ends with some"`);
        expect(parsebrd.originalArguments.length).toBe(5);
        expect(parsebrd.originalArguments[0].text).toBe("this");
        expect(parsebrd.originalArguments[1].text).toBe("one");
        expect(parsebrd.originalArguments[2].text).toBe("starts without quoted text");
        expect(parsebrd.originalArguments[3].text).toBe("but");
        expect(parsebrd.originalArguments[4].text).toBe("ends with some");

        parsebrd = new Parsebrd(`"just one big quote argument"`);
        expect(parsebrd.originalArguments.length).toBe(1);
        expect(parsebrd.originalArguments[0].text).toBe("just one big quote argument");

        parsebrd = new Parsebrd(`just one "quote in a weird spot`);
        expect(parsebrd.originalArguments.length).toBe(3);
        expect(parsebrd.originalArguments[0].text).toBe("just");
        expect(parsebrd.originalArguments[1].text).toBe("one");
        expect(parsebrd.originalArguments[2].text).toBe("quote in a weird spot");

        parsebrd = new Parsebrd(`"at the beginning`);
        expect(parsebrd.originalArguments.length).toBe(1);
        expect(parsebrd.originalArguments[0].text).toBe("at the beginning");

        parsebrd = new Parsebrd("");
        expect(parsebrd.originalArguments.length).toBe(0);

        parsebrd = new Parsebrd(`""`);
        expect(parsebrd.originalArguments.length).toBe(1);
        expect(parsebrd.originalArguments[0].text).toBe("");
    });

    it("should properly remove prefixes", () => {
        let parsebrd = new Parsebrd("b/hello, beasiary command!", { prefix: "b/" });
        expect(parsebrd.originalArguments[0].text.startsWith("b/")).toBe(false);

        expect(() => {
            new Parsebrd("hello, not a command!", { prefix: "b/" });
        }).toThrow();

        parsebrd = new Parsebrd(" command with prefix of a space", { prefix: " "});
        expect(parsebrd.originalArguments[0].text.startsWith(" ")).toBe(false);
    });

    it("should properly iterate arguments", () => {
        const parsebrd = new Parsebrd("a few arguments");

        expect(parsebrd.argumentsRemaining).toBe(3);
        expect(parsebrd.hasNextArgument).toBe(true);

        expect(parsebrd.nextArgument().text).toBe("a");
        expect(parsebrd.nextArgument().text).toBe("few");
        expect(parsebrd.nextArgument().text).toBe("arguments");

        expect(parsebrd.hasNextArgument).toBe(false);
        expect(() => parsebrd.nextArgument()).toThrow();
    });
});