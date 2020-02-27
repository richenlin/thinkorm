## 介绍

[![npm version](https://badge.fury.io/js/thinkorm.svg)](https://badge.fury.io/js/thinkorm)
[![Build Status](https://travis-ci.org/thinkkoa/thinkorm.svg?branch=master)](https://travis-ci.org/thinkkoa/thinkorm)
[![Dependency Status](https://david-dm.org/thinkkoa/thinkorm.svg)](https://david-dm.org/thinkkoa/thinkorm)

* thinkorm@4.0 Use Typescript's decorator!!

A flexible, lightweight and powerful Object-Relational Mapper for Node.js.

ThinkORM是一个可扩展轻量级的功能丰富的ORM，运行在Node.js环境，已经支持Typescript。

ThinkORM试图用一种抽象的DSL语言，尽量保持各种数据库书写语法一致，用户专注于数据操作逻辑而非具体的数据存储类型，达到快速开发和移植的目的。

## 特性

1. 支持Typescript (4.x版本)

2. 基于Knex.js实现,支持 MySQL, PostgreSQL, MariaDB, SQLite, MS SQL Server, Oracle等常见数据库. 

3. 抽象的面向对象式SQL操作语言,保持各种数据库书写语法一致,方便开发和项目迁移

4. 支持schema定义数据结构,支持严格的类型检查;支持数据结构迁移到数据库,通过migrate方法调用

5. 支持hasone,hasmany,manytomany关联查询

6. 支持left,right,inner join查询,支持count,sum,group查询

7. 支持连接池配置.支持数据链接检测以及自动重联，数据库服务的宕机修复后无需重启应用

8. 支持事务操作,包括同模型、跨模型、并行事务

9. 支持数据自动验证以及自定义规则验证,且规则可扩展

10. 支持前置、后置逻辑处理

## 安装

```bash
npm install thinkorm --save
```

## 使用

used thinkorm@4.x

```js
//class User.js
const {BaseModel, helper, Entity, PrimaryColumn, Column, IsNotEmpty } = require('thinkorm');

@Entity()
class User extends BaseModel {
    @PrimaryColumn()
    id: number;

    @IsNotEmpty({ message: "姓名不能为空" })
    @Column(0, '', true)
    name: string;
}

//CURD
const userModel = new User(config);
// add
let result = await userModel.add({"name": "张三"});

// delete
result = await userModel.where({id: 1}).delete();

// update
result = await userModel.where({id: 2}).update({"name": "李四"});

// select 
result = await userModel.where({id: 3}).find(); //limit 1
result = await userModel.where({"name": {"<>": ""}}).select(); //query name is not null

```

## 文档

[4.x cn](https://github.com/thinkkoa/thinkorm_doc)

## 贡献者

* richenlin
* richerdlee

## 协议


MIT
