/**
 * Ids of the rows in the `status` table.
 *
 * Adjust the numbers if the database uses different ids.
 */
export const STATUS_IDS = {
    TODO: 1,
    IN_PROGRESS: 2,
    AWAIT_FEEDBACK: 3,
    DONE: 4
} as const;

/** One column of the board. */
export interface StatusColumn {
    id: number;
    name: string;
}

/** Board columns in display order. */
export const BOARD_COLUMNS: readonly StatusColumn[] = [
    { id: STATUS_IDS.TODO, name: 'To do' },
    { id: STATUS_IDS.IN_PROGRESS, name: 'In progress' },
    { id: STATUS_IDS.AWAIT_FEEDBACK, name: 'Await feedback' },
    { id: STATUS_IDS.DONE, name: 'Done' }
];
