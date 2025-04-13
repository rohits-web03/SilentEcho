import { Note } from "@/model/Note";
import { Message } from "@/model/User";

export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: Array<Message>
};

export interface NoteData {
  ciphernote: string;
  createdAt?: string;
  expiresAt?: string | null;
}

export interface GoApiResponse {
  data: Note[];
  message: string;
};