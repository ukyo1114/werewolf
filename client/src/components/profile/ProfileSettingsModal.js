import {
  Button,
  FormControl,
  Checkbox,
  Input,
  ModalBody,
  Flex,
  ModalFooter,
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Image,
} from "@chakra-ui/react";
import { useUserState } from "../../context/userProvider";
import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import Cropper from "react-easy-crop";
import useNotification from "../../hooks/notification";
import { errors, messages } from "../../messages";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { profileSettingsValidationSchema } from "./validationSchema";

const ImageCropper = ({ imgSrc, setPicture, setMode }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const toggleUserSettingsMode = useCallback(() => {
    setMode("userSettingsMode");
  }, [setMode]);

  const cropImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(imgSrc, croppedAreaPixels);
      setPicture(croppedImage);
      toggleUserSettingsMode();
    } catch (e) {
      console.error(e);
    }
  }, [imgSrc, croppedAreaPixels, setPicture, toggleUserSettingsMode]);

  const onMediaLoaded = () => {
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  return (
    <>
      <ModalBody>
        {imgSrc && (
          <Box position="relative" width="100%" height="400px">
            <Cropper
              image={imgSrc}
              crop={crop}
              zoom={zoom}
              maxZoom={5}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, croppedAreaPixels) =>
                setCroppedAreaPixels(croppedAreaPixels)
              }
              onMediaLoaded={onMediaLoaded}
            />
          </Box>
        )}
        <Box mt={4}>
          <Slider
            aria-label="zoom-slider"
            value={zoom}
            min={1}
            max={10}
            step={0.1}
            onChange={(value) => setZoom(value)}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </Box>
      </ModalBody>

      <ModalFooter>
        <Flex width="100%" justifyContent="space-evenly">
          <Button onClick={toggleUserSettingsMode}>戻る</Button>
          <Button colorScheme="twitter" onClick={cropImage}>
            OK
          </Button>
        </Flex>
      </ModalFooter>
    </>
  )
};

const createImage = (url) => {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
};

const getCroppedImg = async (imgSrc, croppedAreaPixels) => {
  try {
    const image = await createImage(imgSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 150;
    canvas.height = 150;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      150,
      150,
    );

    const data = canvas.toDataURL("image/png");
    return data;
  } catch (error) {
    console.error("Failed to crop the image:", error);
    throw error;
  }
};

const ProfileSettingsModal = () => {
  const { user, setUser } = useUserState();
  const showToast = useNotification();
  const [mode, setMode] = useState("userSettingsMode");
  const [isPictureChanged, setIsPictureChanged] = useState(false);
  const [picture, setPicture] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);

  const inputRef = useRef();
/* 
  const handleOnClose = useCallback(() => {
    setIsPictureChanged(false);
    setPicture(null);
    onClose();
  }, [
    setIsPictureChanged,
    setPicture,
    onClose,
  ]); */
  
  const toggleImageCropMode = useCallback(() => {
    setMode("imageCropMode");
  }, [setMode]);

  const postDetails = useCallback((pics) => {
    if (!pics) {
      showToast(errors.IMAGE_NOT_SELECTED, "warning");
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImgSrc(e.target.result);
        toggleImageCropMode();
      };
      reader.readAsDataURL(pics);
      inputRef.current.value = "";
    } else {
      showToast(errors.IMAGE_NOT_SELECTED, "warning");
      return;
    }
  }, [setImgSrc, toggleImageCropMode, showToast]);

  const handleSubmit = useCallback(async (values, actions) => {
    const { userName, isUserNameChanged } = values;
    actions.setSubmitting(true);
    const payload = {};
    if (isUserNameChanged && userName) payload.userName = userName;
    if (isPictureChanged && picture) payload.picture = picture;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const { data } = await axios.put(
        "/api/user/profile",
        payload,
        config,
      );
      setUser((prevUser) => {
        return {
          ...prevUser,
          name: data.name,
          pic: data.pic,
        }
      });
      showToast(messages.PROFILE_SETTINGS_CHANGED, "success");
    } catch (error) {
      showToast(
        error?.response?.data?.message || errors.PROFILE_SETTINGS_FAILED,
        "error"
      );
    } finally {
      actions.setSubmitting(false);
    }
  }, [
    isPictureChanged,
    picture,
    user.token,
    setUser,
    showToast
  ]);

  const handleImageClick = useCallback(() => {
    if (isPictureChanged)  inputRef.current.click();
  }, [isPictureChanged]);

  return (
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
              id="picture"
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              {picture ? (
                <Image
                  mt={4}
                  src={picture}
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
              {mode === "imageCropMode" &&
                <ImageCropper 
                  imgSrc={imgSrc}
                  setPicture={setPicture}
                  setMode={setMode}
                />
              }
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
  );
};

export default ProfileSettingsModal;