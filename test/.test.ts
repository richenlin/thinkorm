/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2020-01-07 18:14:26
 */
import { BaseModel, PrimaryColumn, IsNotEmpty, Column, Entity, TimestampColumn } from "../src/index";

@Entity()
class User extends BaseModel {
    @PrimaryColumn()
    id: number;

    @IsNotEmpty({ message: "姓名不能为空" })
    @Column(0, '', true)
    name: string;

    @TimestampColumn("_beforeAdd")
    create_time: number;

    @TimestampColumn()
    update_time: number;

    @Column(20, "desc")
    desc: string;
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
// userModel.add({ name: 'aaa' }).then((res: any) => {
userModel.where({ id: 1 }).update({ name: 'aaa', desc: null }).then((res: any) => {
    console.log(res);
}).catch((err: any) => {
    console.log(err);
});