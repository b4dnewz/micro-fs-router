import fs from "fs";
import { IncomingMessage } from "http";
import { json, text } from "micro";
import path from "path";
import qs from "querystring";

const paramPattern = /(?:_)([^\/]+)/;

export function isFunction(v: any) {
    return typeof v === "function";
}

export function valueOrZero(v: any) {
    return (typeof v === "undefined" ? 0 : v);
}

export function getRelativePath(routesDir: string, routeFile: string) {
    const extPattern = new RegExp(path.extname(routeFile) + "$");
    return "/" + path
        .relative(routesDir, routeFile)
        .replace(/\\/g, "/")
        .replace(extPattern, "");
}

export async function findAsync(arr: any[], asyncCallback: any) {
    const promises = arr.map(asyncCallback);
    const results = await Promise.all(promises);
    const index = results.findIndex((result) => result);
    return arr[index];
}

export function filterFilenames(extensions: string[]) {
    extensions = extensions.map((e) => e.replace(".", ""));
    return (f: string) => extensions.includes(
        path.extname(f).replace(".", ""),
    );
}

export function addMatch(route: any) {
    let routePath = route.path;
    const paramNames: string[] = [];
    let matched;

    // find any prefixed path and treat them as capture groups
    // tslint:disable-next-line: no-conditional-assignment
    while ((matched = routePath.match(paramPattern)) !== null) {
        routePath = routePath.replace(paramPattern, "([^?/]+)");
        paramNames.push(matched[1]);
    }

    // if a route ends with `index`, allow matching that route without matching the `index` part
    if (path.basename(routePath) === "index") {
        route.isIndex = true;
        routePath = routePath.replace(/\/index$/, "/?(_?index)?");
    }

    // create a regex with our path
    const pattern = new RegExp(`^${routePath}(\\?(.*)|$)`, "i");
    route.pattern = pattern;
    route.match = async (req: IncomingMessage) => {
        const m = req.url!.match(pattern);
        if (!m) { return; }

        const params = paramNames.reduce((o, p, idx) => {
            o[p] = m[idx + 1];
            return o;
        }, {} as any);
        const query = qs.parse(m[m.length - 1]);

        const { method, headers } = req;

        let body: any = {};

        if (method === "POST") {
            if (headers["content-type"] === "application/json") {
                body = await json(req);
            } else {
                body = await text(req);
            }
        }

        return { params, query, body };
    };

    return route;
}

// Recursively searches for files inside a directory tree and returns their full paths
export function findRoutes(dir: string, fileExtensions: string[]): string[] {
    const files = fs.readdirSync(path.resolve(dir));
    const resolve = (f: string) => path.join(dir, f);
    const routes = files.filter(filterFilenames(fileExtensions)).map(resolve);
    const dirs = files.filter((f) => fs.statSync(path.join(dir, f)).isDirectory()).map(resolve);
    return routes.concat(...dirs.map((subdir) => findRoutes(subdir, fileExtensions)));
}
