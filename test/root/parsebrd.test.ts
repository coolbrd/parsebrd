import Parsebrd from "../../src/parsebrd";

describe("command parser", () => {
    let parsebrd: Parsebrd;

    beforeEach(() => {
        parsebrd = new Parsebrd();
    });

    it("should exist", () => {
        expect(parsebrd).toBeDefined();
    });
})