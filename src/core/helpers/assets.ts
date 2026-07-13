import { illustrationsSet } from "@/core/helpers/config";

export const getIllustrationsPath = (illustrationName: string): string => {
  return `platform/media/illustrations/${illustrationsSet.value}/${illustrationName}`;
};
