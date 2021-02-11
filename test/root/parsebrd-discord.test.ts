import { Client, Guild, GuildMember, GuildMemberManager, Message, User, UserManager } from "discord.js";
import ParsebrdDiscord from "../../src/concrete/parsebrd-discord";
import { createMockedMessage } from "../mocks/discord-mocks";

jest.mock("discord.js");

describe("ParsebrdDiscord user id identification", () => {
    let mockedClient: Client;
    let mockedMessage: Message;

    beforeEach(() => {
        mockedClient = new Client();
        mockedMessage = createMockedMessage({ client: mockedClient });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("should identify a simple user ping", () => {
        mockedMessage.content = "<@123456789123456789>";
        let parsebrd = new ParsebrdDiscord(mockedMessage, mockedClient);
        expect(parsebrd.nextArgument().userId).toBe("123456789123456789");

        mockedMessage.content = "<@!101010101010101010>";
        parsebrd = new ParsebrdDiscord(mockedMessage, mockedClient);
        expect(parsebrd.nextArgument().userId).toBe("101010101010101010");
    });

    it("should not identify ping-like things as pings", () => {
        mockedMessage.content = "<@1234>";
        let parsebrd = new ParsebrdDiscord(mockedMessage, mockedClient);
        expect(parsebrd.nextArgument().userId).toBeUndefined();

        mockedMessage.content = "<@!10101010101010101010>";
        parsebrd = new ParsebrdDiscord(mockedMessage, mockedClient);
        expect(parsebrd.nextArgument().userId).toBeUndefined();
    });

    it("should treat plain user id-like numbers as ids", () => {
        mockedMessage.content = "987654321987654321";
        let parsebrd = new ParsebrdDiscord(mockedMessage, mockedClient);
        expect(parsebrd.nextArgument().userId).toBe("987654321987654321");
    });

    it("should not treat non-id-like things as ids", () => {
        mockedMessage.content = "123456";
        let parsebrd = new ParsebrdDiscord(mockedMessage, mockedClient);
        expect(parsebrd.nextArgument().userId).toBeUndefined();

        mockedMessage.content = "10101010101010101010";
        parsebrd = new ParsebrdDiscord(mockedMessage, mockedClient);
        expect(parsebrd.nextArgument().userId).toBeUndefined();

        mockedMessage.content = "101010101o10101010";
        parsebrd = new ParsebrdDiscord(mockedMessage, mockedClient);
        expect(parsebrd.nextArgument().userId).toBeUndefined();
    });
});

describe("ParsebrdDiscord user loading", () => {
    let mockedClient: Client;
    let mockedMessage: Message;
    let mockedUserManager: UserManager;
    let mockedUserManagerFetch: jest.SpyInstance;

    beforeEach(() => {
        mockedClient = new Client();
        mockedMessage = createMockedMessage({ client: mockedClient });
        mockedUserManager = new UserManager(mockedClient);
        mockedUserManagerFetch = jest.spyOn(mockedUserManager, "fetch");

        mockedClient.users = mockedUserManager;

        mockedUserManagerFetch.mockResolvedValue(new User(mockedClient, {}));
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("should attempt to load user ids", async () => {
        mockedMessage.content = "101010101010101010";
        const parsebrd = new ParsebrdDiscord(mockedMessage, mockedClient);
        expect(mockedUserManager.fetch).not.toBeCalled();
        await parsebrd.load();
        expect(mockedUserManager.fetch).toBeCalledTimes(1);
    });

    it("should load users from ids", async () => {
        mockedMessage.content = "101010101010101010";
        const parsebrd = new ParsebrdDiscord(mockedMessage, mockedClient);
        expect(parsebrd.originalArguments[0].user).toBeUndefined();
        await parsebrd.load();
        expect(parsebrd.originalArguments[0].user).toBeDefined();
    });

    it("should not assign users when fetch fails", async () => {
        mockedUserManagerFetch.mockImplementation(async () => { throw new Error("Test error") });

        mockedMessage.content = "101010101010101010";
        const parsebrd = new ParsebrdDiscord(mockedMessage, mockedClient);
        const userArgument = parsebrd.originalArguments[0];
        userArgument.user = new User(mockedClient, {});
        await parsebrd.load();

        expect(userArgument.userId).toBeDefined();
        expect(userArgument.user).toBe(undefined);
    });

    it("should not attempt to fetch a user from a non-id", async () => {
        mockedMessage.content = "no ids here";
        const parsebrd = new ParsebrdDiscord(mockedMessage, mockedClient);
        await parsebrd.load();
        expect(mockedUserManagerFetch).not.toBeCalled();
    });
});

describe("ParsebrdDiscord member loading", () => {
    let mockedClient: Client;
    let mockedMessage: Message;
    let mockedUserManager: UserManager;
    let mockedUserManagerFetch: jest.SpyInstance;
    let mockedGuild: Guild;
    let mockedMemberManager: GuildMemberManager;
    let mockedMemberManagerFetch: jest.SpyInstance;

    beforeEach(() => {
        mockedClient = new Client();
        mockedMessage = createMockedMessage({ client: mockedClient });
        mockedUserManager = new UserManager(mockedClient);
        mockedUserManagerFetch = jest.spyOn(mockedUserManager, "fetch");
        mockedGuild = new Guild(mockedClient, {});
        mockedMemberManager = new GuildMemberManager(mockedGuild);
        mockedMemberManagerFetch = jest.spyOn(mockedMemberManager, "fetch");

        mockedClient.users = mockedUserManager;

        mockedGuild.members = mockedMemberManager;
        (mockedMessage as any).guild = mockedGuild;
        
        mockedUserManagerFetch.mockResolvedValue(new User(mockedClient, {}));
        mockedMemberManagerFetch.mockResolvedValue(new GuildMember(mockedClient, {}, mockedGuild));
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("should attempt to fetch an argument's member if it has a user", async () => {
        mockedMessage.content = "010101010101010101 notAnId 123456789123456789";
        const parsebrd = new ParsebrdDiscord(mockedMessage, mockedClient);

        await parsebrd.load();

        expect(parsebrd.nextArgument().member).toBeDefined();
        expect(parsebrd.nextArgument().member).toBeUndefined();
        expect(parsebrd.nextArgument().member).toBeDefined();
    });

    it("should not assign a member if the fetch fails", async () => {
        mockedMemberManagerFetch.mockImplementationOnce(async () => { throw new Error("Test error") });

        mockedMessage.content = "010101010101010101 notAnId 123456789123456789";
        const parsebrd = new ParsebrdDiscord(mockedMessage, mockedClient);

        await parsebrd.load();

        expect(parsebrd.nextArgument().member).toBeUndefined();
        expect(parsebrd.nextArgument().member).toBeUndefined();
        expect(parsebrd.nextArgument().member).toBeDefined();
    });
});