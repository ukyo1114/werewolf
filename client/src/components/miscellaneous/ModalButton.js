import { Button } from "@chakra-ui/react";

const ModalButton = ({ innerText, onClick, disableCondition }) => {
  return (
    <Button
      mt={4}
      colorScheme="teal"
      width="100%"
      onClick={onClick}
      isDisabled={disableCondition}
    >
      {innerText}
    </Button>
  )
};

export default ModalButton;