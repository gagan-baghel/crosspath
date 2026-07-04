export type ChatMessage = {
  id: string;
  chatId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

export type MessagesPage = {
  messages: ChatMessage[];
  nextCursor: string | null;
};
