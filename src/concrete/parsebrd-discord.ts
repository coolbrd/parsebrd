import { Client, GuildMember, Message, User } from "discord.js";
import ParsebrdCore from "../parsebrd-core";

interface ParsebrdDiscordArgument {
    text: string,
    userId?: string,
    user?: User,
    member?: GuildMember
}

export default class ParsebrdDiscord extends ParsebrdCore<ParsebrdDiscordArgument> {
    private readonly client: Client;

    public readonly message: Message;

    constructor(message: Message, client: Client, options?: { prefix?: string }) {
        super(message.content, options);

        this.client = client;
        this.message = message;
    }

    private extractUserId(text: string): string | undefined {
        const pingMatch = text.match(/<@!?\d{18}?>/);
        const pureIdMatch = text.match(/^\d{18}$/);

        const hasUserId = pingMatch || pureIdMatch;

        let userId: string | undefined;
        if (hasUserId) {
            userId = (text.match(/\d{18}/) as RegExpMatchArray).pop();
        }

        return userId;
    }

    protected parseArgument(text: string): ParsebrdDiscordArgument {
        const userId = this.extractUserId(text);

        const argument = {
            text: text,
            userId: userId
        };

        return argument;
    }

    private async fetchUser(userId: string): Promise<User | undefined> {
        let user: User | undefined;
        try {
            user = await this.client.users.fetch(userId);
        }
        catch {
            user = undefined;
        }
        return user;
    }

    protected async loadArgument(argument: ParsebrdDiscordArgument): Promise<void> {
        if (argument.userId) {
            argument.user = await this.fetchUser(argument.userId);
        }
    }
}