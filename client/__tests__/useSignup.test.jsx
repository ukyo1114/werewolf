import { render, act } from "@testing-library/react"
import { vi } from 'vitest';
import React from "react";
import axios from "axios"

import useSignup from "../src/features/signup/hooks/useSignup"

import useNotification from "../src/hooks/useNotification";
import { useNavigate } from "react-router-dom";

vi.mock("axios");
vi.mock("../src/hooks/useNotification");

vi.mock("react-router-dom", () => ({
  ...vi.importActual("react-router-dom"),
  useNavigate: vi.fn(),
}));

describe("useSignup", () => {
  let mockShowToast;
  let mockNavigate;
  let mockSetSubmitting;

  const mockedUseNotification = useNotification;
  const mockedUseNavigate = useNavigate;

  beforeEach(() => {
    mockShowToast = vi.fn();
    mockNavigate = vi.fn();
    mockSetSubmitting = vi.fn();

    mockedUseNotification.mockReturnValue(mockShowToast);
    mockedUseNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    axios.post.mockReset();
    vi.clearAllMocks();
  });

  // フックを使用するコンポーネントを作成
  const HookComponent = ({ onHandleSignup }) => {
    const { handleSignup } = useSignup();

    React.useEffect(() => {
      onHandleSignup(handleSignup);
    }, [onHandleSignup, handleSignup]);

    return null;
  };

  it("画像が無い場合、エラーを表示する", async () => {
    let handleSignupFunction;

    const setHandleSignup = (fn) => {
      handleSignupFunction = fn;
    };

    render(<HookComponent onHandleSignup={setHandleSignup} />);

    expect(handleSignupFunction).toBeDefined();

    await act(async () => {
      await handleSignupFunction({}, { setSubmitting: mockSetSubmitting }, null);
    });

    expect(mockShowToast).toHaveBeenCalledWith("画像が選択されていません", "warning");
    expect(mockSetSubmitting).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});