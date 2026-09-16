const test = require('node:test');
const assert = require('node:assert');
const { JwtService } = require('@nestjs/jwt');
const { UsersService } = require('../src/users/users.service');
const { AuthService } = require('../src/auth/auth.service');
const { Roles } = require('@maha-interop/shared');

test('Auth Service Test Suite', async (t) => {
  const usersService = new UsersService();
  // Wait for seed users to be hashed and registered
  await new Promise((resolve) => setTimeout(resolve, 500));

  const jwtService = new JwtService({
    secret: 'test_jwt_secret_key_for_testing',
  });

  const authService = new AuthService(usersService, jwtService);

  await t.test('1. Seeded users exist', async () => {
    const rahul = await usersService.findByUsername('citizen_rahul');
    assert.ok(rahul, 'citizen_rahul should exist');
    assert.strictEqual(rahul.role, Roles.CITIZEN);
    assert.strictEqual(rahul.fullName, 'Rahul Sharma');

    const admin = await usersService.findByUsername('admin_user');
    assert.ok(admin, 'admin_user should exist');
    assert.strictEqual(admin.role, Roles.ADMIN);

    const officer = await usersService.findByUsername('officer_education');
    assert.ok(officer, 'officer_education should exist');
    assert.strictEqual(officer.role, Roles.OFFICER);
    assert.strictEqual(officer.department, 'education');
  });

  await t.test('2. Successful login returns access & refresh tokens', async () => {
    const loginResult = await authService.login({
      username: 'citizen_rahul',
      password: 'password123',
    });

    assert.ok(loginResult.accessToken, 'Should return accessToken');
    assert.ok(loginResult.refreshToken, 'Should return refreshToken');
    assert.strictEqual(loginResult.tokenType, 'Bearer');
    assert.strictEqual(loginResult.user.username, 'citizen_rahul');
    assert.strictEqual(loginResult.user.role, Roles.CITIZEN);

    // Verify token validity
    const decoded = jwtService.verify(loginResult.accessToken);
    assert.strictEqual(decoded.username, 'citizen_rahul');
    assert.strictEqual(decoded.role, Roles.CITIZEN);
  });

  await t.test('3. Invalid password is rejected', async () => {
    await assert.rejects(
      async () => {
        await authService.login({
          username: 'citizen_rahul',
          password: 'wrongpassword',
        });
      },
      /Invalid username or password/,
      'Should throw UnauthorizedException for bad password'
    );
  });

  await t.test('4. Token refresh generates valid new access token', async () => {
    const loginResult = await authService.login({
      username: 'citizen_rahul',
      password: 'password123',
    });

    const refreshResult = await authService.refresh(loginResult.refreshToken);
    assert.ok(refreshResult.accessToken, 'Should return new accessToken');

    const decoded = jwtService.verify(refreshResult.accessToken);
    assert.strictEqual(decoded.username, 'citizen_rahul');
  });

  await t.test('5. Registration of new citizen user succeeds', async () => {
    const newCitizen = await authService.register({
      username: 'citizen_amit',
      password: 'newpassword123',
      fullName: 'Amit Deshmukh',
      email: 'amit.deshmukh@example.com',
      role: Roles.CITIZEN,
    });

    assert.ok(newCitizen.id, 'New user should have an id');
    assert.strictEqual(newCitizen.username, 'citizen_amit');

    // Login with new user
    const loginResult = await authService.login({
      username: 'citizen_amit',
      password: 'newpassword123',
    });
    assert.ok(loginResult.accessToken, 'New user can log in');
  });
});
