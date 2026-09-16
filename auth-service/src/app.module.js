const { Module } = require('@nestjs/common');
const { AuthModule } = require('./auth/auth.module');
const { UsersModule } = require('./users/users.module');

@Module({
  imports: [AuthModule, UsersModule],
})
class AppModule {}

module.exports = { AppModule };
