import { trpc } from "~/trpc/client";

export const useCreateForm = () => {
  const utils = trpc.useUtils();

  const mutation = trpc.form.createForm.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
    },
  });

  return {
    createFormAsync: mutation.mutateAsync,
    createForm: mutation.mutate,
    isError: mutation.isError,
    error: mutation.error,
    isPending: mutation.isPending,
    status: mutation.status,
  };
};

export const useListForms = () => {
  const query = trpc.form.listForms.useQuery();

  return {
    forms: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useGetForm = (formId: string) => {
  const query = trpc.form.getForm.useQuery(
    { formId },
    { enabled: Boolean(formId) }
  );

  return {
    form: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useGetFields = (formId: string) => {
  const query = trpc.form.getFields.useQuery(
    { formId },
    { enabled: Boolean(formId) }
  );

  return {
    fields: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useCreateField = () => {
  const utils = trpc.useUtils();

  const mutation = trpc.form.createField.useMutation({
    onSuccess: async () => {
      await utils.form.getFields.invalidate();
      await utils.form.getForm.invalidate();
    },
  });

  return {
    createFieldAsync: mutation.mutateAsync,
    createField: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useUpdateField = () => {
  const utils = trpc.useUtils();

  const mutation = trpc.form.updateField.useMutation({
    onSuccess: async () => {
      await utils.form.getFields.invalidate();
      await utils.form.getForm.invalidate();
    },
  });

  return {
    updateFieldAsync: mutation.mutateAsync,
    updateField: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useDeleteField = () => {
  const utils = trpc.useUtils();

  const mutation = trpc.form.deleteField.useMutation({
    onSuccess: async () => {
      await utils.form.getFields.invalidate();
      await utils.form.getForm.invalidate();
    },
  });

  return {
    deleteFieldAsync: mutation.mutateAsync,
    deleteField: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useGetFormSubmissions = (formId: string) => {
  const query = trpc.form.getFormSubmissions.useQuery(
    { formId },
    { enabled: Boolean(formId) }
  );

  return {
    submissions: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
