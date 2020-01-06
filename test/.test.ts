/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2020-01-06 17:33:58
 */
import { BaseModel, PrimaryColumn, IsNotEmpty, Column, Entity } from "../src/index";

@Entity()
class User extends BaseModel {
    @PrimaryColumn()
    id: number;

    @IsNotEmpty({ message: "姓名不能为空" })
    @Column(0, '', true)
    name: string;
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
userModel.add({ name: '' }).then((res: any) => {
    console.log(res);
}).catch((err: any) => {
    console.log(err);
})