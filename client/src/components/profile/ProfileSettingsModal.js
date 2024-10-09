import {
  Button,
  FormControl,
  FormLabel,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  Flex,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
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
    <ModalContent>
      <ModalHeader>画像をトリミング</ModalHeader>
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
    </ModalContent>
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

const ProfileSettingsModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useUserState();
  const showToast = useNotification();
  const [mode, setMode] = useState("userSettingsMode");
  const [isPictureChanged, setIsPictureChanged] = useState(false);
  const [picture, setPicture] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);

  const inputRef = useRef();

  const handleOnClose = useCallback(() => {
    setIsPictureChanged(false);
    setPicture(null);
    onClose();
  }, [
    setIsPictureChanged,
    setPicture,
    onClose,
  ]);
  
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

  return (
    <Modal isOpen={isOpen} onClose={handleOnClose} motionPreset="none">
      <ModalOverlay />
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
              <ModalContent>
                <ModalHeader>ユーザー設定</ModalHeader>
                <ModalBody display="flex" flexDirection="column" alignItems="center">
                  <FormControl id="isUserNameChanged">
                    <Field name="isUserNameChanged">
                      {({ field }) => (
                        <Checkbox
                          {...field}
                          isChecked={field.value}
                          alignSelf="flex-start"
                        >
                          ユーザー名を変更する
                        </Checkbox>
                      )}
                    </Field>
                  </FormControl>

                  <FormControl id="userName">
                    <Field name="userName">
                      {({ field }) => (
                        <Input
                          {...field}
                          placeholder="ユーザー名"
                          autoComplete="off"
                          isDisabled={!formik.values.isUserNameChanged}
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
                    alignSelf="flex-start"
                  >
                    プロフィール画像を変更する
                  </Checkbox>

                  <FormControl id="picture">
                    <FormLabel>プロフィール画像</FormLabel>
                    {picture && (
                      <Image
                        src={picture}
                        boxSize="30%"
                        borderRadius="lg"
                        objectFit="cover"
                        alt="プロフィール画像"
                      />
                    )}
                    <Button
                      as="label"
                      style={{ marginTop: 15 }}
                      isDisabled={!isPictureChanged}
                    >
                      ファイルを選択
                      <Input
                        hidden
                        type="file"
                        accept="image/jpeg, image/png"
                        onChange={(e) => postDetails(e.target.files[0])}
                        ref={inputRef}
                      />
                    </Button>
                  </FormControl>
                </ModalBody>
                <ModalFooter>
                  <Flex width="100%" justifyContent="space-evenly">
                    <Button onClick={handleOnClose}>Close</Button>
                    <Button
                      colorScheme="twitter"
                      type="submit"
                      isLoading={formik.isSubmitting}
                    >
                      送信
                    </Button>
                  </Flex>
                </ModalFooter>
              </ModalContent>
            </Form>
          )}
        </Formik>

      {mode === "imageCropMode" &&
        <ImageCropper 
          imgSrc={imgSrc}
          setPicture={setPicture}
          setMode={setMode}
        />
      }
    </Modal>
  );
};

export default ProfileSettingsModal;