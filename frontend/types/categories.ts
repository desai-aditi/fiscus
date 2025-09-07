export type CategoryType = {
  id: string,
  uid: string,
  label: string;
  value: string;
  icon: string;
  bgColor: string;
  updated_at: string;
  deleted_at: string;
};
export type ExpenseCategoriesType = {
  [key: string]: CategoryType;
};