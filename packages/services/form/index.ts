import db, { eq, asc, formsTable, formFieldsTable } from "@repo/database";

import { createFormInput, CreateFormInputType, getFormByIdInput, GetFormByIdInputType, listFormsByUserIdInput, listFormsByUserIdInputType } from "./model";

class FormService {

    public async createForm(payload: CreateFormInputType) {
        const { title, description, createdBy } = await createFormInput.parseAsync(payload)

        const result = await db
            .insert(formsTable)
            .values({ title, description, createdBy })
            .returning({ id: formsTable.id, })
        if (!result || result.length === 0 || !result[0]?.id) throw new Error(`Something went wrong while creating the form`)

        return { id: result[0].id }

    }

    public async getFormListByUserId(payload: listFormsByUserIdInputType) {
        const { userId } = await listFormsByUserIdInput.parseAsync(payload)
        //this userId will go into where query of db
        const forms = await db.select({
            id: formsTable.id,
            title: formsTable.title,
            description: formsTable.description,
            createdAt: formsTable.createdAt,
            updatedAt: formsTable.updatedAt,
        }).from(formsTable).where(eq(formsTable.createdBy, userId))

        return forms
    }

    public async getFormById(payload: GetFormByIdInputType) {
        const { formId } = await getFormByIdInput.parseAsync(payload)

        const rows = await db
            .select({
                id: formsTable.id,
                title: formsTable.title,
                description: formsTable.description,
                createdAt: formsTable.createdAt,
                updatedAt: formsTable.updatedAt,
                field: {
                    id: formFieldsTable.id,
                    label: formFieldsTable.label,
                    labelKey: formFieldsTable.labelKey,
                    type: formFieldsTable.type,
                    description: formFieldsTable.description,
                    placeholder: formFieldsTable.placeholder,
                    isRequired: formFieldsTable.isRequired,
                    index: formFieldsTable.index,
                },
            })
            .from(formsTable)
            .leftJoin(formFieldsTable, eq(formFieldsTable.formId, formsTable.id))
            .where(eq(formsTable.id, formId))
            .orderBy(asc(formFieldsTable.index))

        if (rows.length === 0) return null

        const { id, title, description, createdAt, updatedAt } = rows[0]!
        const fields: Array<{
            id: string;
            label: string;
            labelKey: string;
            type: "TEXT" | "NUMBER" | "EMAIL" | "YES_NO" | "PASSWORD";
            description: string | null;
            placeholder: string | null;
            isRequired: boolean;
            index: string;
        }> = []

        for (const row of rows) {
            if (
                row.field &&
                row.field.id &&
                row.field.label &&
                row.field.labelKey &&
                row.field.type &&
                row.field.index
            ) {
                fields.push({
                    id: row.field.id,
                    label: row.field.label,
                    labelKey: row.field.labelKey,
                    type: row.field.type as "TEXT" | "NUMBER" | "EMAIL" | "YES_NO" | "PASSWORD",
                    description: row.field.description ?? null,
                    placeholder: row.field.placeholder ?? null,
                    isRequired: Boolean(row.field.isRequired),
                    index: row.field.index,
                })
            }
        }

        return { id, title, description, createdAt, updatedAt, fields }
    }






}
export default FormService
