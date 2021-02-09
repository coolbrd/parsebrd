import ParsebrdCore from "../parsebrd-core";

interface ParsebrdSimpleArgument {
    text: string
}

export default class ParsebrdSimple extends ParsebrdCore<ParsebrdSimpleArgument> {
    protected parseArgument(text: string): ParsebrdSimpleArgument {
        const argument = {
            text: text
        };

        return argument;
    }
}