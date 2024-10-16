import React, { useState, useRef } from "react";
import {
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  useDisclosure,
  Image,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ImageCropper from "../miscellaneous/ImageCropper";
import useNotification from "../../hooks/notification";
import { errors, messages } from "../../messages";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { signupValidationSchema, signupInitialValues } from "./validationSchema";
import ModalTemplete from "../miscellaneous/ModalTemplete";

const Signup = () => {
  const [pshow, setPShow] = useState(false);
  const [cshow, setCShow] = useState(false);
  const [pic, setPic] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const showToast = useNotification();
  const inputRef = useRef();
  const navigate = useNavigate();
  const imageCropper = useDisclosure();

  const handleSignUp = async (values, actions) => {
    if (!pic) {
      showToast(errors.NO_IMAGE_SELECTED, "warning");
      return;
    }
    actions.setSubmitting(true);

    try {
      const config = { headers: { "Content-Type": "application/json" } };
      const { data } = await axios.post(
        "/api/user/signup",
        { ...values, pic },
        config,
      );
      
      showToast(messages.USER_REGISTERED, "success");
      localStorage.setItem("userInfo", JSON.stringify(data));
      actions.setSubmitting(false);
      navigate("/chats");
    } catch (error) {
      handleError(error);
      actions.setSubmitting(false);
    }
  };

  const postDetails = (pics) => {
    if (pics === undefined) {
      showToast(errors.NO_IMAGE_SELECTED, "warning");
      return;
    }

    if (pics.type !== "image/jpeg" && pics.type !== "image/png") {
      showToast(errors.NO_IMAGE_SELECTED, "warning");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      setImgSrc(e.target.result);
      imageCropper.onOpen();
    };
    
    reader.readAsDataURL(pics);
    inputRef.current.value = "";
  };

  function handleError(error) {
    const errorMessage = error?.response?.data?.error || errors.SIGNUP_FAILED;
    showToast(errorMessage, "error");
  };

  return (
    <Formik
      initialValues={signupInitialValues}
      validationSchema={signupValidationSchema}
      onSubmit={handleSignUp}
    >
      {(formik) => (
        <Form>
          <VStack align="stretch">
            <FormControl id="name" isRequired mb={2}>
              <FormLabel><strong>ユーザー名：</strong></FormLabel>
              <Field name="name">
                {({ field }) => (
                  <Input
                    {...field}
                    placeholder="ユーザー名を入力してください"
                    autoComplete="off"
                    bg="#3B2C2F"
                    borderColor="#E17875"
                    _placeholder={{ color: "gray.200" }}
                  />
                )}
              </Field>
              <ErrorMessage
                name="name"
                component="div"
                style={{ color: "red", fontSize: "smaller" }}
              />
            </FormControl>

            <FormControl id="signupEmail" isRequired mb={2}>
            <FormLabel><strong>メールアドレス：</strong></FormLabel>
              <Field name="email">
                {({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    placeholder="メールアドレスを入力してください"
                    autoComplete="email"
                    bg="#3B2C2F"
                    borderColor="#E17875"
                    _placeholder={{ color: "gray.200" }}
                  />
                )}
              </Field>
              <ErrorMessage
                name="email"
                component="div"
                style={{ color: "red", fontSize: "smaller" }}
              />
            </FormControl>

            <FormControl id="signupPassword" isRequired mb={2}>
            <FormLabel><strong>パスワード：</strong></FormLabel>
              <InputGroup>
                <Field name="password">
                  {({ field }) => (
                    <Input
                      {...field}
                      type={pshow ? "text" : "password"}
                      placeholder="パスワードを入力してください"
                      bg="#3B2C2F"
                      borderColor="#E17875"
                      _placeholder={{ color: "gray.200" }}
                    />
                  )}
                </Field>

                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={() => setPShow(!pshow)}
                    variant="ghost"
                    aria-label={pshow ? "パスワードを隠す" : "パスワードを表示"}
                  >
                    <FontAwesomeIcon
                      icon={pshow ? faEyeSlash : faEye}
                      style={{ color: "#E17875" }}
                    />
                  </Button>
                </InputRightElement>
              </InputGroup>
              <ErrorMessage
                name="password"
                component="div"
                style={{ color: "red", fontSize: "smaller" }}
              />
            </FormControl>

            <FormControl id="confirmPassword" isRequired mb={2}>
            <FormLabel><strong>パスワード確認：</strong></FormLabel>
              <InputGroup>
                <Field name="confirmPassword">
                  {({ field }) => (
                    <Input
                      {...field}
                      type={pshow ? "text" : "password"}
                      placeholder="パスワード確認"
                      bg="#3B2C2F"
                      borderColor="#E17875"
                      _placeholder={{ color: "gray.200" }}
                    />
                  )}
                </Field>

                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={() => setCShow(!cshow)}
                    variant="ghost"
                    aria-label={cshow ? "パスワードを隠す" : "パスワードを表示"}
                  >
                    <FontAwesomeIcon
                      icon={cshow ? faEyeSlash : faEye}
                      style={{ color: "#E17875" }}
                    />
                  </Button>
                </InputRightElement>
              </InputGroup>
              <ErrorMessage
                name="confirmPassword"
                component="div"
                style={{ color: "red", fontSize: "smaller" }}
              />
            </FormControl>

            <FormControl
              id="picture"
              display="flex"
              flexDirection="column"
              alignItems="center"
              isRequired
            >
              <FormLabel alignSelf="flex-start">
                <strong>プロフィール画像</strong>
              </FormLabel>
              {pic ? (
                <Image
                mt={4}
                  src={pic}
                  boxSize="120px"
                  borderRadius="lg"
                  objectFit="cover"
                  alt="プロフィール画像"
                  cursor="pointer"
                  onClick={() => inputRef.current.click()}
                />
              ) : (
                <Button
                  mt={4}
                  width="120px"
                  height="120px"
                  borderRadius="lg"
                  onClick={() => inputRef.current.click()}
                  cursor="pointer"
                  color="white"
                  bg="#E17875"
                  _hover={{ bg: "#FF6F61" }}
                >
                  ファイルを選択
                </Button>
              )}

              <Input
                hidden
                type="file"
                accept="image/jpeg, image/png"
                onChange={(e) => postDetails(e.target.files[0])}
                ref={inputRef}
              />

              <ModalTemplete
                isOpen={imageCropper.isOpen}
                onClose={imageCropper.onClose}
                title={"トリミング"}
                Contents={ImageCropper}
                contentsProps={{
                  imgSrc: imgSrc,
                  setPic: setPic,
                  onClose: imageCropper.onClose,
                }}
              />
            </FormControl>

            <Button
              colorScheme="teal"
              width="100%"
              mt={4}
              type="submit"
              isLoading={formik.isSubmitting}
            >
              登録
            </Button>
          </VStack>
        </Form>
      )}
    </Formik>

  );
};

export default Signup;