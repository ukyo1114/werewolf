import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      "html, body": {
        color: "white",
        backgroundColor: "#2B2024",
      },
    },
  },
  components: {
    Tooltip: {
      baseStyle: {
        bg: "#E17875", // ツールチップの背景色
        color: "white", // ツールチップのテキスト色
      },
    },
    Button: {
      baseStyle: {
        color: "white", // デフォルトのテキストカラー
      },
      variants: {
        ghost: {
          _hover: {
            bg: "#3B2C2F", // ホバー時の背景色
          },
        },
      },
    },
    Icon: {
      baseStyle: {
        color: "#E17875", // アイコンの色
      },
    },
    Text: {
      baseStyle: {
        color: "white", // テキストのデフォルト色
      },
    },
    Checkbox: {
      baseStyle: {
        control: {
          borderColor: "#E17875",
          _checked: {
            bg: "teal",
            borderColor: "teal",
            _hover: {
              bg: "darkTeal",
              borderColor: "darkTeal",
            },
          },
        },
        label: {
          color: "white",
        },
      },
    },
  },
});

export default theme;
