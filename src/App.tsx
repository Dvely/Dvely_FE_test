import { useEffect, useState } from "react";
import {
  getGithubLoginUrl,
  handleGithubCallback,
  getGithubAppInstallUrl,
  handleGithubAppCallback,
} from "./api/auth";
import { tokenStorage } from "./lib/token";
import type { AuthStep } from "./types/auth";
import LoginPage from "./pages/LoginPage";
import "./App.css";

export default function App() {
  const [step, setStep] = useState<AuthStep>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // /app/callback 경로: installation_id, setup_action, state를 백엔드 GET API로 전달
  useEffect(() => {
    if (window.location.pathname !== "/app/callback") return;

    const params = new URLSearchParams(window.location.search);
    const installation_id = params.get("installation_id") ?? "";
    const setup_action = params.get("setup_action") ?? "install";
    const state = params.get("state") ?? "";

    setStep("callback");

    handleGithubAppCallback({ installation_id, setup_action, state })
      .then(() => setStep("done"))
      .catch((err: unknown) => {
        setStep("error");
        setErrorMessage(
          err instanceof Error ? err.message : "App 인증에 실패했습니다.",
        );
      });
  }, []);

  // Step 3-6: /?code=xxx 로 돌아온 경우 처리
  useEffect(() => {
    if (window.location.pathname === "/app/callback") return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code) return;

    // URL에서 code 제거 (히스토리 교체)
    window.history.replaceState({}, "", window.location.pathname);

    setStep("callback");

    handleGithubCallback(code)
      .then(async ({ accessToken, githubAppInstalled }) => {
        // Step 5: accessToken 저장
        tokenStorage.set(accessToken);

        // Step 6: GitHub App 미설치 시 설치 페이지로 리다이렉트
        if (!githubAppInstalled) {
          setStep("install");
          const { url } = await getGithubAppInstallUrl(accessToken);
          window.location.href = url;
          return;
        }

        setStep("done");
      })
      .catch((err: unknown) => {
        setStep("error");
        setErrorMessage(
          err instanceof Error ? err.message : "인증에 실패했습니다.",
        );
      });
  }, []);

  // Step 1-2: 로그인 버튼 클릭 → GitHub URL 받아서 리다이렉트
  async function handleLogin() {
    setStep("loading");
    setErrorMessage("");
    try {
      const { url } = await getGithubLoginUrl();

      window.location.href = url;
    } catch (err) {
      setStep("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "로그인 URL을 가져오지 못했습니다.",
      );
    }
  }

  return (
    <LoginPage step={step} errorMessage={errorMessage} onLogin={handleLogin} />
  );
}
