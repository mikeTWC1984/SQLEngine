
// usage
// node knex.mjs   # upsert 10 (default) records into default db (sqlite)
// node knex.mjs mysql someKey 13  # upsert to custom db 13 times
// node knex.mjs postgres someKey 15 --delete  # delete 15 records with custom prefix

import knex from 'knex'
import { randomBytes } from 'crypto'

const tableName = 'CRONICLE'
const dbtype = process.argv[2] || "sqlite"
let KEY = process.argv[3] || 'key'
let loop = Number(process.argv[4]) || 10

let value = randomBytes(16).toString('hex')

console.log(`\n ===== TESTING ${dbtype.toUpperCase()} =====\n`)

const dbConfigs = {

    // npm i sqlite
    sqlite: {
        client: 'sqlite3',
        useNullAsDefault: true,
        connection: {
            filename: '/tmp/cronicle.db'
        }
    },
    
    // npm i mysql2
    mysql: {
        client: 'mysql2',
        connection: {
            host: 'mysqlhost',
            user: 'dbUser',
            password: 'dbPassword',
            database: 'dbName'
        }
    },

    // npm i tedious
    mssql: {
        client: 'mssql',
        connection: {
            host: 'mssqlhost',
            user: 'dbUser',
            password: 'dbPassword',
            database: 'dbName'
        }
    },

    // npm i oracledb + oracle client:
    // https://github.com/Shrinidhikulkarni7/OracleClient_Alpine/blob/master/Dockerfile
    oracle: {
        client: 'oracledb',
        connection: {
            connectString: '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=oraclehost)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=cronicle)))',
            user: 'dbUser',
            password: 'dbPassword',
            database: 'oracleSchema'
        }
    },

    // npm i pg
    postgres: {
        client: 'pg',
        connection: {
            host: 'pghost',
            user: 'dbUser',
            password: 'dbPassword',
            database: 'dbName'
        }
    }
}

let config = dbConfigs[dbtype]

const db = knex(config)

if (process.argv.includes('--delete')) {
    for (let i = 0; i < loop; i++) {
        let key = KEY + '/' + i
        console.time(`deleting ${key}`)
        await db(tableName).where('K', key).del()
        console.timeEnd(`deleting ${key}`)
    }
    let rows = await db(tableName).select() // 'K as key', 'V as value'
    console.table(rows.map(e => { e.V = String(e.V); return e }))
    db.destroy()
    process.exit(0)
}

await (
    async () => {

        // create table if not exists
        if (! await db.schema.hasTable(tableName)) {
            console.log("creating table ", tableName)
            await db.schema
                .createTable(tableName, table => {
                    table.string('K', 256).primary();
                    table.binary('V');
                    table.dateTime('created').defaultTo(db.fn.now());
                    table.dateTime('updated').defaultTo(db.fn.now());
                })
        }

        // merge rows
        for (let i = 0; i < loop; i++) {
            let key = KEY + '/' + i
            value = randomBytes(16).toString('hex')

            console.time(`insert ${key}`)
            if (config.client === 'mssql' || config.client === 'oracledb')
            { // MSSQL, Oracle
              await db.raw(`
                merge into "${tableName}" T 
                using (
                   select ? as K,  ? as V ${config.client === 'oracledb' ? 'FROM DUAL' : ''}
                  ) S
                ON (s.K = t.K)
                WHEN MATCHED THEN UPDATE SET t.V = s.V, t."updated" = ?
                WHEN NOT MATCHED THEN INSERT (K, V) VALUES (s.K, s.V)
                ${config.client === 'mssql' ? ';' : ''}
               `, [key, Buffer.from(value), db.fn.now()])

            }
            else { // sqlite, mysql, postgres
                await db(tableName)
                    .insert({ K: key, V: Buffer.from(value), updated: db.fn.now() })
                    .onConflict('K')
                    .merge()
            }

            console.timeEnd(`insert ${key}`)
        }
        // console.timeEnd('initial insert')

        // print table
        let rows = await db(tableName).select() // 'K as key', 'V as value'
        console.table(rows.map(e => { e.V = String(e.V); return e }))
        db.destroy()

    }
)()

