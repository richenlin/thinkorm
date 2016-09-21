# 介绍

-----

[![npm version](https://badge.fury.io/js/thinkorm.svg)](https://badge.fury.io/js/thinkorm)
[![Build Status](https://travis-ci.org/richenlin/thinkorm.svg?branch=master)](https://travis-ci.org/richenlin/thinkorm)
[![Dependency Status](https://david-dm.org/richenlin/thinkorm.svg)](https://david-dm.org/richenlin/thinkorm)

A flexible, lightweight and powerful Object-Relational Mapper for Node.js.

# 特性

-----

1. 支持 Mysql, PostgresSql, MongoDB(beta) 数据库,且书写语法一致

2. 支持schema自动迁移数据结构,通过migrate方法调用

3. 支持hasone,hasmany,manytomany关联查询,关联新增,关联更新

4. 支持left,right,inner join查询(mongo暂不支持)，支持count、sum、group查询

5. 支持连接池配置。支持数据链接检测以及自动重联，数据库服务的宕机修复后无需重启应用

6. 支持事务操作(mysql, postgresql)

7. 支持数据自动验证，自定义规则验证，且规则可扩展

8. 支持 _before，_after等多种魔术方法

# 计划

-----
mongodb 完善支持;(目前mongodb支持未完善,请勿用于生产环境)

mongodb join查询

# 文档
-----

[https://www.gitbook.com/book/richenlin/thinkorm-doc/](https://www.gitbook.com/book/richenlin/thinkorm-doc/)

# 贡献者

-----

richenlin

richerdlee

# 协议

-----

MIT

