import { Client, User, UserManager } from "discord.js";
import ParsebrdDiscord from "../../src/concrete/parsebrd-discord";

jest.mock("discord.js");

describe("ParsebrdDiscord user id identification", () => {
    let mockedClient: Client;

    beforeEach(() => {
        jest.resetAllMocks();

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

describe("ParsebrdDiscord user loading", () => {
    let mockedClient: Client;
    let mockedUserManager: UserManager;
    let mockedUserManagerFetch: jest.SpyInstance;

    beforeEach(() => {
        mockedClient = new Client();
        mockedUserManager = new UserManager(mockedClient);
        mockedUserManagerFetch = jest.spyOn(mockedUserManager, "fetch");

        mockedClient.users = mockedUserManager;

        mockedUserManagerFetch.mockResolvedValue(new User(mockedClient, {}));
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("should attempt to load user ids", async () => {
        const parsebrd = new ParsebrdDiscord("101010101010101010", mockedClient);
        expect(mockedUserManager.fetch).not.toBeCalled();
        await parsebrd.load();
        expect(mockedUserManager.fetch).toBeCalledTimes(1);
    });

    it("should load users from ids", async () => {
        const parsebrd = new ParsebrdDiscord("101010101010101010", mockedClient);
        expect(parsebrd.originalArguments[0].user).toBeUndefined();
        await parsebrd.load();
        expect(parsebrd.originalArguments[0].user).toBeDefined();
    });

    it("should not assign users when fetch fails", async () => {
        mockedUserManagerFetch.mockImplementation(async () => { throw new Error("Test error") });

        const parsebrd = new ParsebrdDiscord("101010101010101010", mockedClient);
        const userArgument = parsebrd.originalArguments[0];
        userArgument.user = new User(mockedClient, {});
        await parsebrd.load();

        expect(userArgument.userId).toBeDefined();
        expect(userArgument.user).toBe(undefined);
    });

    it("should not attempt to fetch a user from a non-id", async () => {
        const parsebrd = new ParsebrdDiscord("no ids here", mockedClient);
        await parsebrd.load();
        expect(mockedUserManagerFetch).not.toBeCalled();
    });
});