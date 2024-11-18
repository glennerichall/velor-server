export function getAppEndpoints(router, base = '/') {
    const endpoints = [];

    function getPathFromRegex(regexp) {
        return regexp
            .toString()
            .replace('/^', '')
            .replace('?(?=\\/|$)/i', '')
            .replace(/\\\//g, '/')
            .replace('(?:/(?=$))', '');
    }

    function traverse(layer, mountPath) {
        let name, path, methods, newMountPath;
        if (layer.route) {
            // Layer represents a route
            name = layer.route.stack[0].handle.publicName;
            path = layer.route.path.substring(1);
            methods = Object.keys(layer.route.methods).map(x => x.toUpperCase());
        } else if (layer.name === 'router' || layer.name === 'fun') {
            // Layer represents a sub-router middleware
            let captureIndex = 0;
            name = layer.handle.publicName;

            path = getPathFromRegex(layer.regexp).substring(1)
                .replaceAll('?:/([^/]+?))',
                    () => ':' + layer.keys[captureIndex++].name).replace('\\/', '/');
        }

        if (name) {
            const endpoint = {
                name,
                path: mountPath + path,
                methods
            };

            // remove trailing /
            endpoint.path = endpoint.path.replace(/\/$/, "");
            endpoints.push(endpoint);
        }

        if (layer.name === 'router') {
            const newMountPath = mountPath + path;
            layer.handle.stack.forEach(subLayer => traverse(subLayer, newMountPath));
        }
    }


    router.stack.forEach(layer => traverse(layer, base));
    return endpoints;
}