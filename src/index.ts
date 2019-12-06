import * as Koa from 'koa';
import {resolve} from 'path';
import * as bodyParser from 'koa-bodyparser';
import {load} from './utils/decorators';

const app = new Koa();
app.use(bodyParser());

const router = load(resolve(__dirname, './controller'));

app.use(router.routes());

app.listen(3000, () => console.log('Koa server is running...'));