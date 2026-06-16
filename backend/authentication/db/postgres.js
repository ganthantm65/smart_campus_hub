import {Pool} from 'pg';

const pool=new Pool({
    user:'postgres',
    host:'localhost',
    database:'smart_campus_hub',
    password:'griffin@2006',
    port:5432
})

export default pool;