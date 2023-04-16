export interface UserInterface {
  id: number;
  created: string;
  name: string;
  email: string;
}

export interface UserBodyInterface {
  name: string;
  email: string;
}

export interface UserToRegisterInterface {
  name: string;
  email: string;
  password: string;
}
