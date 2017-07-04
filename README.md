# 介绍

[![npm version](https://badge.fury.io/js/thinkorm.svg)](https://badge.fury.io/js/thinkorm)
[![Build Status](https://travis-ci.org/thinkkoa/thinkorm.svg?branch=master)](https://travis-ci.org/thinkkoa/thinkorm)
[![Dependency Status](https://david-dm.org/thinkkoa/thinkorm.svg)](https://david-dm.org/thinkkoa/thinkorm)

A flexible, lightweight and powerful Object-Relational Mapper for Node.js.

ThinkORM是一个可扩展轻量级的功能丰富的对象-关系映射的数据模型封装框架，使用Node.js实现。

如同SQL语言发明一样，ThinkORM试图用一种抽象的统一操作语言，使用户专注于数据查询操作逻辑而非具体的数据存储类型，达到快速开发和移植的目的。

# 特性

1. 支持 Mysql, PostgresSql, MongoDB(beta) 数据库,且书写语法一致

2. 支持schema自动迁移数据结构,通过migrate方法调用

3. 支持hasone,hasmany,manytomany关联查询,关联新增,关联更新

4. 支持left,right,inner join查询(mongo暂不支持)，支持count、sum、group查询

5. 支持连接池配置。支持数据链接检测以及自动重联，数据库服务的宕机修复后无需重启应用

6. 支持事务操作(mysql, postgresql)

7. 支持数据自动验证，自定义规则验证，且规则可扩展

8. 支持 _before，_after等多种魔术方法

9. 支持数据库集群,支持读写分离(mysql, postgresql)

# 计划

mongodb where解析重构

mongodb 完善关联操作(Ref)

mongodb join查询

# 文档

[DOC](http://thinkkoa.org/orm/index.jhtml)

# 贡献者

richenlin

richerdlee

# 协议

MIT

