import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString: "postgresql://postgres:16708824@localhost:5432/blogpost_db",
});

export default connectionPool;
