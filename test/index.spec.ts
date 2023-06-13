import { hello } from "../src";

test("hello", () => {
  expect(hello("foo")).toEqual("Hello foo");
});
