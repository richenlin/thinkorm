[![npm version](https://badge.fury.io/js/thinkorm.svg)](https://badge.fury.io/js/thinkorm)
[![Build Status](https://travis-ci.org/thinkkoa/thinkorm.svg?branch=master)](https://travis-ci.org/thinkkoa/thinkorm)
[![Dependency Status](https://david-dm.org/thinkkoa/thinkorm.svg)](https://david-dm.org/thinkkoa/thinkorm)

## 介绍

[![Greenkeeper badge](https://badges.greenkeeper.io/thinkkoa/thinkorm.svg)](https://greenkeeper.io/)

A flexible, lightweight and powerful Object-Relational Mapper for Node.js.

ThinkORM是一个可扩展轻量级的功能丰富的对象-关系映射的数据模型封装框架，使用Node.js实现。

如同SQL语言发明一样，ThinkORM试图用一种抽象的统一操作语言，使用户专注于数据操作逻辑而非具体的数据存储类型，达到快速开发和移植的目的。

```js
let info = await model.where({id: {'<>': 1, '>=': 0}, name: 'bb', or: [{name: 'aa'}, {name: 'cc'}]}).find();
```

项目地址： [Git Repo](https://github.com/thinkkoa/thinkorm)

## 特性


1. 基于Knex.js实现,支持 Mysql, PostgresSql, MariaDB. (扩展adapter即可支持MSSQL, SQLite3, Oracle, MongoDB)

2. 抽象的面向对象式SQL操作语言,保持各种数据库书写语法一致,方便开发和项目迁移

3. 支持schema定义数据结构,支持严格的类型检查;支持数据结构迁移到数据库,通过migrate方法调用

4. 支持hasone,hasmany,manytomany关联查询,关联新增,关联更新

5. 支持left,right,inner join查询,支持count,sum,group查询

6. 支持连接池配置.支持数据链接检测以及自动重联，数据库服务的宕机修复后无需重启应用

7. 支持事务操作,包括同模型、跨模型、并行事务

8. 支持数据自动验证以及自定义规则验证,且规则可扩展

9. 支持前置、后置逻辑处理

10. 支持数据库集群,支持读写分离(mysql, postgresql)


## 扩展

* [thinkorm_adapter_mysql](https://github.com/thinkkoa/thinkorm_adapter_mysql) (√已完成)

Mysql adapter for thinkorm 2.x. 

* [thinkorm_adapter_postgresql](https://github.com/thinkkoa/thinkorm_adapter_postgresql) (√已完成)

PostgreSQL adapter for thinkorm 2.x.

* [thinkorm_adapter_mongodb](https://github.com/thinkkoa/thinkorm_adapter_mongodb) (×未完成)

MongoDB adapter for thinkorm 2.x.

* [thinkorm_adapter_sqlite3](https://github.com/thinkkoa/thinkorm_adapter_sqlite3) (×未完成)

SQLite3 adapter for thinkorm 2.x.

* [thinkorm_adapter_oracle](https://github.com/thinkkoa/thinkorm_adapter_oracle) (×未完成)

Oracle adapter for thinkorm 2.x.

* [thinkorm_adapter_mssql](https://github.com/thinkkoa/thinkorm_adapter_mssql) (×未完成)

MSSQL adapter for thinkorm 2.x.



## 安装

```bash
npm install thinkorm --save
npm install thinkorm_adapter_mysql --save
```

## 使用

```js
const thinkorm = require('thinkorm');

const config = {
    db_type: 'mysql', //support  postgresql,mysql...
    db_host: '127.0.0.1',
    db_port: 3306,
    db_name: 'test',
    db_user: 'root',
    db_pwd: '',
    db_prefix: 'think_',
    db_charset: 'utf8'
};

//thinkorm.require 入参为文件绝对路径
const User = thinkorm.require(require.resolve('../exmple/model/User'));
//加载模型类
thinkorm.setCollection(User, config);
//实例化模型
const model = new User(config);

return model.where({id: {'<>': 1, '>=': 2, '>': 0,'<': 100, '<=': 10}}).alias('test').select().then(res => {
    console.log(res);
});
```


## 计划

* SQLite3 Adapter
* Oracle Adapter
* MongoDB Adapter

## 文档

[http://www.thinkkoa.org/orm/](http://www.thinkkoa.org/orm/index.jhtml)

## 贡献者

* richenlin
* richerdlee

欢迎有MongoDB、Mongosee开发经验的同学加入,一起完善MongoDB的支持.

## 协议


MIT
