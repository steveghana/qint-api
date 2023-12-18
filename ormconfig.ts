// ormconfig.ts

import {ConfigModule} from "@nestjs/config";
import dbConfiguration from "src/apps/Config/db.config";

ConfigModule.forRoot({
    isGlobal: true,
    load: [dbConfiguration],
})

export default dbConfiguration()