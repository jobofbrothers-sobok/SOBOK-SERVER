export interface UserCreateDTO {
  loginId: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  termsAgree: boolean;
  marketingAgree: boolean;
}
