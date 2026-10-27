// '미분류' is not a row in the categories table: it is every quote whose
// category_id is null. Deleting a category nulls its quotes' category_id
// (on delete set null), so they land here without any extra work.
export const UNCATEGORIZED_ID = '__uncategorized__'
export const UNCATEGORIZED_NAME = '미분류'
