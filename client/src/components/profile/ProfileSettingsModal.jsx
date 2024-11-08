import {
  Button,
  FormControl,
  Checkbox,
  Input,
  ModalBody,
  ModalFooter,
  Box,
  Image,
} from "@chakra-ui/react";
import { useUserState } from "../../context/UserProvider.jsx";
import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import useNotification from "../../hooks/useNotification";
import { errors, messages } from "../../messages";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { profileSettingsValidationSchema } from "./validationSchema";
import ImageCropper from "../miscellaneous/ImageCropper";
import usePostDetails from "../../hooks/usePostDetails";

const ProfileSettingsModal = ({ onClose }) => {
  const { user, uDispatch } = useUserState();
  const showToast = useNotification();
  const [cropImage, setCropImage] = useState(false);
  const [isPictureChanged, setIsPictureChanged] = useState(false);
  const [pic, setPic] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);

  const inputRef = useRef();

  const postDetails = usePostDetails({
    setImgSrc,
    onOpen: () => setCropImage(true),
    inputRef,
  });

  const handleSubmit = useCallback(async (values, actions) => {
    const { userName, isUserNameChanged } = values;
    if (!isUserNameChanged && !isPictureChanged) return;
    actions.setSubmitting(true);
    const payload = {};
    if (isUserNameChanged && userName) payload.userName = userName;
    if (isPictureChanged && pic) payload.pic = pic;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      await axios.put(
        "/api/user/profile",
        payload,
        config,
      );
      if (isUserNameChanged && userName) {
        uDispatch({ type: "CHANGE_NAME", payload: userName });
      }
      
      showToast(messages.PROFILE_SETTINGS_CHANGED, "success");
    } catch (error) {
      showToast(
        error?.response?.data?.error || errors.PROFILE_SETTINGS_FAILED,
        "error"
      );
    } finally {
      actions.setSubmitting(false);
      onClose();
    }
  }, [isPictureChanged, pic, user.token, uDispatch, showToast, onClose]);

  const handleImageClick = useCallback(() => {
    if (isPictureChanged)  inputRef.current.click();
  }, [isPictureChanged]);

  return (
    <>
      <Box  display={cropImage && "none"}>
        <Formik
          initialValues={{
            isUserNameChanged: false,
            userName: user.name,
          }}
          validationSchema={profileSettingsValidationSchema}
          onSubmit={handleSubmit}
        >
          {(formik) => (
            <Form>
              <ModalBody>
                <FormControl id="isUserNameChanged" mb={2}>
                  <Field name="isUserNameChanged">
                    {({ field }) => (
                      <Checkbox
                        {...field}
                        isChecked={field.value}
                      >
                        <strong>ユーザー名を変更する</strong>
                      </Checkbox>
                    )}
                  </Field>
                </FormControl>
                
                <FormControl id="userName" mb={3}>
                  <Field name="userName">
                    {({ field }) => (
                      <Input
                        {...field}
                        placeholder="ユーザー名"
                        autoComplete="off"
                        isDisabled={!formik.values.isUserNameChanged}
                        bg="#3B2C2F"
                        borderColor="#E17875"
                        _placeholder={{ color: "gray.200" }}
                      />
                    )}
                  </Field>
                  <ErrorMessage
                    name="userName"
                    component="div"
                    style={{ color: "red", fontSize: "smaller" }}
                  />
                </FormControl>

                <Checkbox
                  id="isPictureChanged"
                  isChecked={isPictureChanged}
                  onChange={(e) => setIsPictureChanged(e.target.checked)}
                  mb={2}
                >
                  <strong>プロフィール画像を変更する</strong>
                </Checkbox>

                <FormControl
                  id="pic"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                >
                  {pic ? (
                    <Image
                      mt={4}
                      src={pic}
                      boxSize="120px"
                      borderRadius="lg"
                      objectFit="cover"
                      alt="プロフィール画像"
                      cursor={isPictureChanged ? "pointer" : "not-allowed"}
                      onClick={handleImageClick}
                      opacity={isPictureChanged ? 1 : 0.7}
                    />
                  ) : (
                    <Button
                      mt={4}
                      isDisabled={!isPictureChanged}
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

                </FormControl>
              </ModalBody>

              <ModalFooter justifyContent="center">
                  <Button
                    colorScheme="teal"
                    width="100%"
                    type="submit"
                    isLoading={formik.isSubmitting}
                  >
                    送信
                  </Button>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </Box>
      
      {cropImage &&
        <ImageCropper
          imgSrc={imgSrc}
          setPic={setPic}
          onClose={() => setCropImage(false)}
        />
      }
    </>
  );
};

export default ProfileSettingsModal;