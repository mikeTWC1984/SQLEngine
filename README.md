# SQL Storage Engine for Cronicle

This engine is using RDBMS table, emulating key/value store. 
<<<<<<< HEAD
Target table should have primary key for "KEY" and BLOB like column to store values.
The engine is using knex package (ORM tool) as a wrapper on top of database drivers and has been tested on SQLite, MySql, Postgres, Oracle and MSSQL. So all you need to do is to install the driver of your choise.
=======
Target table should have primary key for "KEY" and BLOB like column to store values. Table name could be set via config (see below). Table will be automatically created by this plugin if not exist. Or DB admin can create it beforehand using statement like below (mysql):
```sql
create table cronicle (
 K varchar(256) PRIMARY KEY,
 V BLOB, -- use bytea type in postgres
 created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 )
```
This plugin is using knex orm as a wrapper on top of database driver. Plugin will work with SQLite, MySql and Postgres. Oracle and MSSQL won't work out of the box because those have different mechanism for upsert (a.k.a key/value store put). However knex support them, so just need some tweaking to make it work. 
>>>>>>> 8afa0f4b8fb17225dd0685eae8c0d95401019367

## How to use

```bash

# clone this repo and install dependencies
git clone https://github.com/mikeTWC1984/SQLEngine
cd SQLEngine
npm install

# install db driver
# below is the list of tested drivers for this plugin:

npm i sqlite3   # for sqlite
npm i pg        # for postgres
npm i mysql2    # for mysql
npm i oracledb  # for oracle + need install instant client separetly
npm i tedious   # for MSSQL

# now refer to SQL.js in you cronicle config.json using engine_path property (use absolute path)
# "engine_path": "/SQLEngine/SQL.js"

<<<<<<< HEAD
Here are Storage configuration examples you can use. "SQL" property is basically knex confic, you can check more details here:
https://knexjs.org/guide/#configuration-options
The only addition is table property that defines which table is used to store cronicle data.
=======
# other installation option - go to cronicle root directory, install knex and db driver you need (e.g. npm i knex sqlite3)
# in config.json specify path to SQL.js ("engine_path": "/opt/cronicle/SQL.js")

```
here are Storage configuration you can use. "SQL" property is inline with knex documentation.
>>>>>>> 8afa0f4b8fb17225dd0685eae8c0d95401019367

## Basic configuration for SQLite
```json
	"Storage": {
		"engine": "SQL",
		"engine_path": "/SQLEngine/SQL.js",
		"list_page_size": 50,
		"concurrency": 4,
		"log_event_types": {
			"get": 1,
			"put": 1,
			"head": 1,
			"delete": 1,
			"expire_set": 1
		},
		"SQL": {
			"client": "sqlite3",
			"table": "cronicle",
			"useNullAsDefault": true,
			"connection": {
				"filename": "/tmp/cronicle.db"
			}
		}
	}
```
## MySQL driver option:
```json
		"SQL": {
			"client": "mysql2",
			"table": "cronicle",
			"connection": {
				"host": "localhost",
				"user": "dbUser",
				"password": "dbPassword",
				"database": "dbName"
			}
		}
```
## Postgres driver options
```json
		"SQL": {
			"client": "pg",
			"table": "cronicle",
			"connection": {
				"host": "localhost",
				"user": "dbUser",
				"password": "dbPassword",
				"database": "dbName"
			}
		}
```
## Oracle driver options
```json
		"SQL": {
			"client": "pg",
			"table": "cronicle",
			"connection": {
                "connectString": "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost...)))",
				"user": "dbUser",
				"password": "dbPassword",
				"database": "oracleSchema"
			}
		}
```
You will also need to install instanct client. Here is an example on how to install it on Alpine (should be trivial for Ubuntu/Centos)
https://github.com/Shrinidhikulkarni7/OracleClient_Alpine/blob/master/Dockerfile

## MSSQL driver options
```json
		"SQL": {
			"client": "mssql",
			"table": "cronicle",
			"connection": {
				"host": "localhost",
				"user": "dbUser",
				"password": "dbPassword",
				"database": "dbName"
			}
		}
```

Once DB driver is installed and config is updated, just run control.sh setup as usually to init storage. Destination table will be created automatically. If you don't have permission to run DDL have your admin to create it for you. Below is a sample for mysql (should be about the same for all other DBs)

```sql
create table cronicle (
 K varchar(256) PRIMARY KEY,
 V BLOB, -- use bytea type in Postgres, varchar(MAX) for MSSQL,
 created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 )
```

To test performace/debug (without spinning up cronicle instance) you can use knex.mjs script. It will create destination table if needed and upsert or delete random records same way as SQLEngine would do. Just update db host/credentials on the dbConfigs object and install a driver you need. By default sqlite will be used (/tmp/cronicle.db database)
```bash
# usage:
 node knex.mjs   # upsert 10 (default) records into sqlite table
 node knex.mjs mysql someKey 13  # upsert "someKey/i" to mysql table 13 times
 node knex.mjs postgres someKey 15 --delete  # delete 15 "someKey/i" records from postgres table
```