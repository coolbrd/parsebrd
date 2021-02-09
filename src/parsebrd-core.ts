import { stripIndent } from "common-tags";

interface ParsebrdCoreArgument {
    text: string
}

export default class ParsebrdCore {
    public readonly originalText: string;
    public readonly originalArguments: ParsebrdCoreArgument[];

    private readonly currentArguments: ParsebrdCoreArgument[];

    constructor(text: string, options?: { prefix?: string }) {
        this.originalText = text;

        if (options && options.prefix) {
            text = this.removePrefix(text, options.prefix);
        }

        this.originalArguments = this.textToArguments(text);
        this.currentArguments = Array.from(this.originalArguments);
    }

    private removePrefix(text: string, prefix: string): string {
        if (!text.startsWith(prefix)) {
            throw new Error(stripIndent`
                Parsebrd was given text that did not start with the indicated prefix.

                Text: ${text}
                Prefix: ${prefix}
            `);
        }

        return text.replace(prefix, "");
    }

    private splitByQuotesAndSpaces(text: string): string[] {
        const splitByQuotes = text.split(`"`);
        
        let splitByQuotesAndSpaces: string[] = [];
        for (let i = 0; i < splitByQuotes.length; i++) {
            let currentText = splitByQuotes[i].trim();

            if (i % 2 == 0) {
                splitByQuotesAndSpaces.push(...currentText.split(" "));
            }
            else {
                splitByQuotesAndSpaces.push(currentText);
            }
        }

        this.truncateEmptyStrings(splitByQuotesAndSpaces);

        return splitByQuotesAndSpaces;
    }

    private truncateEmptyStrings(elements: string[]): void {
        if (elements.length > 0 && elements[0] === "") {
            elements.shift();
        }

        if (elements.length > 0 && elements[elements.length - 1] === "") {
            elements.pop();
        }
    }

    private stringArrayToArguments(elements: string[]): ParsebrdCoreArgument[] {
        return elements.map(text => { return { text: text } });
    }

    private textToArguments(text: string): ParsebrdCoreArgument[] {
        const textArguments = this.splitByQuotesAndSpaces(text);

        return this.stringArrayToArguments(textArguments);
    }

    public get argumentsRemaining(): number {
        return this.currentArguments.length;
    }

    public get hasNextArgument(): boolean {
        if (this.argumentsRemaining > 0) {
            return true;
        }
        else {
            return false;
        }
    }

    public nextArgument(): ParsebrdCoreArgument {
        if (!this.hasNextArgument) {
            throw new Error("Parsebrd attempted to get the next argument from an array of none.");
        }

        const nextArgument = this.currentArguments.shift() as ParsebrdCoreArgument;

        return nextArgument;
    }
}