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
import ImageCropperModal from "../miscellaneous/ImageCropperModal";
import useNotification from "../../hooks/notification";
import { errors, messages } from "../../messages";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { signupValidationSchema, signupInitialValues } from "./validationSchema";

const Signup = () => {
  const [pshow, setPShow] = useState(false);
  const [cshow, setCShow] = useState(false);
  const [pic, setPic] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const showToast = useNotification();
  const inputRef = useRef();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
      showToast(error?.response?.data?.error, "error");
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
      onOpen();
    };
    
    reader.readAsDataURL(pics);
    inputRef.current.value = "";
  };

  return (
    <Formik
      initialValues={signupInitialValues}
      validationSchema={signupValidationSchema}
      onSubmit={handleSignUp}
    >
      {(formik) => (
        <Form>
          <VStack spacing={4} align="stretch">
            <FormControl id="name" isRequired>
              <FormLabel>ユーザー名</FormLabel>
              <Field
                as={Input}
                name="name"
                placeholder="ゲーム内で使用されます"
                autoComplete="off"
              />
              <ErrorMessage
                name="name"
                component="div"
                style={{ color: "red", fontSize: "smaller" }}
              />
            </FormControl>

            <FormControl id="signupEmail" isRequired>
              <FormLabel>メールアドレス</FormLabel>
              <Field
                as={Input}
                name="email"
                type="email"
                placeholder="メールアドレスを入力してください"
                autoComplete="email"
              />
              <ErrorMessage
                name="email"
                component="div"
                style={{ color: "red", fontSize: "smaller" }}
              />
            </FormControl>

            <FormControl id="signupPassword" isRequired>
              <FormLabel>パスワード</FormLabel>
              <InputGroup>
                <Field
                  as={Input}
                  name="password"
                  type={pshow ? "text" : "password"}
                  placeholder="パスワードを入力してください"
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={() => setPShow(!pshow)}
                    variant="ghost"
                    aria-label={pshow ? "パスワードを隠す" : "パスワードを表示"}
                  >
                    <FontAwesomeIcon icon={pshow ? faEyeSlash : faEye} />
                  </Button>
                </InputRightElement>
              </InputGroup>
              <ErrorMessage
                name="password"
                component="div"
                style={{ color: "red", fontSize: "smaller" }}
              />
            </FormControl>

            <FormControl id="confirmPassword" isRequired>
              <FormLabel>パスワード確認</FormLabel>
              <InputGroup>
                <Field
                  as={Input}
                  name="confirmPassword"
                  type={cshow ? "text" : "password"}
                  placeholder="確認用パスワードを入力してください"
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={() => setCShow(!cshow)}
                    variant="ghost"
                    aria-label={cshow ? "パスワードを隠す" : "パスワードを表示"}
                  >
                    <FontAwesomeIcon icon={cshow ? faEyeSlash : faEye} />
                  </Button>
                </InputRightElement>
              </InputGroup>
              <ErrorMessage
                name="confirmPassword"
                component="div"
                style={{ color: "red", fontSize: "smaller" }}
              />
            </FormControl>

            <FormControl id="picture">
              <FormLabel>プロフィール画像</FormLabel>
              {pic && (
                <Image
                  src={pic}
                  boxSize="30%"
                  borderRadius="lg"
                  objectFit="cover"
                  alt="プロフィール画像"
                />
              )}
              <Button as="label" style={{ marginTop: 15 }}>
                ファイルを選択
                <Input
                  hidden
                  type="file"
                  accept="image/jpeg, image/png"
                  onChange={(e) => postDetails(e.target.files[0])}
                  ref={inputRef}
                />
              </Button>
              <ImageCropperModal
                imgSrc={imgSrc}
                setPic={setPic}
                isOpen={isOpen}
                onClose={onClose}
              />
            </FormControl>

            <Button
              colorScheme="twitter"
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