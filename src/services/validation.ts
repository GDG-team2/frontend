export function validateCredentials(
  email: string,
  password: string,
  signup = false,
) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    throw new Error("이메일 주소를 확인해 주세요.");
  if (!password) throw new Error("비밀번호를 입력해 주세요.");
  if (
    signup &&
    (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password))
  )
    throw new Error("비밀번호는 영문·숫자를 포함해 8자 이상 입력해 주세요.");
}
export function birthYearValue(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const year = Number(value);
  if (!/^\d{4}$/.test(value) || year < 1900 || year > new Date().getFullYear())
    throw new Error("출생 연도를 확인해 주세요.");
  return year;
}
