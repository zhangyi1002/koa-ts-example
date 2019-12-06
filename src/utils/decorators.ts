import * as path from 'path';
import * as glob from 'glob';
import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import Schema from 'async-validator';

type HttpMethod = 'get' | 'post' | 'put' | 'delete';
type RouteOptions = {
    middlewares?: Array<Koa.middlewares>
};
const router = new KoaRouter();

const decorate = (method: HttpMethod, path: string, options: RouteOptions = {}, router: KoaRouter) => {
    return (target, property) => {
        process.nextTick(() => {
            let url = target.prefix ? target.prefix + path : path;
            let middlewares = options.middlewares || [];
            if (target.middlewares[property]) {
                middlewares = middlewares.concat(target.middlewares[property]);
            }
            middlewares.push(target[property]);
            router[method](url, ...middlewares);
        });
    };
};

const method = method => (path: string, options: RouteOptions) => decorate(method, path, options, router);
export const get = method('get');
export const post = method('post');
export const put = method('put');

export const prefix = prefix => {
    return target => {
        target.prototype.prefix = prefix;
    }
};

export const validator = rule => {
    return (target, property) => {
        let validatorMw = (ctx, next) => {
            let validPromises = [];
            if (rule.query) {
                let queryValidator = new Schema(rule.query);
                validPromises.push(queryValidator.validate({...ctx.query}))
            }
            if (rule.body) {
                let bodyValidator = new Schema(rule.body);
                validPromises.push(bodyValidator.validate({...ctx.request.body}));
            }
            Promise.all(validPromises)
                .then(() => next())
                .catch(({errors}) => ctx.body = {status: 1, errors});
        };
        // 将校验函数放入中间件
        target.middlewares && target.middlewares[property]
            ? target.middlewares[property].push(validatorMw)
            : target.middlewares ? target.middlewares[property] = [validatorMw]
            : target.middlewares = {[property]: [validatorMw]};
    };
};

export const load = (directory: string): KoaRouter => {
    const extname = '.{js,ts}';
    glob.sync(path.join(directory, `./**/*${extname}`)).forEach(item => {
        require(item);
    });
    return router;
};
