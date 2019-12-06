import * as Koa from 'koa';
import {get, post, put, prefix, validator} from '../utils/decorators';
import {requestLog} from "../middlewares/log";

const userList = [
    {name: 'Lily', age: 10},
    {name: 'Tom', age: 11},
    {name: 'June', age: 12}
];

@prefix('/passport')
class user {
    @get('/users', {middlewares: [requestLog]})
    public async list(ctx) {
        ctx.body = {status: 0, data: userList};
    }

    @get('/user', {middlewares: [requestLog]})
    @validator({
        query: {
            name: {type: 'string', required: true}
        }
    })
    public async getUserByName(ctx) {
        let filterUsers = userList.filter(user => user.name === ctx.query.name);
        if (filterUsers.length === 0) {
            ctx.body = {status: 0, data: null};
            return;
        }
        ctx.body = {status: 0, data: filterUsers[0]};
    }

    @post('/user', {middlewares: [requestLog]})
    @validator({
        body: {
            name: {type: 'string', required: true},
            age: {type: 'number', required: true}
        }
    })
    public async postUser(ctx) {
        userList.push(ctx.body);
        ctx.body = {status: 0};
    }

    @put('/user', {middlewares: [requestLog]})
    @validator({
        query: {
            targetName: {type: 'string', required: true}
        },
        body: {
            name: {type: 'string', required: true},
            age: {type: 'number', required: true}
        }
    })
    public async putUser(ctx) {
        let i = 0;
        for (; i < userList.length; i++) {
            if (userList[i].name === ctx.query.targetName) {
                userList[i] = ctx.request.body;
                break;
            }
        }
        let status = i < userList.length ? 0 : 1;
        ctx.body = {status};
    }
}