export const routes = {
    "/api/share/listing": import('./pages/api/share/listing'),
    "/api/themes/styles": import('./pages/api/themes/styles'),
    "/api/bucket": import('./pages/api/bucket'),
    "/api/:entitytype/:slug*": import('./pages/api/[entitytype]/[...slug]'),
    "/api/:slug*": import('./pages/api/[...slug]'),
    // "/": import('./pages/index'),
    // "/:slug*": import('./pages/[...slug]'),
};
