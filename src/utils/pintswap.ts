export function mergeUserData(a: any, b: any): typeof a {
  if (b && b.userData) a.userData = b.userData;
  return a;
}
