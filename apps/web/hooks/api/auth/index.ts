import { trpc } from "~/trpc/client";

export const useSignup = () => {
  const {
    mutateAsync: signUpUserAsync,
    mutate: signUpUser,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.auth.signUpUser.useMutation();

  return {
    signUpUserAsync,
    signUpUser,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  };
};

export const useSignIn = () => {
  const {
    mutateAsync: signInUserWithEmailAndPasswordAsync,
    mutate: signInUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  } = trpc.auth.signInUserWithEmailAndPassword.useMutation();

  return {
    signInUserWithEmailAndPasswordAsync,
    signInUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isPending,
    isSuccess,
    status,
  };
};
