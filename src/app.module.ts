import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmDBConfig } from './configs/typeOrm.config';
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmDBConfig,
      inject: [TypeOrmDBConfig],
    }),
  ],
  providers: [TypeOrmDBConfig],
})
export class AppModule {}
