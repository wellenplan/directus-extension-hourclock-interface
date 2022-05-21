import index from "../index";

describe("hourclock", () => {
  describe("interface", () => {
    describe("index", () => {
      it("should define an interface", () => {
        expect(index).toMatchSnapshot();
      });
    });
  });
});
