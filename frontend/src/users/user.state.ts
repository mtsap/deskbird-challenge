import { User } from './user.interface';

export interface UserState {
  users: User[] | null;
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
}
export const initialUserState: UserState = {
  users: null,
  selectedUser: null,
  loading: false,
  error: null,
  saving: false,
};
