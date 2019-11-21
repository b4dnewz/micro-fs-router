import { IncomingMessage } from "http";
import { IOptions } from ".";
import { addMatch, findAsync, findRoutes, getRelativePath, isFunction, valueOrZero } from "./utils";

export default function(routesDir: string, config: IOptions) {

    const extensions = config.ext!;

    const filterFn = (isFunction(config.filter) && config.filter) || (() => true);

    const routeFn = (r: any, m: string) => r[m] || (isFunction(r) && r) || (isFunction(r.default) && r.default);

    const routes = findRoutes(routesDir, extensions)
        .filter(filterFn)
        .map((routeFile) => {
            const route = require(routeFile);
            if (!route.path) {
                route.path = getRelativePath(routesDir, routeFile);
            }
            return route;
        })
        .map(addMatch)
        .map((route) => {
            if (!route.priority && route.isIndex) {
                route.priority = -1;
            }
            return route;
        })
        // if a route exposes a `priority` property, sort the route on it.
        .sort((a, b) => valueOrZero(a.priority) < valueOrZero(b.priority) ? 1 : -1);

    return async function match(req: IncomingMessage) {
        const method = req.method!.toLowerCase();
        const found = await findAsync(routes, async (r: any) => {
            const matched = await r.match(req);
            const isValid = routeFn(r, method);
            if (matched && isValid) {
                Object.assign(req, matched);
                return true;
            }
        });
        if (!found) {
            return false;
        }
        return routeFn(found, method);
    };
}
