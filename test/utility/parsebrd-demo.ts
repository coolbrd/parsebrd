import ParsebrdCore, { ParsebrdCoreArgument } from "../../src/parsebrd-core";

interface ParsebrdDemoArgument extends ParsebrdCoreArgument {
    loaded: boolean
}

export default class ParsebrdDemo extends ParsebrdCore<ParsebrdDemoArgument> {
    protected parseArgument(text: string): ParsebrdDemoArgument {
        const argument = {
            text: text,
            loaded: false
        };

        return argument;
    }

    protected async loadArgument(argument: ParsebrdDemoArgument): Promise<void> {
        if (argument.text === "throw") {
            throw new Error("Throw argument encountered.");
        }

        argument.loaded = true;
    }
}