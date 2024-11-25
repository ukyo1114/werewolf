import { useCallback, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Stack, Text, UnorderedList, ListItem, Button } from "@chakra-ui/react";
import useNotification from "../hooks/useNotification";

export const ResetPassword = () => {
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
        <Text as="h1" fontSize="2xl" fontWeight="bold">パスワード再設定</Text>
        <Text>
          登録済みのメールアドレス宛に再設定用リンクを送信します。
        </Text>
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
