export const requestLog = async (ctx, next) => {
    console.log(`Request url: ${ctx.method} ${ctx.url}`);
    await next();
};