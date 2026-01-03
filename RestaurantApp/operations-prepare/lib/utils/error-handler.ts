import { $msg, ERROR } from '@/lib/constants/messages';

export const handleApiError = (error: unknown, setError: (msg: string) => void): void => {
  if (error instanceof Error) {
    setError(error.message);
  } else {
    setError($msg(ERROR.E10002, 'API呼び出し'));
  }
};
