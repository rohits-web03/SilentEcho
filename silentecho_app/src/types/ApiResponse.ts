import { Note } from "@/types";
import { Message } from "@/types";
import { User } from "@/types";

export interface isUnique {
  isUnique: boolean;
}

export interface acceptMessagesStatus {
  isAcceptingMessages: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
