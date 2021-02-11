import { Client, DMChannel, Guild, Message, NewsChannel, TextChannel } from "discord.js";

jest.mock("discord.js");

export function createMockedMessage(options?: { client?: Client, data?: any, channel?: TextChannel | DMChannel | NewsChannel }): Message {
    const mockedClient = options && options.client ? options.client : new Client();

    const mockedChannel = options && options.channel ? options.channel : new TextChannel(new Guild(mockedClient, {}));

    const mockedMessage = new Message(mockedClient, {}, mockedChannel);
    (mockedMessage as any).client = mockedClient;
    mockedMessage.channel = mockedChannel;

    return mockedMessage;
}