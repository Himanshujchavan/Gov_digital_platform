const { Module } = require('@nestjs/common');
const { UsersService } = require('./users.service');

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
class UsersModule {}

module.exports = { UsersModule };
