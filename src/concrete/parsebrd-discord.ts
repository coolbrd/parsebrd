import { Channel, GuildMember, User } from "discord.js";
import ParsebrdCore from "../parsebrd-core";

interface ParsebrdDiscordArgument {
    text: string,
    userId?: string,
    user?: User,
    member?: GuildMember
    channel?: Channel
}

export default class ParsebrdDiscord extends ParsebrdCore<ParsebrdDiscordArgument> {
    protected parseArgument(text: string): ParsebrdDiscordArgument {
        const pingMatch = text.match(/<@!?\d{18}?>/);
        const pureIdMatch = text.match(/^\d{18}$/);

        const hasUserId = pingMatch || pureIdMatch;

        let userId: string | undefined;
        if (hasUserId) {
            userId = (text.match(/\d{18}/) as RegExpMatchArray).pop();
        }

        const argument = {
            text: text,
            userId: userId
        };

        return argument;
    }
}