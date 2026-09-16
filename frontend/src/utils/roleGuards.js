export const Roles = {
  CITIZEN: 'citizen',
  OFFICER: 'officer',
  ADMIN: 'admin',
};

export function getDefaultDashboard(role) {
  switch (role) {
    case Roles.CITIZEN:
      return '/citizen/services';
    case Roles.OFFICER:
      return '/officer/pending-reviews';
    case Roles.ADMIN:
      return '/admin/system-stats';
    default:
      return '/login';
  }
}
