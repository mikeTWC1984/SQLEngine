
import knex from 'knex'
import { randomBytes } from 'crypto'


let config = {
    client: 'mysql2',
    connection: {
        host: 'mysql',
        user: 'root',
        password: 'Pa$$word',
        database: 'cronicle'
    }
}

const db = knex(config)

let key = 'global/0'
let value = randomBytes(16).toString('hex')

const tableName = 'TESTB'

await (
    async () => {

        await db.raw(`
        DECLARE
         k VARCHAR(256);
         b BLOB;
        BEGIN 
            k := ?;
            b := ?;
            MERGE INTO TESTB T
            USING (SELECT k AS K FROM DUAL) S
            ON (s.K = t.K)
            WHEN MATCHED THEN UPDATE SET t.V = b
            WHEN NOT MATCHED THEN INSERT (K, V) VALUES (s.K, b );
        END;
          `, [key, Buffer.from(value)])



        // print table
        let rows = await db(tableName).select() // 'K as key', 'V as value'
        console.table(rows.map(e => { e.V = String(e.V).length; return e }))
        db.destroy()

    }
)()

