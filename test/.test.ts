/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2020-01-07 10:47:41
 */
import { validateOrReject } from "class-validator";
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

    @TimestampColumn("_beforeUpdate")
    update_time: number;
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

// validateOrReject(User, { name: "aaa" }, { skipMissingProperties: true }).catch((errors: any) => {
//     return Promise.reject(Object.values(errors[0].constraints)[0]);
// });
// console.log(JSON.stringify(userModel.fields));
userModel.add({ name: 'aaa' }).then((res: any) => {
    // userModel.where({ id: 1 }).update({ name: 'aaa' }).then((res: any) => {
    console.log(res);
}).catch((err: any) => {
    console.log(err);
});