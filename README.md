# SQL Storage Engine for Cronicle

This engine is using RDBMS table, emulating key/value store. 
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

## How to use

```bash

# clone this repo and install dependencies
git clone https://github.com/mikeTWC1984/SQLEngine
cd SQLEngine
npm install

# install db driver
# below is the list of tested drivers for this plugin:

npm i sqlite3  # for sqlite
npm i pg       # for postgres
npm i mysql2   # for mysql

# now refer to SQL.js in you cronicle config.json using engine_path property (use absolute path)
# "engine_path": "/SQLEngine/SQL.js"

# other installation option - go to cronicle root directory, install knex and db driver you need (e.g. npm i knex sqlite3)
# in config.json specify path to SQL.js ("engine_path": "/opt/cronicle/SQL.js")

```
here are Storage configuration you can use. "SQL" property is inline with knex documentation.

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
More details on driver configuration:
https://knexjs.org/guide/#configuration-options
