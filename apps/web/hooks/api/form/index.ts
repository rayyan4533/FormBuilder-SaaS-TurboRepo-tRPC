import { trpc } from "~/trpc/client";

export const useCreateForm = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: createFormAsync,
    mutate: createForm,
    isError,
    error,
    isPending,
    status,
  } = (trpc as any).form?.createForm?.useMutation
    ? (trpc as any).form.createForm.useMutation({
        onSuccess: async () => {
          await (utils as any).form?.listForms?.invalidate();
        },
      })
    : {
        mutateAsync: async (_data: { title: string; description?: string }) => {},
        mutate: () => {},
        isError: false,
        error: null,
        isPending: false,
        status: "idle",
      };

  return {
    createFormAsync,
    createForm,
    isError,
    error,
    isPending,
    status,
  };
};

export const useListForms = () => {
  const query = (trpc as any).form?.listForms?.useQuery
    ? (trpc as any).form.listForms.useQuery()
    : { data: [], isLoading: false, error: null };

  return {
    forms: query.data ?? [],
    isLoading: query.isLoading ?? false,
    error: query.error ?? null,
  };
};

export const useGetFields = (formId: string) => {
  const query = (trpc as any).form?.getFields?.useQuery
    ? (trpc as any).form.getFields.useQuery({ formId }, { enabled: !!formId })
    : { data: [], isLoading: false, error: null };

  return {
    fields: query.data ?? [],
    isLoading: query.isLoading ?? false,
    error: query.error ?? null,
  };
};

export const useCreateField = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: createFieldAsync,
    mutate: createField,
    isPending,
    isError,
    error,
  } = (trpc as any).form?.createField?.useMutation
    ? (trpc as any).form.createField.useMutation({
        onSuccess: async () => {
          await (utils as any).form?.getFields?.invalidate();
        },
      })
    : {
        mutateAsync: async (_data: any) => {},
        mutate: () => {},
        isPending: false,
        isError: false,
        error: null,
      };

  return {
    createFieldAsync,
    createField,
    isPending,
    isError,
    error,
  };
};

export const useUpdateField = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: updateFieldAsync,
    mutate: updateField,
    isPending,
    isError,
    error,
  } = (trpc as any).form?.updateField?.useMutation
    ? (trpc as any).form.updateField.useMutation({
        onSuccess: async () => {
          await (utils as any).form?.getFields?.invalidate();
        },
      })
    : {
        mutateAsync: async (_data: any) => {},
        mutate: () => {},
        isPending: false,
        isError: false,
        error: null,
      };

  return {
    updateFieldAsync,
    updateField,
    isPending,
    isError,
    error,
  };
};

export const useDeleteField = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: deleteFieldAsync,
    mutate: deleteField,
    isPending,
  } = (trpc as any).form?.deleteField?.useMutation
    ? (trpc as any).form.deleteField.useMutation({
        onSuccess: async () => {
          await (utils as any).form?.getFields?.invalidate();
        },
      })
    : {
        mutateAsync: async (_data: { id: string }) => {},
        mutate: () => {},
        isPending: false,
      };

  return {
    deleteFieldAsync,
    deleteField,
    isPending,
  };
};

export const useGetFormSubmissions = (formId: string) => {
  const query = (trpc as any).form?.getSubmissions?.useQuery
    ? (trpc as any).form.getSubmissions.useQuery({ formId }, { enabled: !!formId })
    : { data: [], isLoading: false, error: null };

  return {
    submissions: query.data ?? [],
    isLoading: query.isLoading ?? false,
    error: query.error ?? null,
  };
};
