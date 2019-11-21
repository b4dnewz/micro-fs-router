import got from "got";
import http from "http";
import micro from "micro";
import path from "path";
import microFsRouter from "../src";

const port = 3000;
const fixtures = path.resolve(__dirname, "../__fixtures__");

describe("micro-fs-router", () => {

    let router;
    let server: http.Server;

    const endpoint = `http://localhost:${port}`;

    const instance = got.extend({
        baseUrl: endpoint,
    });

    const jsonInstance = got.extend({
        baseUrl: endpoint,
        json: true,
    });

    beforeAll(() => {
        router = microFsRouter(fixtures);
        server = micro(router);
        server.listen(port);
    });

    afterAll(() => {
        server.close();
    });

    it("should handle 404 error", async () => {
        await expect(jsonInstance.get("/undefined")).rejects.toMatchObject({
            body: {
                error: expect.any(String),
            },
        });
    });

    it("should skip if method is OPTIONS", async () => {
        const { body } = await instance("hello", { method: "OPTIONS" });
        expect(body).toEqual("OK");
    });

    it("should support default exports", async () => {
        const { body } = await instance.get("default");
        expect(body).toEqual("It works");
    });

    it("should return a string", async () => {
        const { body } = await instance.get("hello");
        expect(body).toEqual("Hello, test");
    });

    it("should support query parameters", async () => {
        const { body } = await instance.get("hello?name=foo");
        expect(body).toEqual("Hello, foo");
    });

    it("should support post body as json", async () => {
        const data = { foo: "bar" }
        const { body } = await jsonInstance.post("hello", {
            body: data,
        });
        expect(body).toEqual(data);
    });

    it("should support post body as string", async () => {
        const data = "foo";
        const { body } = await instance.post("hello", {
            body: data,
        });
        expect(body).toEqual(data);
    });

    it("should support index file in folder", async () => {
        const { body } = await jsonInstance.get("posts");
        expect(body).toEqual(["one", "two", "three"]);
    });

    it("should support params", async () => {
        const { body } = await jsonInstance.get("posts/1");
        expect(body).toEqual({ id: "1" });
    });

});
