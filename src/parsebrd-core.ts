import { stripIndent } from "common-tags";
import { inspect } from "util";

export interface ParsebrdCoreArgument {
    text: string
}

export default abstract class ParsebrdCore<ArgumentType extends ParsebrdCoreArgument> {
    public readonly originalText: string;
    public readonly originalArguments: ArgumentType[];
    public readonly prefix?: string;

    private readonly currentArguments: ArgumentType[];

    protected abstract parseArgument(text: string): ArgumentType;

    protected abstract loadArgument(argument: ArgumentType): Promise<void>;

    constructor(text: string, options?: { prefix?: string }) {
        this.originalText = text;

        if (options && options.prefix) {
            this.prefix = options.prefix;
            text = this.removePrefix(text, options.prefix);
        }

        this.originalArguments = this.textToArguments(text);
        this.currentArguments = Array.from(this.originalArguments);
    }

    public get argumentsRemaining(): number {
        return this.currentArguments.length;
    }

    public hasNextArgument(): boolean {
        return this.argumentsRemaining > 0;
    }

    public nextArgument(): ArgumentType {
        if (!this.hasNextArgument()) {
            throw new Error("Parsebrd attempted to get the next argument from an array of none.");
        }

        const nextArgument = this.currentArguments.shift() as ArgumentType;

        return nextArgument;
    }

    public get restOfText(): string {
        let rest = "";

        this.currentArguments.forEach(argument => {
            rest += argument.text + " ";
        });

        rest = rest.trim();

        return rest;
    }

    public async load(): Promise<void> {
        const loadPromises: Promise<void>[] = [];

        this.originalArguments.forEach(argument => {
            const loadPromise = this.loadArgument(argument).catch(error => {
                throw new Error(stripIndent`
                    There was an error asynchronously loading a Parsebrd argument.

                    Argument: ${inspect(argument)}

                    ${error}
                `);
            });

            loadPromises.push(loadPromise);
        });

        try {
            await Promise.all(loadPromises);
        }
        catch (error) {
            throw new Error(stripIndent`
                There was an error loading one or more Parsebrd argument.

                ${error}
            `);
        }
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

    private stringArrayToArguments(elements: string[]): ArgumentType[] {
        return elements.map(this.parseArgument.bind(this));
    }

    private textToArguments(text: string): ArgumentType[] {
        const textArguments = this.splitByQuotesAndSpaces(text);

        return this.stringArrayToArguments(textArguments);
    }
}