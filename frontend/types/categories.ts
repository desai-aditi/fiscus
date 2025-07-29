export type CategoryType = {
  label: string;
  value: string;
  icon: string;
  bgColor: string;
};
export type ExpenseCategoriesType = {
  [key: string]: CategoryType;
};