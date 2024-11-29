import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Button,
  VStack,
  FormControl, FormLabel,
  Input, InputGroup, InputRightElement,
  useDisclosure,
  Image,
} from "@chakra-ui/react";
import { Formik, Form, Field, ErrorMessage } from "formik";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";


import ImageCropper from "../miscellaneous/ImageCropper.jsx";
import useNotification from "../../hooks/useNotification";
import { errors, messages } from "../../messages";
import { signupValidationSchema, signupInitialValues } from "./validationSchema";
import ModalTemplete from "../miscellaneous/ModalTemplete.jsx";
import usePostDetails from "../../hooks/usePostDetails";

const Signup = () => {
  const [pshow, setPShow] = useState(false);
  const [cshow, setCShow] = useState(false);
  const [pic, setPic] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);

  const showToast = useNotification();

  const inputRef = useRef();
  const navigate = useNavigate();
  const imageCropper = useDisclosure();
  
  const postDetails = usePostDetails({
    setImgSrc, onOpen: imageCropper.onOpen, inputRef
  });

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
      actions.setSubmitting(false);
      navigate(`/verification/${data.token}`);
    } catch (error) {
      handleError(error);
      actions.setSubmitting(false);
    }
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
          <VStack>
            <FormControl id="name" isRequired mb={3}>
              <FormLabel>ユーザー名</FormLabel>
              <Field name="name">
                {({ field }) => (
                  <Input
                    {...field}
                    placeholder="ユーザー名"
                    autoComplete="off"
                  />
                )}
              </Field>
              <ErrorMessage
                name="name"
                component="div"
                style={{ color: "red", fontSize: "smaller" }}
              />
            </FormControl>

            <FormControl id="signupEmail" isRequired mb={3}>
            <FormLabel>メールアドレス</FormLabel>
              <Field name="email">
                {({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    placeholder="メールアドレス"
                    autoComplete="email"
                  />
                )}
              </Field>
              <ErrorMessage
                name="email"
                component="div"
                style={{ color: "red", fontSize: "smaller" }}
              />
            </FormControl>

            <FormControl id="signupPassword" isRequired mb={3}>
            <FormLabel>パスワード</FormLabel>
              <InputGroup>
                <Field name="password">
                  {({ field }) => (
                    <Input
                      {...field}
                      type={pshow ? "text" : "password"}
                      placeholder="パスワード"
                      pr="4rem"
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
                    color="gray.700"
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

            <FormControl id="confirmPassword" isRequired mb={3}>
            <FormLabel>パスワード(確認)</FormLabel>
              <InputGroup>
                <Field name="confirmPassword">
                  {({ field }) => (
                    <Input
                      {...field}
                      type={cshow ? "text" : "password"}
                      placeholder="パスワード(確認)"
                      pr="4rem"
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
                    color="gray.700"
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

            <FormControl
              id="picture"
              display="flex"
              flexDirection="column"
              alignItems="center"
              mb={3}
            >
              <FormLabel alignSelf="flex-start">プロフィール画像</FormLabel>
              {pic ? (
                <Image
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
                  width="120px"
                  height="120px"
                  borderRadius="lg"
                  onClick={() => inputRef.current.click()}
                  colorScheme="gray"
                >
                  画像を選択
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
              >
                <ImageCropper
                  imgSrc={imgSrc}
                  setPic={setPic}
                  onClose={imageCropper.onClose}
                />
              </ModalTemplete>
            </FormControl>

            <Button
              colorScheme="teal"
              width="100%"
              mt={8}
              type="submit"
              isLoading={formik.isSubmitting}
            >
              ユーザー登録
            </Button>
          </VStack>
        </Form>
      )}
    </Formik>

  );
};

export default Signup;