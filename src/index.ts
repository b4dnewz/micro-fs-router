import { IncomingMessage, ServerResponse } from "http";
import { send } from "micro";
import router from "./router";

const defaultOpts = {
    ext: ["js"],
    propPrefix: "_",
};

export interface IOptions {
    ext?: string[];
    filter?: () => any;
    propPrefix?: string;
}

export default function(rootDIr: string, options: IOptions = {}) {
    const matchRoute = router(rootDIr, {
        ...defaultOpts,
        ...options,
    });

    return async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method === "OPTIONS") {
            return "OK";
        }

        const matched = await matchRoute(req);
        if (matched) {
            return matched(req, res);
        }

        send(res, 404, { error: "Route not found" });
    };
}
