import { Injectable } from "@nestjs/common";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

@Injectable()
export class TypeOrmDBConfig implements TypeOrmOptionsFactory {
    createTypeOrmOptions(connectionName?: string): TypeOrmModuleOptions {
        return {
          type: 'postgres',
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          entities: ['dist/modules/**/*.entity.js'],
          synchronize:true
        };
      }
}