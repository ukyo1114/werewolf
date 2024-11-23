import { useCallback, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Stack, Text, UnorderedList, ListItem, Button } from "@chakra-ui/react";
import useNotification from "../hooks/useNotification";

export const EmailVerification = () => {
  const navigate = useNavigate();
  const showToast = useNotification();

  const handleResend = useCallback(async () => {
    const resend = localStorage.getItem("resend");
    const token = JSON.parse(resend).token;

    try {
      await axios.post("/api/verify/resend", { token });
      showToast("確認メールを再送信しました", "success");
    } catch (error) {
      const errorMessage = error.response?.data?.error || "再送信に失敗しました"
      showToast(errorMessage, "error");
    }
  }, [showToast]);

  useEffect(() => {
    const resendToken = localStorage.getItem("resend");
    if (!resendToken) navigate("/home");

    return () => localStorage.removeItem("resend");
  }, [navigate]);

  return (
    <Container
      display="flex"
      centerContent
      maxW="xl"
    >
      <Stack>
        <Text as="h1" fontSize="2xl" fontWeight="bold">メールアドレスの確認が必要です</Text>
        <Text>
          アカウントを有効化するために、確認メールを送信しました。
          メール内のリンクをクリックして、認証を完了してください。
        </Text>
        <UnorderedList>
          <ListItem>迷惑メールフォルダをご確認ください。</ListItem>
          <ListItem>入力したメールアドレスが正しいかご確認ください。</ListItem>
          <ListItem>届かない場合は再送信をお試しください。</ListItem>
        </UnorderedList>
        <Button
          w="11rem"
          colorScheme="teal"
          mt={4}
          onClick={handleResend}
        >
          確認メールを再送信
        </Button>
      </Stack>
    </Container>
  );
};
