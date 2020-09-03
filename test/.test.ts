/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2020-03-23 16:34:58
 */
import { BaseModel, PrimaryColumn, IsNotEmpty, Column, Entity, TimestampColumn, RelModel } from "../src/index";

@Entity()
class Profile extends BaseModel {
    @PrimaryColumn()
    id: number;

    @Column(0, '', true)
    name = '';

    @Column(11, undefined, true, true)
    user_id: number;

    @TimestampColumn("_beforeAdd")
    create_time: number;

    @TimestampColumn()
    update_time: number;
}

@Entity()
class User extends RelModel {
    @PrimaryColumn()
    id: number;

    @IsNotEmpty({ message: "姓名不能为空" })
    @Column(0, '', true)
    realname: string;

    @TimestampColumn("_beforeAdd")
    create_time: number;

    @TimestampColumn()
    update_time: number;

    // @Relations(Profile, "HASONE", "id", "user_id")
    // profile: any;
}



const data: any = {
    id: "1",
    name: null
};

const userModel = new User({
    db_type: 'mysql',
    db_host: '192.168.0.150',
    db_port: 3306,
    db_name: 'test',
    db_user: 'test',
    db_pwd: 'test',
    db_prefix: ''
});

// console.log(JSON.stringify(userModel.fields));
// userModel.add({ realname: 'aaa', tttt: 2 }).then((res: any) => {
userModel.where({ id: 1 }).update({ realname: '' }).then((res: any) => {
    // userModel.where({ id: 1 }).rel(true).limit(100).select().then((res: any) => {
    console.log(res);
}).catch((err: any) => {
    console.log(err);
});