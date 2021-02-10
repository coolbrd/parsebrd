import { Client } from "discord.js";
import ParsebrdDiscord from "../../src/concrete/parsebrd-discord";

jest.mock("discord.js");

describe("ParsebrdDiscord user id identification", () => {
    let mockedClient: Client;

    beforeEach(() => {
        mockedClient = new Client();
    });

    it("should identify a simple user ping", () => {
        let parsebrd = new ParsebrdDiscord("<@123456789123456789>", mockedClient);
        expect(parsebrd.nextArgument().userId).toBe("123456789123456789");

        parsebrd = new ParsebrdDiscord("<@!101010101010101010>", mockedClient);
        expect(parsebrd.nextArgument().userId).toBe("101010101010101010");
    });

    it("should not identify ping-like things as pings", () => {
        let parsebrd = new ParsebrdDiscord("<@1234>", mockedClient);
        expect(parsebrd.nextArgument().userId).toBeUndefined();

        parsebrd = new ParsebrdDiscord("<@!10101010101010101010>", mockedClient);
        expect(parsebrd.nextArgument().userId).toBeUndefined();
    });

    it("should treat plain user id-like numbers as ids", () => {
        let parsebrd = new ParsebrdDiscord("987654321987654321", mockedClient);
        expect(parsebrd.nextArgument().userId).toBe("987654321987654321");
    });

    it("should not treat non-id-like things as ids", () => {
        let parsebrd = new ParsebrdDiscord("123456", mockedClient);
        expect(parsebrd.nextArgument().userId).toBeUndefined();

        parsebrd = new ParsebrdDiscord("10101010101010101010", mockedClient);
        expect(parsebrd.nextArgument().userId).toBeUndefined();

        parsebrd = new ParsebrdDiscord("101010101o10101010", mockedClient);
        expect(parsebrd.nextArgument().userId).toBeUndefined();
    });
});