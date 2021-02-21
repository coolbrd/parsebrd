import { Client, DMChannel, Guild, GuildMember, Message, NewsChannel, TextChannel, User } from "discord.js";

jest.mock("discord.js");

export function createMockedMessage(options?: { client?: Client, data?: any, guild?: Guild, channel?: TextChannel | DMChannel | NewsChannel, author?: User, member?: GuildMember }): Message {
    const mockedClient = options && options.client !== undefined ? options.client : new Client();
    const mockedGuild = options && options.guild !== undefined ? options.guild : new Guild(mockedClient, {});
    const mockedChannel = options && options.channel !== undefined ? options.channel : new TextChannel(mockedGuild);
    const mockedUser = options && options.author !== undefined ? options.author : new User(mockedClient, {});
    const mockedMember = options && options.member !== undefined ? options.member : new GuildMember(mockedClient, {}, mockedGuild);

    const mockedMessage = new Message(mockedClient, {}, mockedChannel);
    (mockedMessage as any).client = mockedClient;
    (mockedMessage as any).guild = mockedGuild;
    (mockedMessage as any).channel = mockedChannel;
    (mockedMessage as any).author = mockedUser;
    (mockedMessage as any).member = mockedMember;

    return mockedMessage;
}